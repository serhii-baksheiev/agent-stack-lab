// Authorized private lab only. One bounded live handoff: Claude Code implements, Codex reviews/continues, Claude Code fixes.
// Uses the operator's already authorized CLIs; no new secrets, no production repository, no Jira. Creates one Issue and one PR in this lab, closes both in finally.
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync,existsSync,readdirSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root,run,json,sha} from './lab-evidence.mjs';
import {safeRepoMetadata} from './safe-repo-metadata.mjs';
const repository='serhii-baksheiev/agent-stack-lab',apiRoot='repos/'+repository,stamp=Date.now(),base=path.join(root,'.lab-runs/d-live-'+stamp),out='spikes/d-team-orchestration/evidence/live-handoff',baseBranch='spike/d-team-orchestration',featureDir=`spikes/d-team-orchestration/live/${stamp}`;
mkdirSync(base,{recursive:true});mkdirSync(out,{recursive:true});
const checks=[],add=(name,passed,detail)=>{checks.push({name,passed,detail});console.log((passed?'ok   ':'FAIL ')+name);};let sequence=0,issue=null,pr=null,ci=null,closed=null,status='observed';
const models={};const gitAuth=['-c','credential.helper=','-c','credential.helper=!gh auth git-credential'];
// Nested harness sessions must not inherit the outer Claude Code session markers.
const childEnv={CLAUDECODE:undefined,CLAUDE_CODE_ENTRYPOINT:undefined};
async function api(label,method,endpoint,body,headers=[]){
 const endpointPath=endpoint.split('?')[0];assert(endpointPath===apiRoot||endpointPath.startsWith(apiRoot+'/'),'Only laboratory API endpoints');
 const args=['api',endpoint,'--method',method,'--include','-H','Accept: application/vnd.github+json','-H','X-GitHub-Api-Version: 2026-03-10',...headers.flatMap(x=>['-H',x])];if(body!==undefined)args.push('--input','-');
 const startedAt=new Date().toISOString(),start=Date.now();const response=await new Promise((resolve,reject)=>{const child=spawn('gh',args,{cwd:root,stdio:['pipe','pipe','pipe'],windowsHide:true});let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);child.on('error',reject);const timer=setTimeout(()=>child.kill(),60000);child.on('close',code=>{clearTimeout(timer);resolve({code,stdout,stderr});});child.stdin.end(body===undefined?'':JSON.stringify(body));});
 const split=response.stdout.search(/\r?\n\r?\n/),head=split<0?'':response.stdout.slice(0,split),raw=split<0?response.stdout:response.stdout.slice(split).trim();let data;try{data=JSON.parse(raw);}catch{data=raw;}
 if(endpointPath===apiRoot&&data&&typeof data==='object')data=safeRepoMetadata(data);
 const status=Number(head.match(/^HTTP\/\S+\s+(\d+)/m)?.[1]),record={label,method,endpoint,request:body,requestHeaders:headers,startedAt,durationMs:Date.now()-start,exitCode:response.code,status,responseHeaders:head,data,stderr:response.stderr};json(out+`/api/${sequence++}-${label}.json`,record);return record;
}
function ok(r,codes=[200,201,204]){assert(codes.includes(r.status),JSON.stringify({label:r.label,status:r.status,error:r.data}));return r.data;}
const get=(label,endpoint)=>api(label,'GET',endpoint+(endpoint.includes('?')?'&':'?')+'lab_probe='+Date.now());
function git(label,args,cwd){const r=run('git',args,cwd,out+'/git/'+label+'.json');assert.equal(r.exitCode,0,r.stderr);return r;}
function save(){json(out+'/result.json',{status,repository,stamp,baseBranch,featureDir,scriptSha256:sha(readFileSync(import.meta.filename)),scenarioSha:run('git',['rev-parse','HEAD'],root).stdout.trim(),platform:process.platform,node:process.version,models,checks,issue:issue&&{number:issue.number,url:issue.html_url},pr:pr&&{number:pr.number,url:pr.html_url,head:pr.head?.ref},ci,closed,scope:'One authorized operator account drives both CLIs in print/exec mode from a lab script; sequencing is scripted, not autonomous task selection. Not two independent GitHub identities.'});}
const outsideFeature=(cwd)=>run('git',['status','--short','--untracked-files=all'],cwd).stdout.split(/\r?\n/).filter(Boolean).map(l=>l.slice(3).trim()).filter(p=>!p.startsWith(featureDir));
const requirements=`Requirements for synthetic feature d-live-${stamp} (laboratory only, no production meaning):
- D-R1: \`render(n)\` in \`${featureDir}/counter.mjs\` returns the string "Count: <n>" for non-negative integers.
- D-R2: \`render\` throws TypeError for negative numbers, non-integers and non-numbers.
- D-R3: \`${featureDir}/counter.test.mjs\` uses node:test + node:assert/strict and covers D-R1 and D-R2; \`node --test "${featureDir}/**/*.test.mjs"\` must pass.
- D-R4: \`${featureDir}/README.md\` documents usage in at most ten lines.
Only files inside \`${featureDir}/\` may be created or changed. Do not run git. Do not touch any other path.`;
try{
 const repo=ok(await get('privacy',apiRoot));assert(repo.private===true);assert.equal(repo.full_name,repository);add('private repository verified',true);
 const cv=run('claude',['--version'],root,out+'/claude-version.json',childEnv),xv=run('codex',['--version'],root,out+'/codex-version.json',childEnv);
 models.claude=cv.stdout.trim();models.codex=xv.stdout.trim();
 if(cv.exitCode!==0||xv.exitCode!==0){status='unverified';add('authorized Claude Code and Codex CLIs available',false,{claude:cv.exitCode,codex:xv.exitCode});save();process.exit(0);}
 add('authorized Claude Code and Codex CLIs available',true,models);
 issue=ok(await api('create-issue','POST',apiRoot+'/issues',{title:`[live D ${stamp}] Implement synthetic counter via Claude Code -> Codex handoff`,body:`Synthetic laboratory task. Stable task identity ${repository}:d-live-${stamp}:D-T1.\n\n${requirements}\n\nNo production task, no Jira ticket.`}));save();add('live laboratory issue created',issue.number>0,{number:issue.number});
 git('fetch-base',['fetch','origin',baseBranch],root);const baseSha=git('base-sha',['rev-parse','origin/'+baseBranch],root).stdout.trim();
 const claudeBranch=`lab/d-live-claude-${stamp}`,codexBranch=`lab/d-live-codex-${stamp}`,claudeDir=path.join(base,'claude'),codexDir=path.join(base,'codex');
 git('worktree-claude',['worktree','add','-b',claudeBranch,claudeDir,baseSha],root);
 const claudePrompt=`You are Claude Code working non-interactively in an isolated git worktree of the private laboratory repository (branch ${claudeBranch}). Implement laboratory Issue #${issue.number}.\n\n${requirements}\n\nWhen finished, run \`node --test "${featureDir}/**/*.test.mjs"\` and stop. Reply with a short summary of the files you created.`;
 const claudeImpl=run('claude',['-p',claudePrompt,'--permission-mode','acceptEdits','--allowedTools','Read,Write,Edit,Glob,Grep,Bash(node --test *)','--output-format','json'],claudeDir,out+'/claude-implement.json',childEnv);
 const created=existsSync(path.join(claudeDir,featureDir))?readdirSync(path.join(claudeDir,featureDir)):[];
 add('Claude Code implemented feature inside isolated worktree only',claudeImpl.exitCode===0&&created.includes('counter.mjs')&&created.includes('counter.test.mjs')&&outsideFeature(claudeDir).length===0,{created,outside:outsideFeature(claudeDir)});
 const claudeTest=run(process.execPath,['--test',featureDir+'/**/*.test.mjs'],claudeDir,out+'/claude-fresh-test.json');add('Claude implementation passes fresh-process node --test',claudeTest.exitCode===0);
 git('claude-add',['add',featureDir],claudeDir);git('claude-commit',['-c','user.name=Synthetic Lab','-c','user.email=lab@example.invalid','commit','-qm',`Live D: Claude Code implementation for #${issue.number}`],claudeDir);const claudeSha=git('claude-sha',['rev-parse','HEAD'],claudeDir).stdout.trim();
 git('claude-push',[...gitAuth,'push',`https://github.com/${repository}.git`,`${claudeBranch}:refs/heads/${claudeBranch}`],claudeDir);
 pr=ok(await api('create-pr','POST',apiRoot+'/pulls',{title:`[live D ${stamp}] Claude Code -> Codex handoff`,head:claudeBranch,base:baseBranch,draft:false,body:`Live laboratory handoff for #${issue.number}. Implemented by Claude Code ${models.claude} in print mode; continuation and review by Codex ${models.codex} exec; fix by Claude Code. Close after experiment; never merge into ${baseBranch} or master.`}));save();
 const handoff={schema:1,feature:`d-live-${stamp}`,issue:issue.number,pr:pr.number,branch:claudeBranch,commit:claudeSha,featureDir,from:'claude-code '+models.claude,to:'codex '+models.codex,nextAction:'Review counter.mjs against D-R1..D-R4, add at least one missing test case, and request at least one concrete change if justified.'};
 ok(await api('publish-handoff','POST',apiRoot+`/issues/${issue.number}/comments`,{body:'Handoff record (Claude Code -> Codex):\n\n```json\n'+JSON.stringify(handoff,null,2)+'\n```'}));
 add('handoff published through Issue comment and PR',true,{pr:pr.number});
 const comments=ok(await get('read-handoff',apiRoot+`/issues/${issue.number}/comments`));const handoffText=comments.at(-1).body.match(/```json\n([\s\S]*?)\n```/)[1];const readBack=JSON.parse(handoffText);assert.equal(readBack.commit,claudeSha);
 git('worktree-codex',['worktree','add','-b',codexBranch,codexDir,claudeSha],root);writeFileSync(path.join(base,'handoff.json'),handoffText);
 const codexPrompt=`You are Codex continuing another agent's work in an isolated git worktree (branch ${codexBranch}) of a private laboratory repository. The handoff record is at ${path.join(base,'handoff.json').replaceAll('\\','/')}; read it first. Then review the files under ${featureDir}/ against these requirements:\n\n${requirements}\n\nTasks: (1) run \`node --test "${featureDir}/**/*.test.mjs"\`; (2) add one new test file ${featureDir}/codex.test.mjs (node:test) covering an edge case the existing tests miss; (3) write your review as markdown to ${featureDir}/REVIEW.md with a heading "Codex review", listing at least one concrete change request for the implementer if any defect or gap exists, otherwise say explicitly that no change is required; (4) do not modify counter.mjs, counter.test.mjs or any file outside ${featureDir}; do not run git. Your final message must be the same review text.`;
 const codexReview=run('codex',['exec','-C',codexDir,'--sandbox','workspace-write','--skip-git-repo-check','-o',path.join(base,'codex-last.md'),codexPrompt],codexDir,out+'/codex-review.json',childEnv);
 const codexFiles=readdirSync(path.join(codexDir,featureDir));const reviewText=existsSync(path.join(codexDir,featureDir,'REVIEW.md'))?readFileSync(path.join(codexDir,featureDir,'REVIEW.md'),'utf8'):'';
 add('Codex read handoff and continued in separate worktree and branch',codexReview.exitCode===0&&codexFiles.includes('codex.test.mjs')&&reviewText.includes('Codex review')&&outsideFeature(codexDir).length===0,{files:codexFiles,outside:outsideFeature(codexDir)});
 const codexTest=run(process.execPath,['--test',featureDir+'/**/*.test.mjs'],codexDir,out+'/codex-fresh-test.json');add('Codex continuation passes fresh-process node --test',codexTest.exitCode===0);
 git('codex-add',['add',featureDir],codexDir);git('codex-commit',['-c','user.name=Synthetic Lab','-c','user.email=lab@example.invalid','commit','-qm',`Live D: Codex continuation and review for #${issue.number}`],codexDir);const codexSha=git('codex-sha',['rev-parse','HEAD'],codexDir).stdout.trim();
 git('codex-push',[...gitAuth,'push',`https://github.com/${repository}.git`,`${codexBranch}:refs/heads/${codexBranch}`],codexDir);
 const review=ok(await api('post-review','POST',apiRoot+`/pulls/${pr.number}/reviews`,{event:'COMMENT',body:`Codex ${models.codex} exec review, posted by the lab script from the same operator account (not an independent-account REQUEST_CHANGES). Continuation commit ${codexSha} on ${codexBranch}.\n\n${reviewText}`}));
 add('Codex review posted on PR as COMMENT',review.state==='COMMENTED',{sameAccount:true});
 git('claude-fetch-codex',['fetch','origin',codexBranch],claudeDir);git('claude-merge-codex',['merge','--ff-only','origin/'+codexBranch],claudeDir);
 const prReviews=ok(await get('read-review',apiRoot+`/pulls/${pr.number}/reviews`));writeFileSync(path.join(base,'review-for-claude.md'),prReviews.at(-1).body);
 const claudeFixPrompt=`You are Claude Code working non-interactively in an isolated git worktree (branch ${claudeBranch}). PR #${pr.number} for Issue #${issue.number} received a review from Codex; the review text is at ${path.join(base,'review-for-claude.md').replaceAll('\\','/')} and also in ${featureDir}/REVIEW.md. Address every concrete change request in the review by editing files under ${featureDir}/ only (if the review requires no change, append a short "Response" section to ${featureDir}/REVIEW.md explaining why). Keep all tests passing: run \`node --test "${featureDir}/**/*.test.mjs"\` at the end. Do not run git. Reply with a short summary of what you changed.`;
 const claudeFix=run('claude',['-p',claudeFixPrompt,'--permission-mode','acceptEdits','--allowedTools','Read,Write,Edit,Glob,Grep,Bash(node --test *)','--output-format','json'],claudeDir,out+'/claude-fix.json',childEnv);
 git('fix-add',['add',featureDir],claudeDir);const fixCommit=run('git',['-c','user.name=Synthetic Lab','-c','user.email=lab@example.invalid','commit','-qm',`Live D: Claude Code addresses Codex review for #${issue.number}`],claudeDir,out+'/git/fix-commit.json');
 const finalSha=git('final-sha',['rev-parse','HEAD'],claudeDir).stdout.trim();
 add('Claude Code addressed Codex review with a new commit',claudeFix.exitCode===0&&fixCommit.exitCode===0&&finalSha!==codexSha&&outsideFeature(claudeDir).length===0,{codexSha,finalSha});
 const finalTest=run(process.execPath,['--test',featureDir+'/**/*.test.mjs'],claudeDir,out+'/final-fresh-test.json');add('final implementation passes fresh-process node --test',finalTest.exitCode===0);
 git('final-push',[...gitAuth,'push',`https://github.com/${repository}.git`,`${claudeBranch}:refs/heads/${claudeBranch}`],claudeDir);
 ok(await api('pr-ready-comment','POST',apiRoot+`/issues/${pr.number}/comments`,{body:`Claude Code fix commit ${finalSha}; awaiting hosted CI.`}));
 // Wait for GitHub-hosted CI on the exact final head.
 const deadline=Date.now()+15*60000;let runs=[];
 while(Date.now()<deadline){const r=ok(await get('ci-poll',apiRoot+`/commits/${finalSha}/check-runs`));runs=r.check_runs.filter(x=>x.name==='smoke');if(runs.length&&runs.every(x=>x.status==='completed'))break;await new Promise(res=>setTimeout(res,20000));}
 const smoke=runs[0];let hosted=false,runner=null;
 if(smoke){const job=ok(await get('ci-job',apiRoot+`/actions/jobs/${smoke.id}`));runner=job.runner_name||null;hosted=Array.isArray(job.labels)&&job.labels.includes('ubuntu-latest')&&!job.labels.includes('self-hosted');ci={checkRun:smoke.id,name:smoke.name,conclusion:smoke.conclusion,status:smoke.status,headSha:finalSha,url:smoke.html_url,hosted,labels:job.labels,runner};}
 else ci={conclusion:'missing',status:'timeout',headSha:finalSha,hosted:false};
 add('hosted GitHub CI passed on final PR head',ci.conclusion==='success'&&hosted,{conclusion:ci.conclusion,hosted,runner});
 save();
}catch(error){status='failed';add('experiment aborted',false,String(error?.stack||error));}
finally{
 const verified=[];
 if(pr){await api('close-pr','PATCH',apiRoot+'/pulls/'+pr.number,{state:'closed'});const r=await get('verify-pr-closed',apiRoot+'/pulls/'+pr.number);verified.push({kind:'pr',number:pr.number,closed:r.status===200&&r.data.state==='closed'&&r.data.merged===false});}
 if(issue){await api('close-issue','PATCH',apiRoot+'/issues/'+issue.number,{state:'closed'});const r=await get('verify-issue-closed',apiRoot+'/issues/'+issue.number);verified.push({kind:'issue',number:issue.number,closed:r.status===200&&r.data.state==='closed'});}
 closed={allClosed:verified.length===2&&verified.every(x=>x.closed),verified,retainedBranches:[`lab/d-live-claude-${stamp}`,`lab/d-live-codex-${stamp}`],reason:'Retained for reproducible commit evidence; never merged.'};
 for(const w of ['claude','codex']){const d=path.join(base,w);if(existsSync(d))run('git',['worktree','remove','--force',d],root,out+'/git/remove-worktree-'+w+'.json');}
 save();console.log(JSON.stringify({status,checks:checks.map(c=>[c.name,c.passed]),issue:issue?.number,pr:pr?.number,ci}));
}
