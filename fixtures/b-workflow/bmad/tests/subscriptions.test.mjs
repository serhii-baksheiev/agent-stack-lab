import test from 'node:test';
import assert from 'node:assert/strict';
import { subscribe } from '../src/subscriptions.mjs';
test('validation and boundary', () => {
  const state=Object.freeze([]);
  for(const value of [null,undefined,1,{},'', 'a@b','a b@c.d','a@@b.c','a@b.c\nx']) assert.throws(()=>subscribe(state,value),TypeError);
  const max='x'.repeat(250)+'@a.b';assert.equal(max.length,254);
  assert.equal(subscribe(state,max).subscription.email,max);
  assert.throws(()=>subscribe(state,'x'+max),TypeError);assert.deepEqual(state,[]);
});
test('duplicate identity', () => {
  const record=Object.freeze({id:'sub-1',email:'a@b.c'}), state=Object.freeze([record]);
  const result=subscribe(state,'  A@B.C  ');assert.equal(result.subscription,record);assert.equal(result.state,state);assert.equal(result.created,false);
});
test('immutable creation', () => {
  const record=Object.freeze({id:'sub-1',email:'a@b.c'}),state=Object.freeze([record]);
  const result=subscribe(state,' X@Y.Z ');assert.deepEqual(result.subscription,{id:'sub-2',email:'x@y.z'});assert.equal(result.created,true);assert.equal(state.length,1);assert.equal(result.state[0],record);assert.notEqual(result.state,state);
});
test('distinct and deterministic',()=>{const a=subscribe([],'a@b.c');const b=subscribe(a.state,'b@b.c');assert.equal(b.state.length,2);assert.deepEqual(subscribe(a.state,'b@b.c'),b);});
test('restart',async()=>{const original=subscribe([],'a@b.c');const restored=JSON.parse(JSON.stringify(original.state));const fresh=await import('../src/subscriptions.mjs?synthetic-restart');const result=fresh.subscribe(restored,' A@B.C ');assert.equal(result.created,false);assert.equal(result.subscription.id,'sub-1');assert.equal(result.state.length,1);});
