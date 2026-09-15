import {getApp,getApps,initializeApp} from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js';
import {getMessaging,getToken,isSupported,onMessage} from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging.js';

const firebaseConfig = {
  apiKey:'AIzaSyD2IpjP7BGUikR5cc7L2DvW0PYbPPQTPNw',
  authDomain:'my-life-tracker-6c19b.firebaseapp.com',
  projectId:'my-life-tracker-6c19b',
  storageBucket:'my-life-tracker-6c19b.firebasestorage.app',
  messagingSenderId:'932788931683',
  appId:'1:932788931683:web:d19934806548790d39bc56',
  measurementId:'G-10S02Y89LX'
};
const vapidKey = 'BBCpAXM0GzTHvELm3GugqvGVAS6Sh_BVmHeQys-hydQbjKJxxj-kGQs8jrfC1YaUw792v2NGUHBEu9LLK3aH7tk';
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
let foregroundListenerStarted = false;

export async function enableNotifications(serviceWorkerRegistration){
  if(!await isSupported() || Notification.permission!=='granted') return '';
  const messaging = getMessaging(app);
  const token = await getToken(messaging,{vapidKey,serviceWorkerRegistration});

  if(!foregroundListenerStarted){
    foregroundListenerStarted = true;
    onMessage(messaging,async payload=>{
      const note = payload.notification||{};
      await serviceWorkerRegistration.showNotification(note.title||'My Life Tracker 🔔',{
        body:note.body||payload.data?.body||'Шинэ сануулга ирлээ.',
        icon:note.icon||'/icon-192.png',badge:'/icon-192.png',
        tag:payload.messageId||`push-${Date.now()}`,
        data:{url:payload.fcmOptions?.link||payload.data?.url||'/#today'}
      });
    });
  }
  return token;
}
