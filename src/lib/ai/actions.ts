// Everything an AI action needs between "the user picked one" and "here is
// the result": the action table, the provider table, the request, and
// cleaning up what the model sends back. No React; the network call is
// injectable so this runs under `node --test`.

import type { AIProvider, AISettings } from '../../types.ts';
import { plainText } from '../workspace.ts';
import {
  type AIMessage,
  formatPrompt,
  organizePrompt,
  rewritePrompt,
  summarizePrompt,
  titlePrompt,
} from './prompts.ts';

// ── Actions ─────────────────────────────────────────────────────

export type AIResult =
  | { kind: 'content'; html: string } // replaces the panel's content
  | { kind: 'title'; text: string }; // becomes the panel's title

export interface AIAction {
  id: string;
  label: string;
  description: string;
  kind: AIResult['kind'];
  prompt: (panelHtml: string) => AIMessage[];
}

// Adding an action is one row here (plus, optionally, an icon in the menu).
export const AI_ACTIONS: readonly AIAction[] = [
  {
    id: 'rewrite',
    label: 'Rewrite',
    description: 'Fix grammar and improve clarity',
    kind: 'content',
    prompt: rewritePrompt,
  },
  {
    id: 'organize',
    label: 'Organize',
    description: 'Sort and group bullet points',
    kind: 'content',
    prompt: organizePrompt,
  },
  {
    id: 'format',
    label: 'Format',
    description: 'Add headings and hierarchy',
    kind: 'content',
    prompt: formatPrompt,
  },
  {
    id: 'summarize',
    label: 'Summarize',
    description: 'Condense to key bullet points',
    kind: 'content',
    prompt: summarizePrompt,
  },
  {
    id: 'title',
    label: 'Generate Title',
    description: 'Suggest a title for this panel',
    kind: 'title',
    prompt: titlePrompt,
  },
];

export const MAX_TITLE_LENGTH = 60;

// ── Providers ───────────────────────────────────────────────────

export interface AIProviderInfo {
  id: AIProvider;
  label: string;
  baseURL: string; // empty for custom: the user supplies it
  defaultModel: string;
  keyPlaceholder: string;
}

export const AI_PROVIDERS: readonly AIProviderInfo[] = [
  {
    id: 'gemini',
    label: 'Gemini (Google)',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: 'gemini-3.6-flash',
    keyPlaceholder: 'AIza…',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    keyPlaceholder: 'sk-…',
  },
  {
    id: 'custom',
    label: 'Custom (OpenAI-compatible)',
    baseURL: '',
    defaultModel: '',
    keyPlaceholder: 'Your API key',
  },
];

export function providerInfo(
  provider: AIProvider | '',
): AIProviderInfo | undefined {
  return AI_PROVIDERS.find((p) => p.id === provider);
}

// The URL requests will actually go to. `customBaseURL` only counts when
// the provider is custom.
export function effectiveBaseURL(settings: AISettings): string {
  if (settings.provider === 'custom') return settings.customBaseURL.trim();
  return providerInfo(settings.provider)?.baseURL ?? '';
}

// The settings change for picking a provider: a built-in one resets the
// model to its default; custom keeps whatever model was typed.
export function switchProvider(provider: AIProvider | ''): Partial<AISettings> {
  const info = providerInfo(provider);
  return info && info.id !== 'custom'
    ? { provider, model: info.defaultModel }
    : { provider };
}

// ── Running ─────────────────────────────────────────────────────

export interface AIOptions {
  fetch?: typeof fetch; // defaults to the global one
  signal?: AbortSignal; // abort to cancel; the promise then rejects
}

// Runs one action on a panel's content. Rejects with a message fit to show
// the user when the panel is empty, the settings are incomplete, the
// provider reports an error, or the answer is empty.
export async function runAction(
  actionId: string,
  panelHtml: string,
  settings: AISettings,
  options: AIOptions = {},
): Promise<AIResult> {
  const action = AI_ACTIONS.find((a) => a.id === actionId);
  if (!action) throw new Error(`Unknown AI action: ${actionId}`);
  if (plainText(panelHtml) === '') throw new Error('This panel is empty.');

  const answer = await chat(settings, action.prompt(panelHtml), options);

  if (action.kind === 'title') {
    const text = cleanTitle(answer);
    if (!text) throw new Error('The AI returned an empty title.');
    return { kind: 'title', text };
  }
  const html = stripCodeFence(answer);
  if (plainText(html) === '')
    throw new Error('The AI returned an empty result.');
  return { kind: 'content', html };
}

// Resolves if the provider answers with the current settings; rejects with
// the reason otherwise.
export async function testConnection(
  settings: AISettings,
  options: AIOptions = {},
): Promise<void> {
  await chat(
    settings,
    [{ role: 'user', content: 'Reply with exactly the word: ok' }],
    options,
  );
}

// ── Internals ───────────────────────────────────────────────────

async function chat(
  settings: AISettings,
  messages: AIMessage[],
  options: AIOptions,
): Promise<string> {
  if (!settings.apiKey)
    throw new Error('No API key configured. Set one in Settings → AI.');
  if (!settings.provider)
    throw new Error('No AI provider selected. Choose one in Settings → AI.');
  const baseURL = effectiveBaseURL(settings);
  if (!baseURL) throw new Error('No base URL configured.');

  const model =
    settings.model.trim() ||
    (providerInfo(settings.provider)?.defaultModel ?? '');
  const send =
    options.fetch ?? ((...args: Parameters<typeof fetch>) => fetch(...args));

  const res = await send(`${baseURL.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.3 }),
    signal: options.signal,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      // Gemini's OpenAI-compatible endpoint wraps errors in an array:
      // [{error:{...}}]. Others use a plain object: {error:{...}}.
      const errObj = Array.isArray(body) ? body[0] : body;
      const message: unknown = errObj?.error?.message;
      // Keep only the first line — the rest is verbose quota detail.
      detail =
        typeof message === 'string' && message
          ? message.split('\n')[0].trim()
          : JSON.stringify(body);
    } catch {
      detail = res.statusText || `HTTP ${res.status}`;
    }
    throw new Error(`API error ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const content: unknown = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim())
    throw new Error('Empty response from AI.');
  return content;
}

// Models wrap answers in ```html fences despite being told not to.
function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = /^```[\w-]*[ \t]*\r?\n([\s\S]*?)\r?\n?```$/.exec(trimmed);
  return (fenced ? fenced[1] : trimmed).trim();
}

// One plain line, no markup, no wrapping quotes, at most MAX_TITLE_LENGTH.
function cleanTitle(answer: string): string {
  const firstLine =
    plainText(stripCodeFence(answer))
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean) ?? '';
  return firstLine
    .replace(/^["'`“”‘’]+|["'`“”‘’]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TITLE_LENGTH)
    .trim();
}
