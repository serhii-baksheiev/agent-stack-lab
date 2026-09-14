import test from 'node:test';
import assert from 'node:assert/strict';
import {subscribe} from '../src/subscriptions.mjs';

test('B-R1 rejects invalid input without changing frozen records', () => {
  const state = Object.freeze([Object.freeze({id:'sub-1',email:'first@example.invalid'})]);
  for (const email of [null, 42, '', 'x@@y.z', 'x@y', 'x y@z.net', `${'a'.repeat(250)}@x.io`]) {
    assert.throws(() => subscribe(state,email), TypeError);
  }
  assert.deepEqual(state,[{id:'sub-1',email:'first@example.invalid'}]);
  assert.equal(subscribe([], 'a'.repeat(249)+'@b.co').subscription.email.length,254);
});
test('B-R2/B-R3 normalization deduplicates and immutable additions use sequential IDs', () => {
  const initial = Object.freeze([]);
  const first = subscribe(initial,'  Person@Example.Invalid  ');
  assert.equal(first.subscription.email,'person@example.invalid');
  assert.equal(first.subscription.id,'sub-1');
  assert.equal(first.created,true);
  const duplicate = subscribe(Object.freeze(first.state),'PERSON@example.invalid');
  assert.equal(duplicate.created,false);
  assert.equal(duplicate.subscription,first.subscription);
  assert.equal(duplicate.state.length,1);
  assert.deepEqual(initial,[]);
});
test('B-R4/B-R5 distinct deterministic transitions survive serialized state and fresh import', async () => {
  const first = subscribe([], 'one@example.invalid');
  const next = subscribe(first.state,'two@example.invalid');
  assert.deepEqual(next,subscribe(first.state,'two@example.invalid'));
  assert.deepEqual(next.state.map(x=>x.id),['sub-1','sub-2']);
  assert.equal(first.state.length,1);
  const fresh = await import('../src/subscriptions.mjs?restart-test');
  const replay = fresh.subscribe(JSON.parse(JSON.stringify(next.state)),' ONE@EXAMPLE.INVALID ');
  assert.equal(replay.created,false);
  assert.deepEqual(replay.state,next.state);
});
