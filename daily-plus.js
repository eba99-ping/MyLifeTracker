/* Deterministic study/room helpers. Existing tracker keys are retained. */
globalThis.TemuulDailyPlus=(()=>{
  const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const addDays=(date,n)=>{const d=new Date(`${date}T12:00:00`);d.setDate(d.getDate()+n);return dateKey(d);};
  const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(new Date(s+'T12:00:00').getTime());
  function steps(raw=[]){return (Array.isArray(raw)?raw:[]).slice(0,20).map((s,i)=>({id:String(s?.id||`step-${i}`),text:String(typeof s==='string'?s:s?.text||'').trim().slice(0,160),done:!!s?.done,updatedAt:Math.max(0,Number(s?.updatedAt)||0)})).filter(s=>s.text);}
  function stepsFromText(text,old=[],makeId){
    const used=new Set();return String(text||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,20).map(value=>{
      const text=value.slice(0,160),previous=steps(old).find(s=>s.text===text&&!used.has(s.id));
      if(previous){used.add(previous.id);return previous;}
      return {id:makeId(),text,done:false,updatedAt:Date.now()};
    });
  }
  function exams(raw=[]){return (Array.isArray(raw)?raw:[]).slice(0,100).filter(e=>e&&validDate(e.date)).map((e,i)=>({id:String(e.id||`exam-${i}-${e.date}`),title:String(e.title||'Шалгалт').slice(0,100),subject:String(e.subject||'').slice(0,80),date:e.date,topics:(Array.isArray(e.topics)?e.topics:[]).map(s=>String(s).trim().slice(0,160)).filter(Boolean).slice(0,20),createdAt:Number(e.createdAt)||0,updatedAt:Number(e.updatedAt)||0}));}
  function examPlan(exam,today){
    if(!validDate(exam?.date)||!validDate(today)||exam.date<today)return [];
    let remaining=0;for(let i=0;i<=7;i++){if(addDays(today,i)<exam.date)remaining++;else break;}
    const count=Math.max(1,Math.min(7,remaining));
    const topics=exam.topics?.length?exam.topics:['Гол ойлголт, жишээ бодлогууд'];
    return Array.from({length:count},(_,i)=>({date:addDays(today,i),minutes:25,title:i===count-1&&count>1?'Нэгдсэн давтлага + өөрийгөө сорих':topics[i%topics.length]}));
  }
  function nextClass(classes,now=new Date()){
    const today=dateKey(now),candidates=[];
    for(let offset=0;offset<=7;offset++){
      const date=addDays(today,offset),day=new Date(date+'T12:00:00').getDay()||7;
      for(const item of classes||[]){
        if(!item.days?.includes(day)||item.createdDate&&date<item.createdDate||!/^\d{2}:\d{2}$/.test(item.start)||!/^\d{2}:\d{2}$/.test(item.end))continue;
        const start=new Date(`${date}T${item.start}:00`),end=new Date(`${date}T${item.end}:00`);
        if(end<=now||end<=start)continue;
        candidates.push({...item,date,startAt:start.getTime(),endAt:end.getTime(),ongoing:start<=now,minutes:Math.max(0,Math.ceil(((start<=now?end:start)-now)/60000))});
      }
    }
    return candidates.sort((a,b)=>Number(b.ongoing)-Number(a.ongoing)||a.startAt-b.startAt||String(a.id).localeCompare(String(b.id)))[0]||null;
  }
  function roomLayout(pet,owned){
    return ['toy','plant'].filter(id=>owned.includes(id)).map(id=>{
      const raw=pet.roomLayout?.[id];return {id,enabled:raw?raw.enabled!==false:pet.roomProp===id,slot:['left','center','right'].includes(raw?.slot)?raw.slot:id==='toy'?'right':'left'};
    });
  }
  return {dateKey,addDays,steps,stepsFromText,exams,examPlan,nextClass,roomLayout};
})();
