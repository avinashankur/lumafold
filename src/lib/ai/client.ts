import { AISettings } from '@/types';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const PROVIDER_CONFIGS: Record<
  string,
  { baseURL: string; defaultModel: string }
> = {
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: 'gemini-3.6-flash',
  },
  openai: {
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
  },
};

export function getDefaultModel(provider: string): string {
  return PROVIDER_CONFIGS[provider]?.defaultModel ?? '';
}

export function getDefaultBaseURL(provider: string): string {
  return PROVIDER_CONFIGS[provider]?.baseURL ?? '';
}

export async function callAI(
  settings: AISettings,
  messages: AIMessage[],
): Promise<string> {
  const { apiKey, provider, model, customBaseURL } = settings;

  if (!apiKey)
    throw new Error('No API key configured. Set one in Settings → AI.');
  if (!provider)
    throw new Error('No AI provider selected. Choose one in Settings → AI.');

  const baseURL =
    provider === 'custom'
      ? customBaseURL
      : (PROVIDER_CONFIGS[provider]?.baseURL ?? '');

  if (!baseURL) throw new Error('No base URL configured.');

  const resolvedModel =
    model.trim() || (PROVIDER_CONFIGS[provider]?.defaultModel ?? '');

  const endpoint = `${baseURL.replace(/\/$/, '')}/chat/completions`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: resolvedModel,
      messages,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      // Gemini's OpenAI-compatible endpoint wraps errors in an array: [{error:{...}}]
      // OpenAI-compatible endpoints use a plain object: {error:{...}}
      const errObj = Array.isArray(body) ? body[0] : body;
      const message: string | undefined = errObj?.error?.message;
      if (message) {
        // Keep only the first sentence — the rest is verbose quota detail
        detail = message.split('\n')[0].trim();
      } else {
        detail = JSON.stringify(body);
      }
    } catch {
      detail = res.statusText || `HTTP ${res.status}`;
    }
    throw new Error(`API error ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI.');
  return content as string;
}
