import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
  GEMINI_API_KEY: {
    description: 'Gemini API key used by the /api/chat endpoint'
  },
  GEMINI_MODEL: {
    description: 'Gemini model name (defaults to gemini-3.5-flash-lite)'
  }
});
