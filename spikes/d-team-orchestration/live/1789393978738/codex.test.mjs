import { test } from 'node:test';
import assert from 'node:assert/strict';
import { render } from './counter.mjs';

test('D-R2: rejects non-numbers with TypeError even when string conversion throws', () => {
  const input = {
    [Symbol.toPrimitive]() {
      throw new RangeError('String conversion failed');
    },
  };

  assert.throws(() => render(input), TypeError);
});
