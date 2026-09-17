// Legacy FCM entry point kept for existing installations. New registrations use /sw.js.
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url||'/#today'));
});

importScripts(
"https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js"
);

importScripts(
"https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js"
);


firebase.initializeApp({
  apiKey: "AIzaSyD2IpjP7BGUikR5cc7L2DvW0PYbPPQTPNw",
  authDomain: "my-life-tracker-6c19b.firebaseapp.com",
  projectId: "my-life-tracker-6c19b",
  messagingSenderId: "932788931683",
  appId: "1:932788931683:web:d19934806548790d39bc56"
});


const messaging = firebase.messaging();


messaging.onBackgroundMessage((payload)=>{
  const note = payload.notification||{};
  const data = payload.data||{};
  self.registration.showNotification(
    note.title || data.title || "Өрнөл 🔔",
    {
      body:note.body||payload.data?.body||"Шинэ сануулга ирлээ.",
      icon:note.icon||'/ornol-mark.png',badge:'/icon-192.png',
      tag:data.eventId||payload.messageId||`push-${Date.now()}`,
      data:{url:payload.fcmOptions?.link||data.url||'/#today',eventId:data.eventId||'',taskId:data.taskId||'',date:data.date||''},
      actions:data.eventId?[{action:'snooze',title:'10 мин snooze'},{action:'open',title:'App нээх'}]:[]
    }
  );

});
