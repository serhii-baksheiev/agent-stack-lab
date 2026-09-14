import assert from 'node:assert/strict';
import {safeRepoMetadata} from './safe-repo-metadata.mjs';
const source={id:1,full_name:'synthetic/lab',private:false,html_url:'https://example.invalid/lab',default_branch:'master',temp_clone_token:'SYNTHETIC_NOT_A_TOKEN',futureCredential:'SYNTHETIC_UNKNOWN_FIELD',nested:{authorization:'SYNTHETIC_ONLY'}};
assert.deepEqual(safeRepoMetadata(source),{id:1,full_name:'synthetic/lab',private:false,html_url:'https://example.invalid/lab',default_branch:'master'});
assert.deepEqual(safeRepoMetadata({message:'error'}),{});
console.log('PASS repository evidence allowlist: known and future unknown credential fields excluded; false privacy preserved.');
