const assert=require('node:assert/strict');
const {server,manifest,getCatalog}=require('./server');
(async()=>{
for(const c of manifest.catalogs)assert.ok(getCatalog(c.type,c.id).metas.length>0, c.name+' has titles');
assert.equal(manifest.name,'DC Timeline');assert.equal(manifest.version,'3.2.0');assert.equal(manifest.catalogs.length,11);assert.ok(manifest.logo.startsWith('https://'));
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const get=async p=>{const r=await fetch(base+p);return {status:r.status,data:await r.json(),headers:r.headers}};
const root=await get('/manifest.json');assert.equal(root.data.catalogs.length,11);assert.equal(root.data.behaviorHints.configurable,true);assert.equal(root.data.config.length,11);
const token=encodeURIComponent(JSON.stringify({dc_batman:'on',dc_superman:'on'}));
const custom=await get('/'+token+'/manifest.json');assert.equal(custom.status,200);assert.deepEqual(custom.data.catalogs.map(c=>c.name),['Batman','Superman']);assert.equal(custom.data.id,manifest.id);assert.equal(custom.data.config.find(c=>c.key==='dc_movies_only').default,'');
const moviesToken=encodeURIComponent(JSON.stringify({dc_movies_only:'on'}));const other=await get('/'+moviesToken+'/manifest.json');assert.equal(other.data.catalogs[0].name,'Movies');assert.equal((await get('/manifest.json')).data.catalogs.length,11);
assert.ok((await get('/'+token+'/catalog/DC/dc_batman.json')).data.metas.length>0);
assert.equal((await get('/'+token+'/catalog/DC/dc_movies_only.json')).status,404);
assert.equal((await get('/'+encodeURIComponent('{}')+'/manifest.json')).status,400);
assert.equal((await get('/'+encodeURIComponent('{"foreign":"on"}')+'/manifest.json')).status,400);
assert.equal((await get('/%7Bbroken/manifest.json')).status,400);
assert.equal((await get('/'+encodeURIComponent('[]')+'/manifest.json')).status,400);
const meta=getCatalog('DC','dc_batman').metas[0];assert.equal((await get('/'+token+'/meta/movie/'+meta.id+'.json')).data.meta.id,meta.id);
for(const p of ['/','/configure','/'+token+'/configure']){const r=await fetch(base+p);const html=await r.text();assert.equal(r.status,200);assert.match(html,/Select all/);assert.match(html,/Deselect all/);assert.match(html,/Install in Stremio/);new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]);}
assert.equal(root.headers.get('access-control-allow-origin'),'*');
console.log('PASS: all 11 catalogs have titles; selected manifests, isolation, metadata, invalid configs, CORS, setup routes and browser script checked.');
server.close();
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
