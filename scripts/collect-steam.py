#!/usr/bin/env python3
"""Collect official Steam snapshots; fail before writing if any section is incomplete."""
import datetime as dt, html, json, re, urllib.request, pathlib, subprocess, time
ROOT=pathlib.Path(__file__).resolve().parents[1]
NOW=dt.datetime.now(dt.timezone.utc); DATE=NOW.astimezone(dt.timezone(dt.timedelta(hours=8))).date()
def fetch(url):
 for attempt in range(3):
  try:return subprocess.check_output(['curl','--fail','--silent','--show-error','--location','--max-time','40',url],text=True)
  except subprocess.CalledProcessError:
   if attempt==2:raise
   time.sleep(2)
def clean(s):return html.unescape(re.sub('<[^>]+>','',s)).strip()
def chart(url,online=False):
 rows=re.findall(r'<tr\b.*?</tr>',fetch(url),re.S)[1:6];out=[]
 for row in rows:
  cells=re.findall(r'<td\b[^>]*>(.*?)</td>',row,re.S)
  link=re.search(r'href="(https://store.steampowered.com/(?:app|sub|bundle)/\d+/[^"]*)"',row)
  if not link or len(cells)<5:raise ValueError('Chart markup changed')
  name=clean(re.findall(r'<div\b[^>]*>([^<>]+)</div>',cells[2])[-1])
  item={'rank':int(clean(cells[1])),'name':name,'url':html.unescape(link[1]),'thumbnail':html.unescape(re.search(r'<img[^>]+src="([^"]+)"',cells[2])[1])}
  if online:item['playing']=int(clean(cells[4]).replace(',',''))
  out.append(item)
 if len(out)!=5 or [x['rank'] for x in out]!=list(range(1,6)):raise ValueError('Incomplete Top 5')
 if online and any(out[i]['playing']<out[i+1]['playing'] for i in range(4)):raise ValueError('Invalid online order')
 return out
sources={'steam-sales':'https://store.steampowered.com/charts/topselling/global','steam-online':'https://store.steampowered.com/charts/mostplayed','steam':'https://store.steampowered.com/search/?filter=popularnew&sort_by=Released_DESC&cc=us&l=english'}
sales=chart(sources['steam-sales']);online=chart(sources['steam-online'],True)
candidates=[]
for row in re.findall(r'<a\b(?=[^>]*class="search_result_row)[^>]*>.*?</a>',fetch(sources['steam']),re.S):
 # Search anchors place class after app attributes; recover app ID from whole anchor.
 app=re.search(r'data-ds-appid="(\d+)"',row)
 if not app:continue
 released=re.search(r'class="search_released[^\"]*">(.*?)</div>',row,re.S)
 try:day=dt.datetime.strptime(clean(released[1]),'%b %d, %Y').date()
 except (ValueError,TypeError):continue
 if not DATE-dt.timedelta(days=6)<=day<=DATE:continue
 aid=app[1]
 detail=json.loads(fetch('https://store.steampowered.com/api/appdetails?appids='+aid+'&l=schinese&cc=us'))[aid]
 if not detail.get('success') or detail['data'].get('type')!='game' or detail['data'].get('release_date',{}).get('coming_soon'):continue
 d=detail['data'];review=json.loads(fetch('https://store.steampowered.com/appreviews/'+aid+'?json=1&language=all&purchase_type=all&num_per_page=0'))
 q=review.get('query_summary',{});total=q.get('total_reviews',0);positive=q.get('total_positive',0)
 if not total:continue
 candidates.append({'appid':int(aid),'name':d['name'],'url':'https://store.steampowered.com/app/'+aid+'/','thumbnail':d['header_image'],'gameplay':clean(d.get('short_description','')),'release_date':day.isoformat(),'review':{'total':total,'positive_percent':round(positive*100/total),'label':q.get('review_score_desc','')},'selection_reason':'最近 7 天发售；按全部语言玩家评价数筛选，优先关注讨论较多的新作。'})
# Transparent, reproducible editorial shortlist: attention proxy is review count, not a sales rank.
candidates.sort(key=lambda g:g['review']['total'],reverse=True);new=candidates[:3]
if len(new)!=3 or any(not x['gameplay'] for x in new):raise ValueError('Fewer than three verified new games; previous archive preserved')
pending=[]
for kind,games in [('steam',new),('steam-sales',sales),('steam-online',online)]:
 data={'schema_version':1,'type':kind,'date':DATE.isoformat(),'generated_at':dt.datetime.now(dt.timezone.utc).isoformat(),'source':sources[kind],'window_start':(DATE-dt.timedelta(days=6)).isoformat(),'games':games}
 name=f'{kind}-briefing-{DATE}.json';p=ROOT/'data'/f'{kind}-index.json';index=json.loads(p.read_text()) if p.exists() else []
 index=[x for x in index if x['date']!=str(DATE)]+[{'id':f'{kind}-{DATE}','type':kind,'date':str(DATE),'title':'Steam','dataUrl':'./data/'+name}];index.sort(key=lambda x:x['date'],reverse=True)
 pending.extend([(ROOT/'data'/name,data),(p,index)])
for p,data in pending:p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Archived Steam:',DATE,[(g['name'],g['release_date'],g['review']['total']) for g in new])
