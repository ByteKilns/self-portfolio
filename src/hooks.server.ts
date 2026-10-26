import type { Handle } from '@sveltejs/kit/hooks';
import { dev } from '$app/env';
import { devOnly } from '#lib/server/cms/guard.ts';

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;
  if (
    !dev &&
    (path === '/cms' ||
      path.startsWith('/cms/') ||
      path === '/api/cms' ||
      path.startsWith('/api/cms/'))
  ) {
    devOnly(dev);
  }
  return resolve(event);
};
