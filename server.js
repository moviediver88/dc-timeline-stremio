 'use strict';
const http=require('node:http');
const seed=require('./catalog.json');
const custom=require('./custom-titles.json');
const configs=require('./collections.json');
const tags=require('./tags.json');
const {URL,URLSearchParams}=require('node:url');
const yearNow=new Date().getUTCFullYear();
const all=[...seed,...custom].map((r,i)=>{
 const [name,year,type,universe,id,releaseDate]=Array.isArray(r)?r:[r.name,r.year,r.type,r.universe,r.id,r.releaseDate];
 const key=`${name}|${year}`;
 const explicit=tags[key]||tags[name]||[];
 const auto=[];
 if(universe==='Animation')auto.push('animation');
 if(['Batman','Nolan Batman','The Batman'].includes(universe)||/batman/i.test(name))auto.push('batman');
 if(universe==='Superman'||/superman/i.test(name))auto.push('superman');
 if(/justice league/i.test(name))auto.push('justice_league');
 if(/teen titans/i.test(name))auto.push('teen_titans');
 if(/harley quinn/i.test(name))auto.push('harley_quinn');
 if(/joker/i.test(name))auto.push('joker');
 if(/wonder woman/i.test(name))auto.push('wonder_woman');
 if(/aquaman/i.test(name))auto.push('aquaman');
 if(/shazam/i.test(name))auto.push('shazam');
 if(/watchmen/i.test(name))auto.push('watchmen');
 if(/flash/i.test(name))auto.push('the_flash');
 if(/suicide squad/i.test(name))auto.push('suicide_squad');
 if(/green lantern/i.test(name))auto.push('green_lantern');
 if(universe==='Animation')auto.push(type==='movie'?'all_dc_animated_movies':'all_dc_animated_series');
 if(type==='series')auto.push(Number(year)<2000?'classic_dc_tv_shows':'modern_dc_tv_shows');
 return {name,year:Number(year),type,universe,id,releaseDate:releaseDate||null,tags:new Set([...explicit,...auto]),i};
}).filter(x=>['movie','series'].includes(x.type));
const timelines={
 dceu:['Wonder Woman','Wonder Woman 1984','Man of Steel','Batman v Superman: Dawn of Justice','Suicide Squad','Justice League','Aquaman','Shazam!','Birds of Prey','The Suicide Squad','Peacemaker','Black Adam','Shazam! Fury of the Gods','The Flash','Blue Beetle','Aquaman and the Lost Kingdom'],
 dcu:['Creature Commandos','Superman'],
 reeves:['The Batman','The Penguin'],
 joker:['Joker','Joker: Folie à Deux'],
 arrowverse:['Arrow','The Flash|2014','Supergirl',"DC's Legends of Tomorrow",'Black Lightning','Batwoman'],
 dcamu:['Justice League: The Flashpoint Paradox','Justice League: War','Justice League Dark','Justice League Dark: Apokolips War'],
 tomorrowverse:['Justice League: Crisis on Infinite Earths – Part One','Justice League: Crisis on Infinite Earths – Part Two','Justice League: Crisis on Infinite Earths – Part Three'],
 dcau:['Batman: The Animated Series','Superman: The Animated Series','Batman Beyond','Justice League|2001','Justice League Unlimited']
};
const universe={dc_universe_dcu_james_gunn:'DCU',dc_extended_universe_dceu:'DCEU',arrowverse_complete_watch_order:'Arrowverse',the_batman_reeves_universe:'The Batman',joker_universe:'Joker',dc_animated_movie_universe_dcamu:'dcamu',tomorrowverse:'tomorrowverse',dc_animated_universe_dcau:'dcau',standalone_dc_productions:'Standalone'};
const aliases={
 'chronological_story_order':'dceu','essential_dc_watch_order':'dceu',
 'dc_universe_dcu_james_gunn':'dcu','dc_extended_universe_dceu':'dceu',
 'arrowverse_complete_watch_order':'arrowverse','the_batman_reeves_universe':'reeves','joker_universe':'joker',
 'dc_animated_movie_universe_dcamu':'dcamu','tomorrowverse':'tomorrowverse','dc_animated_universe_dcau':'dcau'
};
// Short, remote-friendly labels. Catalog IDs remain unchanged so existing installations keep working.
const shortNames={
 all_dc_movies_tv_shows:'DC — All Titles',
 release_order_oldest_first:'Release — Oldest',
 release_order_newest_first:'Release — Newest',
 chronological_story_order:'Story Timeline',
 movies_only:'All Movies', tv_series_only:'All TV Shows',
 upcoming_dc_releases:'Coming Soon', essential_dc_watch_order:'Essential Watch Order',
 dc_universe_dcu_james_gunn:'DCU',dc_extended_universe_dceu:'DCEU',
 arrowverse_complete_watch_order:'Arrowverse',the_batman_reeves_universe:'The Batman Universe',
 joker_universe:'Joker Universe',dc_elseworlds:'Elseworlds',
 dc_animated_movie_universe_dcamu:'DCAMU',tomorrowverse:'Tomorrowverse',
 dc_animated_universe_dcau:'DCAU',standalone_dc_productions:'Standalone',
 release_order_within_each_universe:'Universe Release Order',
 all_dc_animated_movies:'Animated Movies',all_dc_animated_series:'Animated TV',
 batman_animations:'Batman Animated',superman_animations:'Superman Animated',
 justice_league_animations:'Justice League Animated',
 classic_dc_tv_shows:'Classic TV',modern_dc_tv_shows:'Modern TV',
 dc_kids_family:'Kids & Family',dc_lego_movies_specials:'LEGO Specials',
 dc_animated_shorts:'Animated Shorts',crossover_event_watch_orders:'Crossovers',
 connected_movies_tv_episodes:'Connected Stories',character_origin_stories:'Origin Stories',
 villain_focused_stories:'Villains',live_action_only:'Live Action',
 animation_only:'Animation',dc_movies_by_decade:'Movies by Decade',
 dc_tv_shows_by_decade:'TV by Decade',completed_series:'Completed TV',
 newly_released_titles:'New Releases'
};
const priority=['all_dc_movies_tv_shows','release_order_oldest_first','release_order_newest_first',
 'chronological_story_order','movies_only','tv_series_only','upcoming_dc_releases',
 'dc_extended_universe_dceu','dc_universe_dcu_james_gunn','arrowverse_complete_watch_order',
 'batman','superman'];
const sortedConfigs=[...configs].sort((a,b)=>{
 const ai=priority.indexOf(a.id),bi=priority.indexOf(b.id);
 if(ai!==-1||bi!==-1)return (ai===-1?Infinity:ai)-(bi===-1?Infinity:bi);
 return 0;
});
const catalogs=sortedConfigs.flatMap(c=>['movie','series'].filter(type=>
 !((c.id==='movies_only'||c.id==='all_dc_animated_movies'||c.id==='dc_movies_by_decade')&&type==='series')&&
 !((c.id==='tv_series_only'||c.id==='all_dc_animated_series'||c.id==='dc_tv_shows_by_decade')&&type==='movie')
 ).map(type=>({id:`dc_${c.id}_${type}`,type,
 name:shortNames[c.id]||c.name,
 extra:[{name:'search',isRequired:false},{name:'skip',isRequired:false}]})));
const manifest={id:'community.dc.timeline.catalog',version:'2.1.0',name:'DC Timeline — Free Catalog',description:'Independent fan catalog: release order, curated DC universes, characters and animation. Some catalogs are incomplete. Not affiliated with DC. No streams hosted.',resources:['catalog'],types:['movie','series'],catalogs,behaviorHints:{configurable:false}};
function releaseSort(a,b){return (a.releaseDate&&b.releaseDate?a.releaseDate.localeCompare(b.releaseDate):a.year-b.year)||a.i-b.i;}
function matchTimeline(entry,label){return entry.name===label || `${entry.name}|${entry.year}`===label;}
function getCatalog(type,id,extra={}){
 const conf=configs.find(c=>`dc_${c.id}_${type}`===id);
 if(!conf||!catalogs.some(c=>c.id===id))return {metas:[]};
 const c=conf.id;
 let rows=all.filter(x=>x.type===type);
 if(c==='upcoming_dc_releases')rows=rows.filter(x=>x.year>yearNow);
 else if(c==='newly_released_titles')rows=rows.filter(x=>x.year>=yearNow-1&&x.year<=yearNow);
 else if(c==='live_action_only')rows=rows.filter(x=>x.universe!=='Animation');
 else if(c==='animation_only'||c==='all_dc_animated_movies'||c==='all_dc_animated_series')rows=rows.filter(x=>x.universe==='Animation');
 else if(c==='dc_movies_by_decade'||c==='dc_tv_shows_by_decade')rows=rows.slice();
 else if(c==='dc_elseworlds')rows=rows.filter(x=>['Joker','The Batman','Nolan Batman'].includes(x.universe));
 else if(c==='standalone_dc_productions')rows=rows.filter(x=>x.universe==='Standalone');
 else if(c==='release_order_within_each_universe')rows=rows.filter(x=>['DCEU','DCU','Arrowverse','The Batman','Joker','Nolan Batman'].includes(x.universe));
 else if(universe[c]&&!['dcamu','tomorrowverse','dcau'].includes(universe[c]))rows=rows.filter(x=>x.universe===universe[c]);
 else if(!['all_dc_movies_tv_shows','release_order_oldest_first','release_order_newest_first','chronological_story_order','movies_only','tv_series_only','essential_dc_watch_order'].includes(c))rows=rows.filter(x=>x.tags.has(c));
 if(aliases[c]){
  const order=timelines[aliases[c]];
  rows=order.flatMap(name=>rows.filter(x=>matchTimeline(x,name)));
 } else if(c==='release_order_within_each_universe')rows.sort((a,b)=>a.universe.localeCompare(b.universe)||releaseSort(a,b));
 else rows.sort(releaseSort);
 if(c==='release_order_newest_first'||c==='newly_released_titles'||c==='upcoming_dc_releases')rows.reverse();
 const q=String(extra.search||'').trim().toLowerCase();
 if(q)rows=rows.filter(x=>`${x.name} ${x.year} ${x.universe}`.toLowerCase().includes(q));
 const skip=Math.max(0,Math.min(100000,parseInt(extra.skip,10)||0));
 return {metas:rows.slice(skip,skip+100).filter(x=>/^tt\d+$/.test(x.id||'')).map(x=>({id:x.id,type:x.type,name:x.name,releaseInfo:String(x.year),description:`${x.universe} • ${x.releaseDate?'Release: '+x.releaseDate:'Release year: '+x.year}`}))};
}
function respond(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=900'});res.end(JSON.stringify(obj));}
function escape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function home(req,res){
 const host=req.headers.host||'localhost:7000';const proto=req.headers['x-forwarded-proto']==='https'?'https':'http';const url=`${proto}://${host}/manifest.json`;
 let support='';try{const x=new URL(process.env.SUPPORT_URL||'');if(x.protocol==='https:')support=x.href;}catch{}
 const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DC Timeline — Free Stremio Add-on</title><style>body{font:17px/1.6 system-ui;background:#101723;color:#f3f6ff;max-width:800px;margin:40px auto;padding:20px}a{color:#92c5ff}.button{display:inline-block;background:#3477ec;color:white;padding:12px 20px;border-radius:8px;text-decoration:none}section{background:#1d2a3c;padding:20px;border-radius:12px;margin:20px 0}</style><h1>DC Timeline</h1><p>Free, independent DC movie and TV catalog for Stremio.</p><section><h2>Install</h2><a class="button" href="stremio://${escape(host)}/manifest.json">Open in Stremio</a><p>Or paste this URL into Stremio's add-on installer:</p><p><a href="${escape(url)}">${escape(url)}</a></p></section><section><h2>Explore</h2><p>${configs.length} browsing options across Essentials, Universes, Characters, Animation &amp; TV, and Specialty; ${all.length} starter records. No streams are hosted.</p><p><strong>Catalog is incomplete.</strong> Exact premiere dates, crossover episode ordering, some animated universes, future titles, and decade filters require additional metadata. Chronological story order is currently a DCEU-oriented starter watch order, not a universal timeline.</p></section>${support?`<section><h2>Support development (optional)</h2><a class="button" rel="noopener noreferrer" href="${escape(support)}">Donate</a></section>`:''}<p><small>Unofficial fan project. Not affiliated with DC, Warner Bros., or Stremio.</small></p></html>`;
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);
}
const server=http.createServer((req,res)=>{
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, OPTIONS'});return res.end();}
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/')return home(req,res);
 if(url.pathname==='/manifest.json')return respond(res,200,manifest);
 if(url.pathname==='/health')return respond(res,200,{status:'ok',entries:all.length,options:configs.length,catalogs:catalogs.length});
 const m=url.pathname.match(/^\/catalog\/(movie|series)\/([^/]+)(?:\/(.+))?\.json$/);
 if(m){const extra=Object.fromEntries(new URLSearchParams(m[3]||''));return respond(res,200,getCatalog(m[1],m[2],extra));}
 return respond(res,404,{error:'Not found'});
});
if(require.main===module)server.listen(Number(process.env.PORT||7000),'0.0.0.0',()=>console.log('DC Timeline ready'));
module.exports={server,manifest,getCatalog,all};
