import { test } from 'node:test';
import assert from 'node:assert/strict';
import { render } from './counter.mjs';

test('D-R1: render returns "Count: <n>" for non-negative integers', () => {
  assert.equal(render(0), 'Count: 0');
  assert.equal(render(1), 'Count: 1');
  assert.equal(render(42), 'Count: 42');
});

test('D-R2: render throws TypeError for negative numbers', () => {
  assert.throws(() => render(-1), TypeError);
  assert.throws(() => render(-0.5), TypeError);
});

test('D-R2: render throws TypeError for non-integers', () => {
  assert.throws(() => render(1.5), TypeError);
  assert.throws(() => render(NaN), TypeError);
  assert.throws(() => render(Infinity), TypeError);
});

test('D-R2: render throws TypeError for non-numbers', () => {
  assert.throws(() => render('1'), TypeError);
  assert.throws(() => render(null), TypeError);
  assert.throws(() => render(undefined), TypeError);
  assert.throws(() => render({}), TypeError);
  assert.throws(() => render(1n), TypeError);
});
