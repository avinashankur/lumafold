import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FLOATING_BOUNDS,
  MIN_FLOATING_WIDTH,
  MIN_FLOATING_HEIGHT,
  sanitizeBounds,
} from './floating-window.ts';

test('sanitizeBounds: returns default bounds when undefined or null', () => {
  assert.deepEqual(sanitizeBounds(), DEFAULT_FLOATING_BOUNDS);
  assert.deepEqual(sanitizeBounds(null), DEFAULT_FLOATING_BOUNDS);
  assert.deepEqual(sanitizeBounds({}), DEFAULT_FLOATING_BOUNDS);
});

test('sanitizeBounds: clamps minimum dimensions', () => {
  const result = sanitizeBounds({ width: 100, height: 150 });
  assert.equal(result.width, DEFAULT_FLOATING_BOUNDS.width);
  assert.equal(result.height, DEFAULT_FLOATING_BOUNDS.height);

  const exactMin = sanitizeBounds({
    width: MIN_FLOATING_WIDTH,
    height: MIN_FLOATING_HEIGHT,
  });
  assert.equal(exactMin.width, MIN_FLOATING_WIDTH);
  assert.equal(exactMin.height, MIN_FLOATING_HEIGHT);
});

test('sanitizeBounds: preserves valid custom dimensions', () => {
  const result = sanitizeBounds({ width: 500, height: 700 });
  assert.equal(result.width, 500);
  assert.equal(result.height, 700);
  assert.equal(result.left, undefined);
  assert.equal(result.top, undefined);
});

test('sanitizeBounds: omits non-finite or NaN left/top', () => {
  assert.deepEqual(
    sanitizeBounds({ width: 400, height: 600, left: NaN, top: 100 }),
    { width: 400, height: 600 },
  );
  assert.deepEqual(
    sanitizeBounds({
      width: 400,
      height: 600,
      left: 100,
      top: Infinity,
    }),
    { width: 400, height: 600 },
  );
});

test('sanitizeBounds: allows coordinates when within existing window bounds', () => {
  const existingWindows = [{ left: 0, top: 0, width: 1920, height: 1080 }];
  const bounds = { width: 380, height: 540, left: 200, top: 150 };

  const result = sanitizeBounds(bounds, existingWindows);
  assert.deepEqual(result, bounds);
});

test('sanitizeBounds: omits coordinates when off-screen on unplugged right monitor', () => {
  // Only primary monitor (0 to 1920) exists now, but bounds were on 2nd monitor at left: 2500
  const existingWindows = [{ left: 0, top: 0, width: 1920, height: 1080 }];
  const bounds = { width: 380, height: 540, left: 2500, top: 150 };

  const result = sanitizeBounds(bounds, existingWindows);
  assert.equal(result.width, 380);
  assert.equal(result.height, 540);
  assert.equal(result.left, undefined);
  assert.equal(result.top, undefined);
});

test('sanitizeBounds: omits coordinates when off-screen on unplugged left monitor', () => {
  // Only primary monitor (0 to 1920) exists now, but bounds were on left monitor at left: -1920
  const existingWindows = [{ left: 0, top: 0, width: 1920, height: 1080 }];
  const bounds = { width: 380, height: 540, left: -1500, top: 150 };

  const result = sanitizeBounds(bounds, existingWindows);
  assert.equal(result.left, undefined);
  assert.equal(result.top, undefined);
});

test('sanitizeBounds: omits coordinates when off-screen vertically', () => {
  const existingWindows = [{ left: 0, top: 0, width: 1920, height: 1080 }];
  const bounds = { width: 380, height: 540, left: 100, top: 2000 };

  const result = sanitizeBounds(bounds, existingWindows);
  assert.equal(result.left, undefined);
  assert.equal(result.top, undefined);
});
