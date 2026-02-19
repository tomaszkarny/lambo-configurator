import type { ConfigState } from '@/types/configurator';

const URL_KEYS: Record<string, keyof ConfigState> = {
  bc: 'bodyColor',
  bm: 'bodyMaterial',
  wc: 'wheelColor',
  wm: 'wheelMaterial',
  lc: 'lightColor',
  li: 'lightIntensity',
  ac: 'accentColor',
  wt: 'windowTint',
  wo: 'windowOpacity',
  wi: 'wingsOpen',
};

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
  if (bm) config.bodyMaterial = bm as ConfigState['bodyMaterial'];

  const wc = params.get('wc');
  if (wc) config.wheelColor = `#${wc}`;

  const wm = params.get('wm');
  if (wm) config.wheelMaterial = wm as ConfigState['wheelMaterial'];

  const lc = params.get('lc');
  if (lc) config.lightColor = `#${lc}`;

  const li = params.get('li');
  if (li) config.lightIntensity = parseFloat(li);

  const ac = params.get('ac');
  if (ac) config.accentColor = `#${ac}`;

  const wt = params.get('wt');
  if (wt) config.windowTint = `#${wt}`;

  const wo = params.get('wo');
  if (wo) config.windowOpacity = parseFloat(wo);

  const wi = params.get('wi');
  if (wi === '1') config.wingsOpen = true;

  return config;
}
