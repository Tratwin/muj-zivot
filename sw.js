const CACHE='muj-zivot-2.3.3';
const INDEX=new URL('./index.html',self.location.href).href;
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const c=await caches.open(CACHE);
 const r=await fetch(INDEX,{cache:'reload'});
 if(!r.ok)throw Error('Index HTTP '+r.status);
 await c.put(INDEX,r);
 await Promise.allSettled(['./manifest.webmanifest','./icon-192.png','./icon-512.png'].map(x=>c.add(new Request(new URL(x,self.location.href),{cache:'reload'}))));
 await self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 await Promise.all((await caches.keys()).filter(k=>k.startsWith('muj-zivot-')&&k!==CACHE).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener('message',e=>{if(e.data==='ACTIVATE')e.waitUntil(self.skipWaiting());});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 if(e.request.mode==='navigate'||new URL(e.request.url).pathname===new URL(INDEX).pathname){
 e.respondWith((async()=>{const c=await caches.open(CACHE);try{const r=await fetch(e.request,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);await c.put(INDEX,r.clone());return r;}catch(err){return (await c.match(INDEX))||Response.error();}})());return;
 }
 e.respondWith((async()=>{const c=await caches.open(CACHE);try{const r=await fetch(e.request);if(r.ok)await c.put(e.request,r.clone());return r;}catch(err){return (await c.match(e.request))||Response.error();}})());
});
