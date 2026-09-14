import {writeFileSync} from 'node:fs';
if(!process.cwd().replaceAll('\\','/').includes('/.lab-runs/f-'))throw new Error('lab fixture only');
writeFileSync('.native-hook-probe.json',JSON.stringify({synthetic:true,ran:true})+'\n');
console.log('{}');
