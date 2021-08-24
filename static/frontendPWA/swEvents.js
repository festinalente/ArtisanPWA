//self.importScripts('/backend/js/dexie.js');
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
  if(event.request.method === "GET" && !event.request.url.includes('/backend') && !event.request.url.includes('/video')){
    
   // Init the cache. We use Dexie here to simplify the code. You can use any other
   // way to access IndexedDB of course.
     event.respondWith(
       // First try to fetch the request from the server
       fetch(event.request.clone()).then(function(response) {
         // If it works, put the response into IndexedDB
         cachePut(event.request.clone(), response.clone(), db.post_cache);
         return response;
       })
       .catch(function() {
         // If it does not work, return the cached response. If the cache does not
         // contain a response for our request, it will give us a 503-response
         return cacheMatch(event.request.clone(), db.post_cache);
         /*
          .then((response)=>{
            
            //If nothing is return from cache, we assume this something we intended to put
            // on the server and save it for later sync
            if(!response){
              
              syncEvents.push(event.request.clone());
            }
          });*/
       })
     );


  }

});

/*
   //network first, cache fallback:
   fetch(event.request).catch(function () {
      return caches.match(event.request);
      .then((response) {
            return response || fetch(event.request);
          })
      .then(response => {
       // TODO 5 - Respond with custom 404 page
         return caches.open('v1').then(cache => {
           cache.put(event.request.url, response.clone());
           return response;
         });
     })
   }),
);*/

  //let target = event.request.url.split('/')[4];
  /*
  if(target === 'sales'){
    
  }*/
  // We will cache all POST requests, but in the real world, you will probably filter for
	// specific URLs like if(... || event.request.url.href.match(...))
  //  )
  //

//if(event.request.method === "POST" && target === 'saveitemimage'){


  //syncEvents.push(event.request.clone());
//  }


  //if(event.request.method === "POST" && any(['stock', 'sales'], target)){
