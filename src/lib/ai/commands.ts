import { AISettings } from '@/types';
import { callAI } from './client';
import {
  rewritePrompt,
  organizePrompt,
  formatPrompt,
  summarizePrompt,
  titlePrompt,
} from './prompts';

export type AICommand =
  'rewrite' | 'organize' | 'format' | 'summarize' | 'title';

export async function runAICommand(
  command: AICommand,
  html: string,
  settings: AISettings,
): Promise<string> {
  let messages;
  switch (command) {
    case 'rewrite':
      messages = rewritePrompt(html);
      break;
    case 'organize':
      messages = organizePrompt(html);
      break;
    case 'format':
      messages = formatPrompt(html);
      break;
    case 'summarize':
      messages = summarizePrompt(html);
      break;
    case 'title':
      messages = titlePrompt(html);
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
  return callAI(settings, messages);
}
