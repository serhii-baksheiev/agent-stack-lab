import test from 'node:test';
import assert from 'node:assert/strict';
import {subscribe} from '../src/subscriptions.mjs';
test('US1 normalizes, preserves frozen state and avoids duplicates',()=>{
 const initial=Object.freeze([]),first=subscribe(initial,' LAB@EXAMPLE.TEST ');
 assert.deepEqual(initial,[]);assert.equal(first.subscription.email,'lab@example.test');
 assert.equal(first.subscription.id,'sub-1');assert.equal(first.created,true);
 const repeated=subscribe(Object.freeze(first.state),'lab@example.test');
 assert.equal(repeated.created,false);assert.deepEqual(repeated.state,first.state);
 assert.throws(()=>subscribe(initial,'bad address'),TypeError);
});
test('US2 serialized state has no session dependency',()=>{
 const saved=JSON.stringify(subscribe([],'lab@example.test').state);
 assert.equal(subscribe(JSON.parse(saved),'LAB@example.test').created,false);
});
