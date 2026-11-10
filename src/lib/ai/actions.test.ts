import test from 'node:test';
import assert from 'node:assert/strict';
import type { AISettings } from '../../types.ts';
import {
  AI_ACTIONS,
  AI_PROVIDERS,
  MAX_TITLE_LENGTH,
  effectiveBaseURL,
  providerInfo,
  runAction,
  switchProvider,
  testConnection,
} from './actions.ts';

// ── Fixtures ────────────────────────────────────────────────────

const settings: AISettings = {
  provider: 'openai',
  apiKey: 'sk-test',
  model: '',
  customBaseURL: '',
};

const NOTE = '<p>buy milk and egs</p>';

interface Call {
  url: string;
  init: RequestInit;
  body: { model: string; messages: { role: string; content: string }[] };
}

// A stand-in for fetch that records calls and answers from `respond`.
function fakeFetch(respond: (call: Call) => Response | Promise<Response>) {
  const calls: Call[] = [];
  const fetch = (async (url: string, init: RequestInit = {}) => {
    const call = { url, init, body: JSON.parse(String(init.body)) };
    calls.push(call);
    return respond(call);
  }) as unknown as typeof globalThis.fetch;
  return { fetch, calls };
}

function answering(content: unknown) {
  return fakeFetch(() =>
    Response.json({ choices: [{ message: { content } }] }),
  );
}

async function messageOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
  assert.fail('expected the call to reject');
}

// ── Tables ──────────────────────────────────────────────────────

test('action ids are unique and every action has a label and prompt', () => {
  const ids = AI_ACTIONS.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const a of AI_ACTIONS) {
    assert.ok(a.label && a.description);
    const messages = a.prompt(NOTE);
    const last = messages[messages.length - 1];
    assert.equal(last.content, NOTE);
  }
});

test('only the title action produces a title', () => {
  assert.deepEqual(
    AI_ACTIONS.filter((a) => a.kind === 'title').map((a) => a.id),
    ['title'],
  );
});

test('built-in providers have a URL and model; custom has neither', () => {
  for (const p of AI_PROVIDERS) {
    if (p.id === 'custom') {
      assert.equal(p.baseURL, '');
      assert.equal(p.defaultModel, '');
    } else {
      assert.match(p.baseURL, /^https:\/\//);
      assert.ok(p.defaultModel);
    }
  }
  assert.equal(providerInfo(''), undefined);
});

// ── Provider settings ───────────────────────────────────────────

test('effectiveBaseURL ignores the custom URL unless the provider is custom', () => {
  const stale = { ...settings, customBaseURL: 'https://old.example/v1' };
  assert.equal(effectiveBaseURL(stale), 'https://api.openai.com/v1');
  assert.equal(
    effectiveBaseURL({ ...stale, provider: 'custom' }),
    'https://old.example/v1',
  );
  assert.equal(effectiveBaseURL({ ...settings, provider: '' }), '');
});

test('switching to a built-in provider resets the model and leaves the custom URL alone', () => {
  const change = switchProvider('gemini');
  assert.equal(change.provider, 'gemini');
  assert.equal(change.model, providerInfo('gemini')?.defaultModel);
  assert.equal('customBaseURL' in change, false);
});

test('switching to custom keeps the typed model and URL', () => {
  assert.deepEqual(switchProvider('custom'), { provider: 'custom' });
  assert.deepEqual(switchProvider(''), { provider: '' });
});

// ── The request ─────────────────────────────────────────────────

test('runAction posts the prompt to the provider with the key', async () => {
  const { fetch, calls } = answering('<p>Buy milk and eggs.</p>');
  await runAction('rewrite', NOTE, settings, { fetch });

  assert.equal(calls.length, 1);
  const [call] = calls;
  assert.equal(call.url, 'https://api.openai.com/v1/chat/completions');
  assert.equal(call.init.method, 'POST');
  const headers = call.init.headers as Record<string, string>;
  assert.equal(headers.Authorization, 'Bearer sk-test');
  assert.equal(call.body.model, 'gpt-4o');
  assert.equal(call.body.messages[0].role, 'system');
  assert.deepEqual(call.body.messages[call.body.messages.length - 1], {
    role: 'user',
    content: NOTE,
  });
});

test('a typed model overrides the provider default', async () => {
  const { fetch, calls } = answering('<p>x</p>');
  await runAction(
    'rewrite',
    NOTE,
    { ...settings, model: ' my-model ' },
    { fetch },
  );
  assert.equal(calls[0].body.model, 'my-model');
});

test('a custom provider uses the custom URL, minus trailing slashes', async () => {
  const { fetch, calls } = answering('<p>x</p>');
  const custom: AISettings = {
    provider: 'custom',
    apiKey: 'k',
    model: 'local',
    customBaseURL: 'http://localhost:1234/v1//',
  };
  await runAction('rewrite', NOTE, custom, { fetch });
  assert.equal(calls[0].url, 'http://localhost:1234/v1/chat/completions');
});

test('the abort signal is passed to fetch', async () => {
  const { fetch, calls } = answering('<p>x</p>');
  const controller = new AbortController();
  await runAction('rewrite', NOTE, settings, {
    fetch,
    signal: controller.signal,
  });
  assert.equal(calls[0].init.signal, controller.signal);
});

test('an aborted request rejects', async () => {
  const controller = new AbortController();
  const { fetch } = fakeFetch(
    (call) =>
      new Promise((_, reject) => {
        call.init.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      }),
  );
  const pending = runAction('rewrite', NOTE, settings, {
    fetch,
    signal: controller.signal,
  });
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});

// ── Refusing to run ─────────────────────────────────────────────

test('an empty panel is refused without sending anything', async () => {
  const { fetch, calls } = answering('<p>x</p>');
  for (const empty of ['', '<p></p>', '<p>   </p>']) {
    assert.equal(
      await messageOf(runAction('rewrite', empty, settings, { fetch })),
      'This panel is empty.',
    );
  }
  assert.equal(calls.length, 0);
});

test('incomplete settings are refused without sending anything', async () => {
  const { fetch, calls } = answering('<p>x</p>');
  const run = (s: AISettings) =>
    messageOf(runAction('rewrite', NOTE, s, { fetch }));
  assert.match(await run({ ...settings, apiKey: '' }), /No API key/);
  assert.match(await run({ ...settings, provider: '' }), /No AI provider/);
  assert.match(await run({ ...settings, provider: 'custom' }), /No base URL/);
  assert.equal(calls.length, 0);
});

test('an unknown action is refused', async () => {
  const { fetch } = answering('<p>x</p>');
  assert.match(
    await messageOf(runAction('translate', NOTE, settings, { fetch })),
    /Unknown AI action/,
  );
});

// ── Provider errors ─────────────────────────────────────────────

test('an OpenAI-style error reports the first line of the message', async () => {
  const { fetch } = fakeFetch(() =>
    Response.json(
      { error: { message: 'Invalid key.\nLots of extra detail' } },
      { status: 401 },
    ),
  );
  assert.equal(
    await messageOf(runAction('rewrite', NOTE, settings, { fetch })),
    'API error 401: Invalid key.',
  );
});

test('a Gemini-style error (wrapped in an array) is read the same way', async () => {
  const { fetch } = fakeFetch(() =>
    Response.json([{ error: { message: 'Quota exceeded' } }], { status: 429 }),
  );
  assert.equal(
    await messageOf(runAction('rewrite', NOTE, settings, { fetch })),
    'API error 429: Quota exceeded',
  );
});

test('an error with no JSON body falls back to the status', async () => {
  const { fetch } = fakeFetch(
    () =>
      new Response('<html>bad gateway</html>', {
        status: 502,
        statusText: 'Bad Gateway',
      }),
  );
  assert.equal(
    await messageOf(runAction('rewrite', NOTE, settings, { fetch })),
    'API error 502: Bad Gateway',
  );
});

test('a response with no content is an error', async () => {
  for (const content of [undefined, '', '   ', 42]) {
    const { fetch } = answering(content);
    assert.equal(
      await messageOf(runAction('rewrite', NOTE, settings, { fetch })),
      'Empty response from AI.',
    );
  }
});

// ── Cleaning the answer ─────────────────────────────────────────

test('content actions return the html', async () => {
  const { fetch } = answering('  <p>Buy milk and eggs.</p>\n');
  assert.deepEqual(await runAction('rewrite', NOTE, settings, { fetch }), {
    kind: 'content',
    html: '<p>Buy milk and eggs.</p>',
  });
});

test('a surrounding code fence is stripped', async () => {
  for (const fenced of [
    '```html\n<ul><li>a</li></ul>\n```',
    '```\n<ul><li>a</li></ul>\n```',
    '  ```html\r\n<ul><li>a</li></ul>\r\n```  ',
  ]) {
    const { fetch } = answering(fenced);
    assert.deepEqual(await runAction('summarize', NOTE, settings, { fetch }), {
      kind: 'content',
      html: '<ul><li>a</li></ul>',
    });
  }
});

test('backticks inside the content are left alone', async () => {
  const html = '<p>use ```fences``` sparingly</p>';
  const { fetch } = answering(html);
  const result = await runAction('rewrite', NOTE, settings, { fetch });
  assert.deepEqual(result, { kind: 'content', html });
});

test('content that is only empty markup is an error', async () => {
  const { fetch } = answering('```html\n<p> </p>\n```');
  assert.equal(
    await messageOf(runAction('rewrite', NOTE, settings, { fetch })),
    'The AI returned an empty result.',
  );
});

test('a title is reduced to one plain line without quotes', async () => {
  const title = async (answer: string) => {
    const { fetch } = answering(answer);
    return runAction('title', NOTE, settings, { fetch });
  };
  assert.deepEqual(await title('Shopping List'), {
    kind: 'title',
    text: 'Shopping List',
  });
  assert.deepEqual(await title('"Shopping List"'), {
    kind: 'title',
    text: 'Shopping List',
  });
  assert.deepEqual(await title('“Shopping   List”\n'), {
    kind: 'title',
    text: 'Shopping List',
  });
  assert.deepEqual(await title('<h1>Shopping List</h1>'), {
    kind: 'title',
    text: 'Shopping List',
  });
  assert.deepEqual(await title('\nShopping List\nHere is why…'), {
    kind: 'title',
    text: 'Shopping List',
  });
  assert.deepEqual(await title('```\nShopping List\n```'), {
    kind: 'title',
    text: 'Shopping List',
  });
});

test('a long title is capped', async () => {
  const { fetch } = answering('word '.repeat(40));
  const result = await runAction('title', NOTE, settings, { fetch });
  assert.equal(result.kind, 'title');
  assert.ok(result.kind === 'title' && result.text.length <= MAX_TITLE_LENGTH);
  assert.ok(result.kind === 'title' && !result.text.endsWith(' '));
});

test('a title that cleans down to nothing is an error', async () => {
  const { fetch } = answering('""');
  assert.equal(
    await messageOf(runAction('title', NOTE, settings, { fetch })),
    'The AI returned an empty title.',
  );
});

// ── Test connection ─────────────────────────────────────────────

test('testConnection resolves on any answer and rejects with the reason', async () => {
  const ok = answering('ok');
  await testConnection(settings, { fetch: ok.fetch });
  assert.equal(ok.calls.length, 1);

  const bad = fakeFetch(() =>
    Response.json({ error: { message: 'Invalid key.' } }, { status: 401 }),
  );
  assert.equal(
    await messageOf(testConnection(settings, { fetch: bad.fetch })),
    'API error 401: Invalid key.',
  );
});

test('testConnection uses the same URL rule as actions', async () => {
  const { fetch, calls } = answering('ok');
  await testConnection(
    { ...settings, provider: 'gemini', customBaseURL: 'https://stale.example' },
    { fetch },
  );
  assert.equal(
    calls[0].url,
    'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  );
});
