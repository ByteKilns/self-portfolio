import { json } from '@sveltejs/kit';
import { dev } from '$app/env';
import { devOnly } from '#lib/server/cms/guard.ts';
import { saveImage } from '#lib/server/cms/store.ts';

export async function POST({ request }: { request: Request }) {
  devOnly(dev);
  try {
    const data = await request.formData();
    const file = data.get('file');
    const name = data.get('name');
    if (!(file instanceof File)) {
      return json({ error: 'file is required' }, { status: 400 });
    }
    const path = await saveImage(
      new Uint8Array(await file.arrayBuffer()),
      typeof name === 'string' ? name : ''
    );
    return json({ path });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'upload failed' },
      { status: 400 }
    );
  }
}
