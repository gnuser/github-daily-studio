import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
export function normalize(chart, capturedAt, sort='top-playing-now') {
 if(!['top-playing-now','up-and-coming'].includes(sort) || chart.sortId!==sort || !(chart.subtitle==='Results for all devices and locations' || (chart.appliedFilters?.split(',').includes('device=all') && chart.appliedFilters?.split(',').includes('country=all'))) || !Array.isArray(chart.games))throw Error('Unexpected Roblox chart scope');
 const seen=new Set();
 const games=chart.games.filter(g=>!g.isSponsored).filter(g=>{if(seen.has(g.universeId))return false;seen.add(g.universeId);return true;}).slice(0,10);
 if(games.length!==10)throw Error('Roblox returned fewer than 10 games');
 for(const g of games)if(!Number.isSafeInteger(g.universeId)||g.universeId<=0||!Number.isSafeInteger(g.rootPlaceId)||g.rootPlaceId<=0||typeof g.name!=='string'||!g.name.trim()||!Number.isSafeInteger(g.playerCount)||g.playerCount<0)throw Error('Invalid game');
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(capturedAt));
 return {schema_version:1,date,generated_at:capturedAt,source:'https://www.roblox.com/charts',sort,scope:'所有地区 · 所有设备',games:games.map((g,i)=>({rank:i+1,universe_id:g.universeId,place_id:g.rootPlaceId,name:g.name,playing:g.playerCount,genre:g.genreL1||'未分类',approval:Number.isSafeInteger(g.totalUpVotes)&&g.totalUpVotes>=0&&Number.isSafeInteger(g.totalDownVotes)&&g.totalDownVotes>=0&&g.totalUpVotes+g.totalDownVotes>0?Math.round(100*g.totalUpVotes/(g.totalUpVotes+g.totalDownVotes)):null,url:`https://www.roblox.com/games/${g.rootPlaceId}`}))};
}
export async function collect(sort='top-playing-now'){
 const url=new URL('https://apis.roblox.com/explore-api/v1/get-sort-content');
 url.search=new URLSearchParams({sortId:sort,sessionId:crypto.randomUUID(),device:'all',country:'all'});
 const res=await fetch(url,{signal:AbortSignal.timeout(20000)});
 if(!res.ok)throw Error(`Roblox HTTP ${res.status}`);
 return normalize(await res.json(),new Date().toISOString(),sort);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 for(const [type,sort,title] of [['roblox','top-playing-now','Roblox 热门'],['roblox-new','up-and-coming','新游上榜']]) {
 const data=await collect(sort);
 const root=new URL('../data/',import.meta.url);
 let index=[];try{index=JSON.parse(await readFile(new URL(`${type}-index.json`,root),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 const entry={id:`${type}-${data.date}`,type,date:data.date,title,dataUrl:`./data/${type}-briefing-${data.date}.json`};
 index=[entry,...index.filter(r=>r.date!==data.date)].sort((a,b)=>b.date.localeCompare(a.date));
 await writeFile(new URL(`${type}-briefing-${data.date}.json`,root),JSON.stringify(data,null,2)+'\n');
 await writeFile(new URL(`${type}-index.json`,root),JSON.stringify(index,null,2)+'\n');
 console.log(`Saved ${type} ${data.date}: ${data.games.length} games, ${data.generated_at}`);
}
}
