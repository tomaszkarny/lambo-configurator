# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — dev server (Next.js 16.1 + Turbopack, port 3000)
- `npm run build` — production build
- `npm run lint` — ESLint (flat config, `next/core-web-vitals` + `next/typescript`)
- No test runner configured

## Stack

Next.js 16.1 (App Router + Turbopack) · React 19.2 · TypeScript 5 (strict) · Three.js r182 · React Three Fiber 9 · Drei 10 · `@react-three/postprocessing` 3 · Zustand 5 (persist middleware) · Framer Motion 12 · GSAP 3 + ScrollTrigger · Lenis 1.3 · Tailwind 4.

## Architecture

This is a **3D Lamborghini Terzo Millennio configurator** built as a scroll-driven landing page with an embedded interactive configurator section. A single R3F `<Canvas>` drives the entire experience — there is no route transition when the user enters the configurator.

### Two rendering modes, one Canvas

`src/components/landing/ScrollCanvas.tsx` is the only `<Canvas>` mounted on `/`. It holds:

- `ScrollCameraController` — always mounted, drives the camera along a Catmull-Rom spline while `isConfigurator` is false, returns early otherwise
- `CameraController` — mounted only while `isConfigurator` is true, adds `OrbitControls` and camera-preset animation

Switching is governed by `useScrollStore.isConfigurator`, set from `useScrollProgress` based on the active section index. See "Scroll alignment invariants" below — this flag is the single source of truth for handing control between scroll-driven camera and user-driven OrbitControls. Never compute it ad-hoc from raw scroll progress.

`src/components/scene/SceneCanvas.tsx` also exists as a standalone configurator-only canvas (used by the legacy `Configurator.tsx` entry point); production uses `ScrollCanvas.tsx` exclusively.

### Entry points (two, read this)

- `app/page.tsx` → `LandingPage.tsx` — **the production entry point**. Sticky-canvas scroll experience.
- `src/components/ui/Configurator.tsx` — **legacy standalone** (fixed viewport, no landing). Still in the codebase; it contains the URL-param hydration logic (`deserializeConfig`) which has **not** been ported to `LandingPage`. If you need shareable URLs on the landing page, port the `useEffect` from `Configurator.tsx:24`.

### Scroll alignment invariants (critical)

Four files encode the same section boundaries and **must stay in sync**. A mismatch causes subtle bugs like "colors don't update in the configurator" (the symptom is that the `configurator` scroll zone no longer maps to the `#configurator` DOM section, so ScrollEffects keeps overwriting user picks):

| File | What it encodes |
|---|---|
| `src/config/landing-content.ts` | Section heights (`200vh / 100vh / 300vh / 150vh / 100vh / 100vh / 50vh` = 1000vh total, 900vh scrollable) |
| `src/hooks/useScrollProgress.ts` | Section index thresholds (drives `activeSection` and `isConfigurator`) |
| `src/components/landing/ScrollEffects.tsx` | `getScrollZone(p)` zone boundaries (10 zones, finer-grained than sections) |
| `src/config/scroll-camera-path.ts` | Camera keyframe `progress` values (11 keyframes) |

If you change section heights in `landing-content.ts`, recompute the progress boundaries in the three other files. The header comments in `useScrollProgress.ts:16-23` and `ScrollEffects.tsx:21-33` spell out the math.

### Zone-based scroll effects (`ScrollEffects.tsx`)

`ScrollEffects` runs inside the Canvas and drives color/material/wing/part state from scroll position. Two critical patterns:

1. **Every zone applies a full self-contained state via `store.batchUpdate({...})`.** Fast scrolling can skip intermediate zones entirely — if a zone only sets `bodyColor` and relies on a previous zone to set `accentColor`, a fast scroll will leave stale accents. Always batch the full set: `bodyColor`, `accentColor`, `lightColor`, `lightIntensity`, `wingsOpen`. Then call `store.resetInteractive()` to clear part toggles and explode.

2. **The `isConfigurator` guard is the authoritative "hands off" signal.** `ScrollEffects` reads `useScrollStore.getState().isConfigurator` every frame and returns early when true, so user color picks in the configurator are not overwritten. Do not replace this with local zone-boundary math — the configurator zone math and the section boundary math disagreed in the past and that's what caused colors to revert while the user was clicking swatches.

### State management

Two Zustand stores (both `'use client'`):

- **`useConfigStore`** (`src/store/useConfigStore.ts`) — car configuration. Persists to `localStorage` under key `lambo-config` via `persist` middleware. `partialize` deliberately **only** persists colors/materials (`bodyColor`, `bodyMaterial`, `wheelColor`, `wheelMaterial`, `lightColor`, `lightIntensity`, `accentColor`, `windowTint`, `windowOpacity`). `wingsOpen`, `partStates`, `explodeAmount` are scroll-driven and must NOT persist. Exposes a `batchUpdate(partial)` action — use this inside ScrollEffects instead of calling individual setters (avoids multiple emits per frame).

- **`useScrollStore`** (`src/store/useScrollStore.ts`) — scroll progress (0-1), `activeSection` index, `isConfigurator` flag. Not persisted.

#### Reading the store inside `useFrame`

**Never use hook selectors (`useConfigStore((s) => ...)`) inside `useFrame`.** Every store update would trigger a React re-render of the R3F component. Instead, read imperatively: `useConfigStore.getState().partStates`. This is how `CarModel.tsx:283-284` and `ScrollEffects.tsx:197-200` access the store. Hook selectors are fine at the top of a component for values that should trigger a React update (e.g. `useEffect` dependencies).

### Material system

The GLTF has 47 materials and 115 meshes. Only 5 are exposed to the UI as "part groups": `body`, `wheels`, `lights`, `accents`, `windows`. The mapping lives in `src/config/parts.ts` (`materialToPartGroup`). Everything else is in `immutableMaterials` and is left untouched. `getMeshGroup()` in `src/lib/mesh-classifier.ts` is the lookup helper.

**One shared material per group** — `CarModel.tsx:80-138` traverses the scene once, creates a single `MeshPhysicalMaterial` / `MeshStandardMaterial` per group (`createMaterialForGroup` factory), and replaces each mesh's per-mesh material with the shared instance. This is what makes `body.color = ...` update 17 meshes at once.

#### Color update data flow (not reactive re-render)

Colors animate via frame-by-frame lerp in `useFrame`, NOT React state:

1. User/ScrollEffects calls `store.setBodyColor('#...')` → store emits new `bodyColor`
2. `CarModel.tsx:71` `useEffect` fires, updates `colors.current.body.target` (a `THREE.Color` ref) and calls `invalidate()`
3. `useFrame` at `CarModel.tsx:248` lerps `colors.current.body.current` toward `.target` using `t = 1 - exp(-10 * delta)` (frame-rate independent) and copies the result onto the shared material's `.color`
4. `needsRender` flag → `state.invalidate()` only when something actually changed

Adding a new color-driven property means: add a useEffect to sync target, add a lerp call in useFrame, and update `createMaterialForGroup` to handle the initial value.

#### Material disposal + StrictMode safety

`CarModel.tsx:165-178` restores each mesh's original GLTF material on unmount, then disposes the shared materials, then resets the `initialized` ref. This is critical for React StrictMode — without it, the second mount reads `child.material.name` from the previously-swapped shared material (which has no meaningful `.name`) and fails to classify the meshes. Always restore originals before disposing when you create shared materials off a loaded scene.

### Interactive parts (explode view)

`src/config/interactive-parts.ts` defines 17 detachable parts with node-name prefixes, per-part toggle direction/distance, and explode direction/distance. Interactive groups in the UI toggle multiple parts together (e.g. `Wheels` toggles all 4 wheel parts).

`CarModel.tsx:298-328` lerps `toggleProgress` (0→1) and `explodeProgress` (0→store.explodeAmount) independently, then combines them into `node.position = original + dir*dist*toggleP + eDir*eDist*explodeP`. The node lookup (`findPartNode`) prefers a parent `Group` over a `Mesh` when the name prefix matches, so translating moves the whole sub-hierarchy.

### Landing page layout (sticky canvas pattern)

```
<main>
  <div sticky top-0 h-100vh z-0>     ← ScrollCanvas (always visible)
  <div id=scroll-content z-1          ← HTML overlay
       margin-top: -100vh             ← pulls HTML up over canvas
       pointerEvents: none>           ← canvas receives wheel by default
    <section pointer-events-auto?>    ← individual sections opt in to clicks
    ...
  </div>
</main>
```

The entire `#scroll-content` has `pointerEvents: none`. Sections that need clicks (`ConfiguratorSection`, `FooterSection`) set `pointer-events-auto` on their root. `ConfigPanel` is `position: fixed` outside the overlay, so it stays clickable regardless. When adding a new interactive element, either put it inside `ConfiguratorSection` or add `pointer-events-auto` to its wrapper.

### Smooth scroll + ScrollTrigger

`useSmoothScroll` (`src/hooks/useSmoothScroll.ts`) wires Lenis into GSAP's ticker: `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add(time => lenis.raf(time * 1000))`. Lenis handles inertia, ScrollTrigger reads normalized progress, and `useScrollProgress` sets `scrollProgress` into the store with `scrub: true`.

All GSAP imports must come from `src/lib/gsap-setup.ts` — it's the single place that registers the `ScrollTrigger` plugin. This file has no `'use client'` directive (it's a library module, imported by client files).

### Exponential damping (frame-rate independent)

Camera smoothing and color lerp both use `alpha = 1 - Math.exp(-k * delta)` where `delta` is the per-frame time:

- `ScrollCameraController.tsx:24` — `k=6` for cinematic camera follow
- `CarModel.tsx:249` — `k=10` for color lerp (snappier)

Higher `k` = snappier response. This pattern is frame-rate independent (the exponential accounts for variable `delta`), unlike a fixed-alpha `lerp(target, 0.1)`. Use it for any time-based smoothing.

### Accessibility

- Every landing section has an `aria-label` via the `sectionLabels` map in `LandingPage.tsx:36`
- `<main>` landmark wraps the page
- `useReducedMotion` (`src/hooks/useReducedMotion.ts`) uses `useSyncExternalStore` for SSR-safe subscription to `prefers-reduced-motion`. All custom motion components (`RevealText`, `ParallaxWrapper`, `FadeInSection`) check it and fall back to opacity-only or no-op
- `globals.css` adds a `prefers-reduced-motion: reduce` block that disables the grain overlay and caps animation durations globally
- `globals.css` has `focus-visible` outline for keyboard nav
- Toggles in `ConfigPanel` / `InteractiveControls` use `role="switch"` + `aria-checked`
- `CollapsibleSection` in `ConfigPanel` uses `aria-expanded`
- `LoadingScreen` has `role="status"` + `role="progressbar"` with `aria-valuenow`

### ConfigPanel layout

`ConfigPanel.tsx` is a collapsible accordion. The primary block (PartSelector + ColorPicker + MaterialPicker + conditional lights/windows slider) stays visible; `CollapsibleSection`s for Camera & View, Interactive Parts, and Presets default to collapsed. This was done to keep the 280px fixed sidebar short enough that its overflow doesn't bleed over the `ColorShowcase` text beneath.

Mobile variant is a bottom drawer (`max-h-[70vh] overflow-y-auto`), toggled by the always-visible handle at the bottom.

### URL param hydration

`src/lib/url-state.ts` serializes/deserializes a subset of config to query string (`?bc=xxxxxx&bm=glossy...`). `deserializeConfig` validates: `VALID_MATERIALS` set for `bodyMaterial`/`wheelMaterial`, `lightIntensity` clamped to `0-10`, `windowOpacity` clamped to `0.05-0.8`. This hydration is currently only wired into the legacy `Configurator.tsx:25` entry point, NOT into `LandingPage`.

### Path aliases

`@/*` maps to `./src/*` (see `tsconfig.json`).

### 3D model

- Production: `public/models/lambo_clean.glb` (Draco compressed, ~1.7MB)
- Source: `free__lamborghini_terzo_millennio/scene.gltf` (47 materials, 115 meshes — **not** used at runtime, reference only)
- Orientation: Y = up, +Z = front, +X = right
- Animation: single clip named `"Animation"` for wing open/close, played with `timeScale ±1`, `LoopOnce` + `clampWhenFinished`

Decal meshes from the original model (hard-coded node names + meshes with material `"Material.001"` + `"Orange"` material meshes on any `skirt*` parent) are hidden in `CarModel.tsx:88-122`.

### Key rendering decisions

- `frameloop="always"` on `ScrollCanvas` — scroll-driven camera, color lerp, and explode animations need continuous updates
- `frameloop="demand"` on standalone `SceneCanvas` — configurator-only, `invalidate()` on change
- `alpha: false` on the GL context (landing page is always on a dark background; saves a compositing pass)
- DPR capped at `[1, 1.5]` on desktop, `[1, 1]` on mobile
- Mobile windows use plain `transparent: true` instead of `transmission` (skips the extra render pass)
- Post-processing (`PostProcessing.tsx`) uses `Bloom` + `ToneMapping` (ACES) on both, plus `SMAA` on desktop only. Bloom levels: 5 desktop / 3 mobile.
- Shadows: `shadowSize = 2048` desktop / `1024` mobile (`Lighting.tsx:7`)
- Environment: `preset="night"` with `environmentIntensity={1.2}`, `background={false}` (dark scene, the dark `Floor` plane absorbs the studio reflection)

## Known gotchas

- **ColorShowcaseSection writes to the store every 2.5s** while the color-showcase scroll zone is active (`activeSection === 3`). This is a second writer alongside `ScrollEffects`. Don't add a third writer into the same zone without reasoning about interleaving.
- **`ColorPicker` links `lights` and `accents`** — changing either one sets both, because the visible orange glow lines use the `accents` (material name `Orange`) group but users perceive them as "lights". Don't "fix" this without testing the visual result.
- **Hydration mismatch warning** in dev is from a browser extension, not app code. The app is fully client-side for the Canvas (`dynamic(() => import('./ScrollCanvas'), { ssr: false })`).
- **Wing animation clip name is literally `"Animation"`** (the default from the source GLTF). `useAnimations` indexes by that exact string.
