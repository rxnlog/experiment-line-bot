import { createOpenAI } from '@ai-sdk/openai';

// Initialize OpenRouter client
const openRouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
});

// Use Gemini Flash model via OpenRouter
export const aiModel = openRouter('google/gemini-2.5-flash-lite');
