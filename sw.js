const CACHE = 'temuul-v2.20.0';
const APP_SHELL = ['/', '/index.html', '/redesign.css?v=2.20.0', '/motion.css?v=2.20.0', '/launch.css?v=2.20.0', '/growth.css?v=2.20.0', '/growth-core.js?v=2.20.0', '/pet-pixel.js?v=2.20.0', '/pet-motion.css?v=2.20.0', '/coach.css?v=2.20.0', '/daily-plus.css?v=2.20.0', '/daily-plus.js?v=2.20.0', '/connections.js?v=2.20.0', '/voice.js?v=2.20.0', '/games.css?v=2.20.0', '/games.js?v=2.20.0', '/games-core.js?v=2.20.0', '/manifest.json', '/favicon.svg?v=2.20.0', '/temuul-mark.png?v=2.20.0', '/icon-192.png?v=2.20.0', '/icon-512.png?v=2.20.0', '/icon-maskable-512.png?v=2.20.0', '/apple-touch-icon.png?v=2.20.0', '/fcm_setup.js'];

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
      body:note.body||payload.data?.body||'Шинэ сануулга ирлээ.',icon:note.icon||'/temuul-mark.png?v=2.20.0',badge:'/icon-192.png?v=2.20.0',
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
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('temuul-v') && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch',event => {
  const {request} = event;
  const url = new URL(request.url);
  if(request.method !== 'GET' || url.origin !== self.location.origin) return;
  if(/^\/admin(?:\.html)?\/?$/.test(url.pathname)){
    event.respondWith(fetch(event.request,{cache:'no-store'}));return;
  }
  if(request.mode === 'navigate'){
    if(url.pathname !== '/' && url.pathname !== '/index.html') return;
    event.respondWith((async()=>{
      const offlineShell = () => caches.open(CACHE).then(cache => cache.match('/')).catch(() => null);
      try{
        const response = await fetch(request);
        return response.status >= 500 ? await offlineShell() || response : response;
      }catch{
        return await offlineShell() || Response.error();
      }
    })());
    return;
  }
  if(!APP_SHELL.includes(url.pathname + url.search)) return;
  event.respondWith(caches.open(CACHE).then(cache => cache.match(request)).catch(() => null)
    .then(cached => cached || fetch(request)));
});

self.addEventListener('message',event => {
  if(event.data === 'SKIP_WAITING') self.skipWaiting();
  if(event.data?.type==='SHOW_NOTIFICATION' && event.data.title){
    event.waitUntil(self.registration.showNotification(event.data.title,event.data.options||{}));
  }
});
