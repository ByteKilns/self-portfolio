import { error } from '@sveltejs/kit';

export function devOnly(isDev: boolean): void {
  if (!isDev) error(404, 'Not found');
}
