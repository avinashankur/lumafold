import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateFolderName,
  pickCandidateName,
  ONE_WORD_NAMES,
  ADJECTIVES,
  NOUNS,
} from './folderNames.ts';

test('generateFolderName returns a non-empty name matching 1-word or 2-word format', () => {
  const name = generateFolderName();
  assert.ok(
    typeof name === 'string' && name.length > 0,
    'Name must be a non-empty string',
  );

  const validPattern = /^[A-Z][a-zA-Z]+( [A-Z][a-zA-Z]+)?$/;
  assert.match(
    name,
    validPattern,
    `Expected "${name}" to match SingleWord or Two Words pattern`,
  );
});

test('generateFolderName avoids colliding with existing names', () => {
  const candidate = pickCandidateName();
  // Pass lowercase version to ensure case-insensitive collision check
  const result = generateFolderName([candidate.toLowerCase()]);
  assert.notEqual(result.toLowerCase(), candidate.toLowerCase());
});

test('generateFolderName appends numeric suffix when candidates collide on fallback', () => {
  // If we exhaust attempts by setting maxAttempts to 0 and pre-populating candidate
  const candidate = pickCandidateName();
  const existing = [candidate];
  // Generating with existing containing candidate and maxAttempts = 0 should append suffix
  const result = generateFolderName(existing, 0);
  assert.ok(
    !existing.map((e) => e.toLowerCase()).includes(result.toLowerCase()),
    `Result ${result} must not be in existing list`,
  );
});

test('word lists have substantial combinations (>1,500)', () => {
  assert.ok(
    ONE_WORD_NAMES.length >= 50,
    'Should have at least 50 one-word names',
  );
  assert.ok(ADJECTIVES.length >= 35, 'Should have at least 35 adjectives');
  assert.ok(NOUNS.length >= 35, 'Should have at least 35 nouns');
  const totalCombinations =
    ONE_WORD_NAMES.length + ADJECTIVES.length * NOUNS.length;
  assert.ok(
    totalCombinations >= 1500,
    `Expected >1500 combinations, got ${totalCombinations}`,
  );
});
