'use strict';
const http = require('node:http');
const {URL, URLSearchParams} = require('node:url');
const seed = require('./catalog.json');
const custom = require('./custom-titles.json');
const configs = require('./collections.json');
const tags = require('./tags.json');
const yearNow = new Date().getUTCFullYear();
const clean = s => String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const unique = new Map();
const shortTitles = new Set(['Superman (The Mad Scientist)','The Mechanical Monsters','Billion Dollar Limited','The Arctic Giant','The Bulleteers','The Magnetic Telescope','Electric Earthquake','Volcano','Terror on the Midway','Japoteurs','Showdown','Eleventh Hour','Destruction, Inc.','The Mummy Strikes','Jungle Drums','The Underground World','Secret Agent','Dark Hoser','Batman Is Just Not That Into You','Cooking with Alfred','Movie Sound Effects: How Do They Do That?']);
for(const [i,r] of [...seed,...custom].entries()) {
  const [name,year,type,universe,id,releaseDate] = Array.isArray(r) ? r : [r.name,r.year,r.type,r.universe,r.id,r.releaseDate];
  if(!['movie','series'].includes(type)||!name||!Number(year))continue;
  const key = `${clean(name)}|${year}|${type}`;
  if(!unique.has(key))unique.set(key,{name,year:Number(year),type,universe,id,releaseDate:releaseDate||null,i});
  else if(!unique.get(key).id && id)unique.get(key).id=id;
}
const all=[...unique.values()].map(x=>{
  const n=x.name.toLowerCase(), isAnimation=x.universe==='Animation', lego=/\blego\b/i.test(x.name);
  const auto=[];
  if(isAnimation)auto.push('animation',x.type==='movie'?'all_dc_animated_movies':'all_dc_animated_series');
  if(lego)auto.push('dc_lego_movies_specials','dc_kids_family');
  if(shortTitles.has(x.name)||/^DC Showcase:/.test(x.name)||x.name==='Superman/Shazam!: The Return of Black Adam'||x.name==='Batman: Death in the Family'||x.name==='Constantine: The House of Mystery')auto.push('dc_animated_shorts');
  if(['Batman','Nolan Batman','The Batman'].includes(x.universe)||/batman|dark knight|gotham|batwheels|batwoman/i.test(x.name))auto.push('batman');
  if(x.universe==='Superman'||/superman|supergirl|krypton|man of steel/i.test(x.name))auto.push('superman');
  if(/justice league/i.test(n))auto.push('justice_league');
  if(/teen titans/i.test(n))auto.push('teen_titans');
  if(/harley quinn/i.test(n))auto.push('harley_quinn');
  if(/joker/i.test(n))auto.push('joker');
  if(/wonder woman/i.test(n))auto.push('wonder_woman');
  if(/aquaman/i.test(n))auto.push('aquaman');
  if(/shazam/i.test(n))auto.push('shazam');
  if(/watchmen/i.test(n))auto.push('watchmen');
  if(/flash/i.test(n))auto.push('the_flash');
  if(/suicide squad/i.test(n))auto.push('suicide_squad');
  if(/green lantern/i.test(n))auto.push('green_lantern');
  if(/constantine/i.test(n))auto.push('constantine');
  if(/swamp thing/i.test(n))auto.push('swamp_thing');
  if(/supergirl/i.test(n))auto.push('supergirl');
  if(isAnimation&&/batman|dark knight|gotham/i.test(n))auto.push('batman_animations');
  if(isAnimation&&/superman|supergirl|man of steel/i.test(n))auto.push('superman_animations');
  if(isAnimation&&/justice league/i.test(n))auto.push('justice_league_animations');
  if(x.type==='series')auto.push(x.year<2000?'classic_dc_tv_shows':'modern_dc_tv_shows');
  const explicit=tags[`${x.name}|${x.year}`]||tags[x.name]||[];
  return {...x,tags:new Set([...auto,...explicit])};
});
const timelines={
 dceu:['Wonder Woman|2017','Wonder Woman 1984|2020','Man of Steel|2013','Batman v Superman: Dawn of Justice|2016','Suicide Squad|2016','Justice League|2017',"Zack Snyder's Justice League|2021",'Aquaman|2018','Shazam!|2019','Birds of Prey|2020','The Suicide Squad|2021','Peacemaker|2022','Black Adam|2022','Shazam! Fury of the Gods|2023','The Flash|2023','Blue Beetle|2023','Aquaman and the Lost Kingdom|2023'],
 dcu:['Creature Commandos','Superman|2025','Supergirl|2026','Lanterns'],
 reeves:['The Batman|2022','The Penguin'],joker:['Joker','Joker: Folie à Deux'],
 arrowverse:['Arrow','The Flash|2014','Supergirl|2015',"DC's Legends of Tomorrow",'Black Lightning','Batwoman'],
 dcamu:['Justice League: The Flashpoint Paradox','Justice League: War','Son of Batman','Justice League: Throne of Atlantis','Batman vs. Robin','Batman: Bad Blood','Justice League vs. Teen Titans','Justice League Dark','Teen Titans: The Judas Contract','Suicide Squad: Hell to Pay','Constantine: City of Demons','The Death of Superman','Reign of the Supermen','Wonder Woman: Bloodlines','Batman: Hush','Justice League Dark: Apokolips War'],
 tomorrowverse:['Superman: Man of Tomorrow','Justice Society: World War II','Batman: The Long Halloween, Part One','Batman: The Long Halloween, Part Two','Green Lantern: Beware My Power','Legion of Super-Heroes','Justice League: Warworld','Justice League: Crisis on Infinite Earths – Part One','Justice League: Crisis on Infinite Earths – Part Two','Justice League: Crisis on Infinite Earths – Part Three'],
 dcau:['Batman: The Animated Series','Batman: Mask of the Phantasm','Superman: The Animated Series','The New Batman Adventures','Batman & Mr. Freeze: SubZero','Batman Beyond','Batman Beyond: Return of the Joker','Justice League|2001','Justice League Unlimited','Batman and Harley Quinn','Justice League vs. the Fatal Five']
};
const universe={dc_universe_dcu_james_gunn:'DCU',dc_extended_universe_dceu:'DCEU',arrowverse_complete_watch_order:'Arrowverse',the_batman_reeves_universe:'The Batman',joker_universe:'Joker',dc_animated_movie_universe_dcamu:'dcamu',tomorrowverse:'tomorrowverse',dc_animated_universe_dcau:'dcau',standalone_dc_productions:'Standalone'};
const aliases={chronological_story_order:'dceu',essential_dc_watch_order:'dceu',dc_universe_dcu_james_gunn:'dcu',dc_extended_universe_dceu:'dceu',arrowverse_complete_watch_order:'arrowverse',the_batman_reeves_universe:'reeves',joker_universe:'joker',dc_animated_movie_universe_dcamu:'dcamu',tomorrowverse:'tomorrowverse',dc_animated_universe_dcau:'dcau'};
const shortNames={all_dc_movies_tv_shows:'DC — All Titles',release_order_oldest_first:'Release — Oldest',release_order_newest_first:'Release — Newest',chronological_story_order:'DCEU Story Timeline',movies_only:'All Movies',tv_series_only:'All TV Shows',upcoming_dc_releases:'Coming Soon',essential_dc_watch_order:'Essential Watch Order',dc_universe_dcu_james_gunn:'DCU',dc_extended_universe_dceu:'DCEU',arrowverse_complete_watch_order:'Arrowverse',the_batman_reeves_universe:'The Batman Universe',joker_universe:'Joker Universe',dc_elseworlds:'Elseworlds',dc_animated_movie_universe_dcamu:'DCAMU',tomorrowverse:'Tomorrowverse',dc_animated_universe_dcau:'DCAU',standalone_dc_productions:'Standalone',release_order_within_each_universe:'Universe Release Order',all_dc_animated_movies:'Animated Movies',all_dc_animated_series:'Animated TV',batman_animations:'Batman Animated',superman_animations:'Superman Animated',justice_league_animations:'Justice League Animated',classic_dc_tv_shows:'Classic TV',modern_dc_tv_shows:'Modern TV',dc_kids_family:'Kids & Family',dc_lego_movies_specials:'LEGO DC',dc_animated_shorts:'Animated Shorts',crossover_event_watch_orders:'Crossovers',connected_movies_tv_episodes:'Connected Stories',character_origin_stories:'Origin Stories',villain_focused_stories:'Villains',live_action_only:'Live Action',animation_only:'Animation',dc_movies_by_decade:'Movies by Decade',dc_tv_shows_by_decade:'TV by Decade',completed_series:'Completed TV',newly_released_titles:'New Releases'};
const priority=['all_dc_movies_tv_shows','release_order_oldest_first','release_order_newest_first','chronological_story_order','movies_only','tv_series_only','upcoming_dc_releases','dc_extended_universe_dceu','dc_universe_dcu_james_gunn','arrowverse_complete_watch_order','batman','superman'];
const sortedConfigs=[...configs].sort((a,b)=>{const ai=priority.indexOf(a.id),bi=priority.indexOf(b.id);return (ai<0?Infinity:ai)-(bi<0?Infinity:bi);});
const catalogs=sortedConfigs.map(c=>({id:`dc_${c.id}`,type:'DC',name:shortNames[c.id]||c.name,extra:[{name:'search',isRequired:false},{name:'skip',isRequired:false}]}));
const manifest={id:'community.dc.timeline.catalog',version:'3.0.1',name:'DC Timeline — Free Catalog',description:'Independent fan catalog of DC movies, television, animation and LEGO. Work in progress. No streams hosted; not affiliated with DC.',resources:['catalog','meta'],types:['DC','movie','series'],catalogs,behaviorHints:{configurable:false}};
const makeId=x=>/^tt\d+$/.test(x.id||'')?x.id:`dc_${x.year}_${x.type}_${clean(x.name)}`;
const posterUrl=x=>x.name==='Justice League Unlimited'?'https://dc-timeline-stremio.onrender.com/poster/jlu.svg':/^tt\d+$/.test(x.id||'')?`https://images.metahub.space/poster/medium/${x.id}/img`:`https://dc-timeline-stremio.onrender.com/poster/${makeId(x)}.svg`;
function metaFor(x){return {id:makeId(x),type:x.type,name:x.name,poster:posterUrl(x),releaseInfo:String(x.year),description:`${x.universe} • Release year: ${x.year}${/^tt\d+$/.test(x.id||'')?'':' • Catalog reference only: IMDb ID not yet verified; playback integrations may not recognize this entry.'}`};}
function releaseSort(a,b){return (a.releaseDate&&b.releaseDate?a.releaseDate.localeCompare(b.releaseDate):a.year-b.year)||a.i-b.i;}
function matchTimeline(entry,label){return entry.name===label||`${entry.name}|${entry.year}`===label;}
function getCatalog(type,id,extra={}){
 const legacyType=id.endsWith('_movie')?'movie':id.endsWith('_series')?'series':null;
 const conf=configs.find(c=>id===`dc_${c.id}`||(legacyType&&id===`dc_${c.id}_${legacyType}`));
 if(!conf||!['DC','dc','movie','series'].includes(type)||(['movie','series'].includes(type)&&type!==legacyType))return {metas:[]};
 const c=conf.id;
 let rows=all.filter(x=>legacyType?x.type===legacyType:['movies_only','all_dc_animated_movies','dc_movies_by_decade'].includes(c)?x.type==='movie':['tv_series_only','all_dc_animated_series','dc_tv_shows_by_decade'].includes(c)?x.type==='series':true);
 if(['chronological_story_order','essential_dc_watch_order'].includes(c))rows=rows.filter(x=>x.universe==='DCEU');
 if(c==='upcoming_dc_releases')rows=rows.filter(x=>x.year>yearNow);
 else if(c==='newly_released_titles')rows=rows.filter(x=>x.year>=yearNow-1&&x.year<=yearNow);
 else if(c==='live_action_only')rows=rows.filter(x=>x.universe!=='Animation');
 else if(['animation_only','all_dc_animated_movies','all_dc_animated_series'].includes(c))rows=rows.filter(x=>x.universe==='Animation');
 else if(c==='dc_elseworlds')rows=rows.filter(x=>['Joker','The Batman','Nolan Batman'].includes(x.universe));
 else if(c==='standalone_dc_productions')rows=rows.filter(x=>x.universe==='Standalone');
 else if(c==='release_order_within_each_universe')rows=rows.filter(x=>['DCEU','DCU','Arrowverse','The Batman','Joker','Nolan Batman'].includes(x.universe));
 else if(universe[c]&&!['dcamu','tomorrowverse','dcau'].includes(universe[c]))rows=rows.filter(x=>x.universe===universe[c]);
 else if(!aliases[c]&&!['all_dc_movies_tv_shows','release_order_oldest_first','release_order_newest_first','chronological_story_order','movies_only','tv_series_only','essential_dc_watch_order','dc_movies_by_decade','dc_tv_shows_by_decade'].includes(c))rows=rows.filter(x=>x.tags.has(c));
 if(aliases[c]){
  // Order the already-filtered candidates, never reintroduce other universes/types.
  const candidates=rows;
  const seen=new Set();
  rows=timelines[aliases[c]].flatMap(label=>{
   const matches=candidates.filter(x=>matchTimeline(x,label));
   // A verified IMDb record wins over a duplicate reference record.
   matches.sort((a,b)=>Number(/^tt\d+$/.test(b.id||''))-Number(/^tt\d+$/.test(a.id||''))||a.i-b.i);
   const chosen=matches[0];
   if(!chosen)return [];
   const key=makeId(chosen);
   if(seen.has(key))return [];
   seen.add(key);return [chosen];
  });
 }
 else if(c==='release_order_within_each_universe')rows.sort((a,b)=>a.universe.localeCompare(b.universe)||releaseSort(a,b));
 else rows.sort(releaseSort);
 if(['release_order_newest_first','newly_released_titles','upcoming_dc_releases'].includes(c))rows.reverse();
 const q=String(extra.search||'').trim().toLowerCase();if(q)rows=rows.filter(x=>`${x.name} ${x.year} ${x.universe}`.toLowerCase().includes(q));
 const skip=Math.max(0,Math.min(100000,parseInt(extra.skip,10)||0));
 return {metas:rows.slice(skip,skip+100).map(metaFor)};
}
function respond(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=900'});res.end(JSON.stringify(obj));}
const server=http.createServer((req,res)=>{
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, OPTIONS'});return res.end();}
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/')return respond(res,200,{name:manifest.name,version:manifest.version,install:`https://${req.headers.host||'dc-timeline-stremio.onrender.com'}/manifest.json`,entries:all.length});
 if(url.pathname==='/manifest.json')return respond(res,200,manifest);
 if(url.pathname==='/health')return respond(res,200,{status:'ok',version:manifest.version,entries:all.length,imdbLinked:all.filter(x=>/^tt\d+$/.test(x.id||'')).length,referenceOnly:all.filter(x=>!/^tt\d+$/.test(x.id||'')).length,options:configs.length,catalogs:catalogs.length});
 const pm=url.pathname.match(/^\/poster\/(.+)\.svg$/);
 if(pm){const id=pm[1];const x=id==='jlu'?all.find(x=>x.name==='Justice League Unlimited'):all.find(x=>makeId(x)===id);if(!x)return respond(res,404,{error:'Unknown poster'});const safe=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));const lines=x.name.match(/.{1,21}(?:\s|$)/g)||[x.name];const words=lines.slice(0,6).map((t,i)=>`<text x="300" y="${410+i*55}" text-anchor="middle" fill="white" font-size="34" font-family="sans-serif">${safe(t.trim())}</text>`).join('');res.writeHead(200,{'Content-Type':'image/svg+xml','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=86400'});return res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900"><rect width="600" height="900" fill="#151c34"/><rect x="20" y="20" width="560" height="860" rx="18" fill="#253456"/><text x="300" y="175" text-anchor="middle" fill="#89b8ff" font-size="64" font-family="sans-serif" font-weight="bold">DC</text>${words}<text x="300" y="810" text-anchor="middle" fill="#b5c4d9" font-size="30" font-family="sans-serif">${x.year} • Reference</text></svg>`);}
 const mm=url.pathname.match(/^\/meta\/(DC|dc|movie|series)\/([^/]+)\.json$/);
 if(mm){const x=all.find(x=>makeId(x)===decodeURIComponent(mm[2]));return respond(res,200,{meta:x?metaFor(x):null});}
 const m=url.pathname.match(/^\/catalog\/(DC|dc|movie|series)\/([^/]+)(?:\/(.+))?\.json$/);
 if(m)return respond(res,200,getCatalog(m[1],m[2],Object.fromEntries(new URLSearchParams(m[3]||''))));
 return respond(res,404,{error:'Not found'});
});
if(require.main===module)server.listen(Number(process.env.PORT||7000),'0.0.0.0',()=>console.log('DC Timeline v3.0.1 ready'));
module.exports={server,manifest,getCatalog,all};
