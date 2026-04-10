import type { ConfigState, MaterialType } from '@/types/configurator';

const VALID_MATERIALS = new Set<MaterialType>(['glossy', 'matte', 'metallic', 'satin', 'carbon']);

export function serializeConfig(state: Partial<ConfigState>): string {
  const params = new URLSearchParams();

  if (state.bodyColor) params.set('bc', state.bodyColor.replace('#', ''));
  if (state.bodyMaterial) params.set('bm', state.bodyMaterial);
  if (state.wheelColor) params.set('wc', state.wheelColor.replace('#', ''));
  if (state.wheelMaterial) params.set('wm', state.wheelMaterial);
  if (state.lightColor) params.set('lc', state.lightColor.replace('#', ''));
  if (state.lightIntensity !== undefined) params.set('li', String(state.lightIntensity));
  if (state.accentColor) params.set('ac', state.accentColor.replace('#', ''));
  if (state.windowTint) params.set('wt', state.windowTint.replace('#', ''));
  if (state.windowOpacity !== undefined) params.set('wo', String(state.windowOpacity));
  if (state.wingsOpen) params.set('wi', '1');

  return params.toString();
}

export function deserializeConfig(search: string): Partial<ConfigState> {
  const params = new URLSearchParams(search);
  const config: Partial<ConfigState> = {};

  const bc = params.get('bc');
  if (bc) config.bodyColor = `#${bc}`;

  const bm = params.get('bm');
  if (bm && VALID_MATERIALS.has(bm as MaterialType)) config.bodyMaterial = bm as MaterialType;

  const wc = params.get('wc');
  if (wc) config.wheelColor = `#${wc}`;

  const wm = params.get('wm');
  if (wm && VALID_MATERIALS.has(wm as MaterialType)) config.wheelMaterial = wm as MaterialType;

  const lc = params.get('lc');
  if (lc) config.lightColor = `#${lc}`;

  const li = params.get('li');
  if (li) {
    const val = parseFloat(li);
    if (!isNaN(val) && val >= 0 && val <= 10) config.lightIntensity = val;
  }

  const ac = params.get('ac');
  if (ac) config.accentColor = `#${ac}`;

  const wt = params.get('wt');
  if (wt) config.windowTint = `#${wt}`;

  const wo = params.get('wo');
  if (wo) {
    const val = parseFloat(wo);
    if (!isNaN(val) && val >= 0.05 && val <= 0.8) config.windowOpacity = val;
  }

  const wi = params.get('wi');
  if (wi === 'true' || wi === '1') config.wingsOpen = true;
  else if (wi === 'false') config.wingsOpen = false;

  return config;
}
