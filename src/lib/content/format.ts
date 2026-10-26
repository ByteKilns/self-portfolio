export const pad = (n: number) => String(n).padStart(2, '0');

export const mono = (s: string) =>
  (s || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export const slug = (s: string) =>
  (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const host = (u: string) => {
  try {
    return new URL(u).host.replace(/^www\./, '');
  } catch {
    return '';
  }
};

export const parts = (s: string): { t: string; b: boolean }[] =>
  String(s)
    .split('**')
    .map((t, i) => ({ t, b: i % 2 === 1 }))
    .filter((p) => p.t);

export const tint = (hue: number, dark: boolean) =>
  dark
    ? `linear-gradient(135deg,oklch(0.42 0.08 ${hue}),oklch(0.17 0.035 ${hue}) 78%)`
    : `linear-gradient(135deg,oklch(0.86 0.07 ${hue}),oklch(0.97 0.02 ${hue}) 78%)`;
