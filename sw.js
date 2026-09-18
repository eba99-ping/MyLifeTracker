const CACHE = 'ornol-v2.1.0';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/favicon.svg', '/ornol-mark.png', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/fcm_setup.js'];

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
    self.registration.showNotification(note.title||data.title||'Өрнөл 🔔',{
      body:note.body||payload.data?.body||'Шинэ сануулга ирлээ.',icon:note.icon||'/ornol-mark.png',badge:'/icon-192.png',
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
