import test from 'node:test';
import assert from 'node:assert/strict';
import {subscribe} from '../src/subscriptions.mjs';
test('SP-1 returns normalized deterministic append without changing input',()=>{
 const state=Object.freeze([]);const r=subscribe(state,' X@EXAMPLE.TEST ');
 assert.deepEqual(state,[]);assert.deepEqual(r.subscription,{id:'sub-1',email:'x@example.test'});
 assert.equal(r.created,true);assert.equal(r.state.length,1);
 assert.equal(subscribe(r.state,'x@example.test').created,false);
 assert.throws(()=>subscribe(state,42),TypeError);assert.throws(()=>subscribe(state,'x'),TypeError);
});
test('SP-2 caller serialization preserves identity',()=>{
 const first=subscribe([],'x@example.test');const r=subscribe(JSON.parse(JSON.stringify(first.state)),'X@example.test');
 assert.equal(r.created,false);assert.deepEqual(r.subscription,first.subscription);
});
