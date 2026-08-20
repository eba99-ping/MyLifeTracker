// fcm_setup.js

import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";


// Чиний Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD2IpjP7BGUikR5cc7L2DvW0PYbPPQTPNw",
  authDomain: "my-life-tracker-6c19b.firebaseapp.com",
  projectId: "my-life-tracker-6c19b",
  storageBucket: "my-life-tracker-6c19b.firebasestorage.app",
  messagingSenderId: "932788931683",
  appId: "1:932788931683:web:d19934806548790d39bc56",
  measurementId: "G-10S02Y89LX"
};


// VAPID key
const vapidKey =
"BBCpAXM0GzTHvELm3GugqvGVAS6Sh_BVmHeQys-hydQbjKJxxj-kGQs8jrfC1YaUw792v2NGUHBEu9LLK3aH7tk";


const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);


// Notification асаах
export async function enableNotifications(){

  try {

    const permission =
      await Notification.requestPermission();


    if(permission !== "granted"){
      console.log("Notification зөвшөөрөл өгөөгүй");
      return;
    }


    const token =
      await getToken(
        messaging,
        {
          vapidKey:vapidKey
        }
      );


    console.log(
      "FCM TOKEN:",
      token
    );


    // дараа Firebase Firestore руу хадгална

    return token;


  } catch(error){

    console.error(
      "FCM ERROR:",
      error
    );

  }

}



// App нээлттэй үед notification авах

onMessage(
  messaging,
  (payload)=>{

    console.log(
      "Notification:",
      payload
    );


    new Notification(
      payload.notification?.title ||
      "My Life Tracker",
      {
        body:
        payload.notification?.body ||
        "Reminder"
      }
    );


  }
);
