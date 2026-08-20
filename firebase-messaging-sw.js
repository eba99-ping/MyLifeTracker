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
  
  self.registration.showNotification(
    payload.notification.title || "My Life Tracker",
    {
      body: payload.notification.body || "Reminder"
    }
  );

});
