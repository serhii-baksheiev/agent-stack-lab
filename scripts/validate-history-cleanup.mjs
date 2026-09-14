import fs from 'node:fs';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const index=JSON.parse(fs.readFileSync('docs/history-cleanup/evidence-reference-index.json'));
for(const row of index.files)assert.equal(createHash('sha256').update(fs.readFileSync(row.path)).digest('hex'),row.finalFileSha256,'Normalized evidence differs: '+row.path);
console.log('PASS history cleanup: '+index.files.length+' normalized evidence files match final hashes.');
