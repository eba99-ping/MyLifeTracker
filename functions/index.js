'use strict';

const {onSchedule} = require('firebase-functions/v2/scheduler');
const logger = require('firebase-functions/logger');
const {initializeApp} = require('firebase-admin/app');
const {getFirestore} = require('firebase-admin/firestore');
const {getMessaging} = require('firebase-admin/messaging');
const {findDueEvents,pruneFired} = require('./reminder-logic');

initializeApp();
const db = getFirestore();
const APP_URL = 'https://my-life-tracker-seven.vercel.app/#today';
const INVALID_TARGET_CODES = new Set([
  'messaging/invalid-registration-token','messaging/registration-token-not-registered','messaging/invalid-argument'
]);

async function claimReminder(ref,eventId,claimAt){
  return db.runTransaction(async transaction=>{
    const snapshot = await transaction.get(ref);
    if(!snapshot.exists || snapshot.data().enabled!==true) return false;
    const fired = pruneFired(snapshot.data().fired,claimAt);
    if(Number(fired[eventId])>=claimAt-10*60000) return false;
    fired[eventId] = claimAt;
    transaction.update(ref,{fired,lastClaimAt:claimAt});
    return true;
  });
}

async function releaseClaim(ref,eventId,claimAt){
  await db.runTransaction(async transaction=>{
    const snapshot = await transaction.get(ref);
    if(!snapshot.exists) return;
    const fired = pruneFired(snapshot.data().fired,Date.now());
    if(Number(fired[eventId])===claimAt) delete fired[eventId];
    transaction.update(ref,{fired,lastErrorAt:Date.now()});
  });
}

async function deliverReminder(ref,registry,event){
  const tokens = [...new Set((registry.tokens||[]).filter(token=>typeof token==='string' && token.length>20))].slice(0,10);
  if(!tokens.length){await ref.set({enabled:false,lastError:'no-targets',lastErrorAt:Date.now()},{merge:true});return false;}
  const claimAt = Date.now();
  if(!await claimReminder(ref,event.id,claimAt)) return false;

  try{
    const response = await getMessaging().sendEachForMulticast({
      tokens,
      data:{
        title:'Task хийх цаг боллоо 🔔',
        body:`${event.title}${event.priority==='high'?' · High priority':''}`,
        url:APP_URL,eventId:event.id,taskId:event.taskId,date:event.date
      },
      webpush:{headers:{Urgency:event.priority==='high'?'high':'normal'},fcmOptions:{link:APP_URL}}
    });
    const validTokens = tokens.filter((token,index)=>{
      const result = response.responses[index];
      return result?.success || !INVALID_TARGET_CODES.has(result?.error?.code);
    });
    await ref.set({
      tokens:validTokens,enabled:validTokens.length>0,lastDeliveryAt:Date.now(),
      lastDelivery:{eventId:event.id,successCount:response.successCount,failureCount:response.failureCount}
    },{merge:true});
    logger.info('Smart reminder delivered',{uid:ref.id,eventId:event.id,successCount:response.successCount,failureCount:response.failureCount});
    return response.successCount>0;
  }catch(error){
    await releaseClaim(ref,event.id,claimAt);
    logger.error('Smart reminder delivery failed',{uid:ref.id,eventId:event.id,error:String(error?.message||error)});
    return false;
  }
}

exports.sendSmartReminders = onSchedule({
  schedule:'* * * * *',timeZone:'UTC',region:'asia-northeast1',
  memory:'256MiB',timeoutSeconds:60,maxInstances:1,retryCount:0
},async()=>{
  const snapshot = await db.collection('reminderUsers').where('enabled','==',true).limit(500).get();
  let dueCount = 0;
  for(const document of snapshot.docs){
    const registry = document.data();
    const events = findDueEvents(registry,new Date(),10);
    for(const event of events){dueCount+=1;await deliverReminder(document.ref,registry,event);}
  }
  logger.info('Smart reminder scan complete',{registries:snapshot.size,dueCount});
});
