export type ChatTurn = { role: 'user' | 'assistant'; content: string };
export type LlmMessage = { role: 'system' | 'user' | 'assistant'; content: string };
