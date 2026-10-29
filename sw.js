const CACHE = 'temuul-v2.9.2';
const APP_SHELL = ['/', '/index.html', '/redesign.css?v=2.9.2', '/motion.css?v=2.9.2', '/launch.css?v=2.9.2', '/growth.css?v=2.9.2', '/growth-core.js?v=2.9.2', '/games.css?v=2.9.2', '/games.js?v=2.9.2', '/games-core.js?v=2.9.2', '/manifest.json', '/favicon.svg?v=2.9.2', '/temuul-mark.png?v=2.9.2', '/icon-192.png?v=2.9.2', '/icon-512.png?v=2.9.2', '/icon-maskable-512.png?v=2.9.2', '/apple-touch-icon.png?v=2.9.2', '/fcm_setup.js'];

self.addEventListener('notificationclick',event => {
  event.notification.close();
  const data = event.notification.data||{};
  event.waitUntil((async()=>{
    const windows = await clients.matchAll({type:'window',includeUncontrolled:true});
    if(event.action==='snooze'){
      const open = windows.find(client=>new URL(client.url).origin===self.location.origin);
      if(open){
        open.postMessage({type:'REMINDER_ACTION',action:'snooze',eventId:data.eventId||''});
        return open.focus();
      }
      return clients.openWindow(`/?reminderAction=snooze&event=${encodeURIComponent(data.eventId||'')}#today`);
    }
    const target = data.url||'/#today';
    const open = windows.find(client=>new URL(client.url).origin===self.location.origin);
    if(open){
      if('navigate' in open) await open.navigate(target);
      return open.focus();
    }
    return clients.openWindow(target);
  })());
});

try{
  importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');
  firebase.initializeApp({
    apiKey:'AIzaSyD2IpjP7BGUikR5cc7L2DvW0PYbPPQTPNw',authDomain:'my-life-tracker-6c19b.firebaseapp.com',
    projectId:'my-life-tracker-6c19b',messagingSenderId:'932788931683',appId:'1:932788931683:web:d19934806548790d39bc56'
  });
  firebase.messaging().onBackgroundMessage(payload=>{
    const note = payload.notification||{};
    const data = payload.data||{};
    return self.registration.showNotification(note.title||data.title||'Тэмүүл 🔔',{
      body:note.body||payload.data?.body||'Шинэ сануулга ирлээ.',icon:note.icon||'/temuul-mark.png?v=2.9.2',badge:'/icon-192.png?v=2.9.2',
      tag:data.eventId||payload.messageId||`push-${Date.now()}`,
      data:{url:payload.fcmOptions?.link||data.url||'/#today',eventId:data.eventId||'',taskId:data.taskId||'',date:data.date||''},
      actions:data.eventId?[{action:'snooze',title:'10 мин snooze'},{action:'open',title:'App нээх'}]:[]
    });
  });
}catch(error){ console.warn('Firebase background messaging unavailable:',error); }

self.addEventListener('install',event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate',event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch',event => {
  if(event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if(/^\/admin(?:\.html)?\/?$/.test(new URL(event.request.url).pathname)){
    event.respondWith(fetch(event.request,{cache:'no-store'}));return;
  }
  if(event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put('/index.html',copy));
      return response;
    }).catch(() => caches.match('/index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if(response.ok) caches.open(CACHE).then(cache => cache.put(event.request,response.clone()));
    return response;
  })));
});

self.addEventListener('message',event => {
  if(event.data === 'SKIP_WAITING') self.skipWaiting();
  if(event.data?.type==='SHOW_NOTIFICATION' && event.data.title){
    event.waitUntil(self.registration.showNotification(event.data.title,event.data.options||{}));
  }
});
