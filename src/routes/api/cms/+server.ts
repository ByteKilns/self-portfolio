import { json } from '@sveltejs/kit';
import { dev } from '$app/env';
import { devOnly } from '#lib/server/cms/guard.ts';
import { readContent, writeContent } from '#lib/server/cms/store.ts';

export async function GET() {
  devOnly(dev);
  return json(await readContent());
}

export async function PUT({ request }: { request: Request }) {
  devOnly(dev);
  try {
    const saved = await writeContent(await request.json());
    return json({ ok: true, savedAt: saved.savedAt });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'invalid content' },
      { status: 400 }
    );
  }
}
