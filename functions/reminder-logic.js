'use strict';

const ALLOWED_REPEATS = new Set(['once','daily','weekdays','weekly','selected-days']);

function safeTimeZone(value){
  const timeZone = String(value||'UTC').slice(0,64);
  try{
    new Intl.DateTimeFormat('en',{timeZone}).format();
    return timeZone;
  }catch{
    return 'UTC';
  }
}

function localParts(instant,timeZone){
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA',{
    timeZone:safeTimeZone(timeZone),year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',hourCycle:'h23'
  }).formatToParts(instant).filter(part=>part.type!=='literal').map(part=>[part.type,part.value]));
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  return {date,time:`${parts.hour}:${parts.minute}`,weekday:new Date(`${date}T12:00:00Z`).getUTCDay()};
}

function taskOccursOn(task,date,weekday){
  const start = String(task.date||'');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(start) || date<start) return false;
  const repeat = ALLOWED_REPEATS.has(task.repeat) ? task.repeat : 'once';
  if(repeat==='daily') return true;
  if(repeat==='weekdays') return weekday>=1 && weekday<=5;
  if(repeat==='weekly') return weekday===new Date(`${start}T12:00:00Z`).getUTCDay();
  if(repeat==='selected-days') return (Array.isArray(task.days)?task.days:[]).map(Number).includes(weekday||7);
  return date===start;
}

function findDueEvents(registry,instant=new Date(),lookbackMinutes=10){
  const tasks = Array.isArray(registry?.tasks) ? registry.tasks.slice(0,300) : [];
  const timezone = safeTimeZone(registry?.timezone);
  const minuteSlots = [];
  const seenSlots = new Set();
  for(let lag=0;lag<=lookbackMinutes;lag++){
    const slot = localParts(new Date(instant.getTime()-lag*60000),timezone);
    const key = `${slot.date}:${slot.time}`;
    if(!seenSlots.has(key)){seenSlots.add(key);minuteSlots.push(slot);}
  }
  const events = [];
  const seenEvents = new Set();
  for(const task of tasks){
    if(!task?.id || !/^\d{2}:\d{2}$/.test(String(task.reminderTime||''))) continue;
    for(const slot of minuteSlots){
      if(task.reminderTime!==slot.time || task.doneDates?.[slot.date] || !taskOccursOn(task,slot.date,slot.weekday)) continue;
      const id = `task:${task.id}:${slot.date}:${task.reminderTime}`;
      if(seenEvents.has(id)) continue;
      seenEvents.add(id);
      events.push({
        id,taskId:String(task.id),date:slot.date,title:String(task.title||'Task').slice(0,120),
        priority:['high','medium','low'].includes(task.priority)?task.priority:'none'
      });
    }
  }
  return events;
}

function pruneFired(fired={},now=Date.now()){
  return Object.fromEntries(Object.entries(fired||{})
    .filter(([,value])=>Number(value)>=now-14*86400000)
    .sort((a,b)=>Number(b[1])-Number(a[1])).slice(0,600));
}

module.exports = {findDueEvents,localParts,pruneFired,safeTimeZone,taskOccursOn};
