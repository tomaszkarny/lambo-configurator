import type { ColorSwatch } from '@/types/configurator';

export const bodyColors: ColorSwatch[] = [
  { name: 'Nero Nemesis', hex: '#1a1a1a' },
  { name: 'Grigio Telesto', hex: '#4a4a4a' },
  { name: 'Bianco Monocerus', hex: '#e8e8e8' },
  { name: 'Rosso Mars', hex: '#8b1a1a' },
  { name: 'Arancio Borealis', hex: '#ff6600' },
  { name: 'Giallo Orion', hex: '#e8c800' },
  { name: 'Verde Mantis', hex: '#2d6b3f' },
  { name: 'Blu Nethuns', hex: '#0a2f6b' },
  { name: 'Viola Pasifae', hex: '#3d1a6b' },
  { name: 'Blu Cepheus', hex: '#1a4f8b' },
];

export const wheelColors: ColorSwatch[] = [
  { name: 'Nero', hex: '#1a1a1a' },
  { name: 'Titanio', hex: '#6b6b6b' },
  { name: 'Argento', hex: '#b0b0b0' },
  { name: 'Oro', hex: '#8b7536' },
  { name: 'Bronzo', hex: '#6b4a2a' },
  { name: 'Rosso', hex: '#8b1a1a' },
];

export const lightColors: ColorSwatch[] = [
  { name: 'Arancio', hex: '#ff6600' },
  { name: 'Rosso', hex: '#ff1a1a' },
  { name: 'Blu Elettrico', hex: '#1a8bff' },
  { name: 'Verde Neon', hex: '#00ff66' },
  { name: 'Viola', hex: '#8b1aff' },
  { name: 'Bianco', hex: '#ffffff' },
  { name: 'Giallo', hex: '#ffcc00' },
  { name: 'Ciano', hex: '#00ffee' },
];

export const accentColors: ColorSwatch[] = [
  { name: 'Arancio', hex: '#ff6600' },
  { name: 'Rosso', hex: '#ff1a1a' },
  { name: 'Blu', hex: '#1a8bff' },
  { name: 'Verde', hex: '#00ff66' },
  { name: 'Viola', hex: '#8b1aff' },
  { name: 'Bianco', hex: '#ffffff' },
  { name: 'Giallo', hex: '#ffcc00' },
  { name: 'Ciano', hex: '#00ffee' },
];

export const windowTints: ColorSwatch[] = [
  { name: 'Clear', hex: '#ffffff' },
  { name: 'Light Smoke', hex: '#888888' },
  { name: 'Dark Smoke', hex: '#333333' },
  { name: 'Blue', hex: '#1a4f8b' },
];

export const colorsByPart = {
  body: bodyColors,
  wheels: wheelColors,
  lights: lightColors,
  accents: accentColors,
  windows: windowTints,
} as const;
