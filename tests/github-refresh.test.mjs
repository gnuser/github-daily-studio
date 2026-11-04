import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
const source=await readFile(new URL('../app.js',import.meta.url),'utf8');
const refresh=source.slice(source.indexOf('let githubRequest;'),source.indexOf('\nrenderCalendar();\nawait selectReport'));
test('a failed request can retry and display today; concurrent calls share fetch',async()=>{
 let calls=0, selected;
 const context=vm.createContext({Intl,Date,AbortSignal,selection:1,activeType:'github',reports:[],reportData:new Map(),reportKey:r=>r.id,parseDate:x=>x,$:()=>({}),selectReport:async d=>{selected=d;},fetch:async()=>{calls++;return {ok:calls>1,json:async()=>({generated_at:'2026-11-04T03:00:00Z',trending:[{full_name:'a/b'}]})};}});
 vm.runInContext(refresh,context);
 await vm.runInContext('refreshGithub()',context);
 await Promise.all([vm.runInContext('refreshGithub()',context),vm.runInContext('refreshGithub()',context)]);
 assert.equal(calls,2);assert.equal(selected,'2026-11-04');
});
test('today archive is indexed and contains real projects',async()=>{
 const index=JSON.parse(await readFile(new URL('../data/github-index.json',import.meta.url)));
 const latest=index[0]; const data=JSON.parse(await readFile(new URL('../'+latest.url,import.meta.url)));
 assert.equal(latest.date,new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(data.generated_at)));assert.ok(data.trending.length>0);
 assert.equal(data.counts.trending,data.trending.length);
});
