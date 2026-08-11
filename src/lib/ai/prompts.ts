import { AIMessage } from './client';

const SYSTEM_BASE = `You are a precise writing assistant. 
You receive note content in HTML format (TipTap-compatible).
You MUST return ONLY valid HTML — no markdown, no code fences, no explanation.
Preserve all existing HTML tags and structure unless the instruction requires changing them.
Never add extra wrapper elements like <html>, <body>, or <div class="...">.`;

export function rewritePrompt(html: string): AIMessage[] {
  return [
    {
      role: 'system',
      content: `${SYSTEM_BASE}
Task: Rewrite the content to improve grammar, clarity, and fluency.
Rules:
- Do NOT change the meaning, facts, or structure.
- Keep all headings, bullet points, and formatting intact.
- Fix spelling, grammar, punctuation, and awkward phrasing only.
- Return valid HTML only.`,
    },
    {
      role: 'user',
      content: html,
    },
  ];
}

export function organizePrompt(html: string): AIMessage[] {
  return [
    {
      role: 'system',
      content: `${SYSTEM_BASE}
Task: Organize and sort the items in the content.
Rules:
- Sort bullet lists (<ul>/<ol>) logically: group related items together, alphabetically within each group, or by priority/importance.
- If the content has multiple sections, sort the items within each section independently.
- Do not change the text of individual items, only their order.
- If there are no list items, return the content unchanged.
- Return valid HTML only.`,
    },
    {
      role: 'user',
      content: html,
    },
  ];
}

export function formatPrompt(html: string): AIMessage[] {
  return [
    {
      role: 'system',
      content: `${SYSTEM_BASE}
Task: Add structure and hierarchy to improve readability.
Rules:
- Add appropriate headings (<h1>, <h2>, <h3>) to separate topics.
- Convert run-on sentences into bullet lists where appropriate.
- Group related ideas under the same heading.
- Do not change the meaning or content of the notes.
- Do not add new content that wasn't in the original.
- Return valid HTML only.`,
    },
    {
      role: 'user',
      content: html,
    },
  ];
}

export function summarizePrompt(html: string): AIMessage[] {
  return [
    {
      role: 'system',
      content: `${SYSTEM_BASE}
Task: Summarize the content into a concise bullet-point list.
Rules:
- Return a <ul> with <li> items — each item is one key point.
- Capture all important ideas but remove redundancy and filler.
- Keep each bullet short (one sentence max).
- Return valid HTML only.`,
    },
    {
      role: 'user',
      content: html,
    },
  ];
}

export function titlePrompt(html: string): AIMessage[] {
  return [
    {
      role: 'system',
      content: `You are a precise title generator.
You receive note content in HTML format.
Return ONLY a plain text title — no HTML, no quotes, no explanation.
The title must be short (3–8 words), specific, and descriptive of the content.`,
    },
    {
      role: 'user',
      content: html,
    },
  ];
}
