import { dev } from '$app/env';
import { devOnly } from '#lib/server/cms/guard.ts';

export function load() {
  devOnly(dev);
}
