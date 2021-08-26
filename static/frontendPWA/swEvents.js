self.importScripts('/frontendPWA/dexie.js');
const syncEvents = [];
const db = new Dexie("post_cache");
db.version(1).stores({
  post_cache: 'key,response,timestamp'
});

self.addEventListener('push', function(e) {
  var body;

  if (e.data) {
    body = e.data.text();
  } else {
    body = 'Push message no payload';
  }

  var options = {
    body: body,
    icon: '/images/newLogos/SwiftmoBadgeWHITEBACKGROUNDCIRCLE.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {action: 'explore', title: 'Explore this new world',
        icon: 'images/checkmark.png'},
      {action: 'close', title: 'I don\'t want any of this',
        icon: 'images/xmark.png'},
    ]
  };
  e.waitUntil(
    self.registration.showNotification('Push Notification', options)
  );
});


self.addEventListener('install', evt =>{
  evt.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/frontendPWA/manifest.json',
        '/frontendPWA/dexie.js',
        '/',
        '/shop',
        '/about',
        '/blog'
      ]);
    })
  );

});

self.addEventListener('fetch', event =>{
  if(event.request.method === "GET" && !event.request.url.includes('/backend') && !event.request.url.includes('/video')){
    event.respondWith(
      (async ()=>{
        //open cache:
        let openCache = await caches.open('v1');
        //find match in cache:
        let cacheMatch = await openCache.match(event.request);

        if(cacheMatch){
          //fetch new if possible:
          fetchNew(event);
          return cacheMatch;
        }
        else{
          //networkFetch === network response
          let networkFetch = await fetch(event.request);
          let cacheNetworkFetch = await openCache.put(event.request.url, networkFetch.clone());
          return networkFetch;
        }


     })()
   );

    function fetchNew(event){
     (async ()=>{
       try {
         let openCache = await caches.open('v1');
         let networkFetch = await fetch(event.request);
         if(networkFetch){
           let cacheNetworkFetch = await openCache.put(event.request.url, networkFetch.clone());
         }else{
           console.warn('Network fetch failed, device is possibly offline');
         }
       } catch (e) {
         console.warn('Offline');
         return;
       }
     }
   )()
  }
 }
});
