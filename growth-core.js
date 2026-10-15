/* Shared, deterministic personal-growth rules. No network or browser dependencies. */
globalThis.TemuulGrowth = (() => {
  const shop = [
    {id:'meadow',name:'🌼 Цэцэгт тал',price:25,color:'linear-gradient(145deg,#166534,#86efac)'},
    {id:'beach',name:'🏖️ Далайн эрэг',price:40,color:'linear-gradient(145deg,#0369a1,#fde68a)'},
    {id:'moon',name:'🌙 Сарны өрөө',price:60,color:'linear-gradient(145deg,#172554,#a78bfa)'},
    {id:'toy',name:'🧸 Хамтрагч бамбарууш',price:35,prop:'🧸'},
    {id:'plant',name:'🪴 Мини цэцэрлэг',price:20,prop:'🪴'}
  ];
  const object = value => value && typeof value==='object' && !Array.isArray(value) ? value : {};
  function mergeEntries(a,b){
    const result={...object(a)};
    for(const [key,value] of Object.entries(object(b))){
      if(!result[key] || Number(value?.at||value?.updatedAt||0)>Number(result[key]?.at||result[key]?.updatedAt||0)) result[key]=value;
    }
    return result;
  }
  function reward(key){const rewards={task:5,'goal-step':8,goal:25,habit:3,assignment:5,focus:8};const kind=String(key).split(':')[0];return Object.hasOwn(rewards,kind)?rewards[kind]:0;}
  function economy(raw={}){return {earnings:object(raw?.earnings),purchases:object(raw?.purchases)};}
  function mergeEconomy(a,b){a=economy(a);b=economy(b);return {earnings:mergeEntries(a.earnings,b.earnings),purchases:mergeEntries(a.purchases,b.purchases)};}
  function wallet(raw){
    const e=economy(raw);let coins=0;const owned=[];
    for(const key of Object.keys(e.earnings)) coins+=reward(key);
    const receipts=Object.entries(e.purchases).filter(([id])=>shop.some(x=>x.id===id)).sort((a,b)=>(Number(a[1]?.at)||0)-(Number(b[1]?.at)||0)||a[0].localeCompare(b[0]));
    for(const [id] of receipts){const price=shop.find(x=>x.id===id).price;if(coins>=price){coins-=price;owned.push(id);}}
    return {coins,owned};
  }
  function previousDate(date){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function nextAction(tasks,date,now,priority=''){
    priority=typeof priority==='string'?priority:'';
    const minutes=now.getHours()*60+now.getMinutes();
    const pending=tasks.filter(t=>!t.doneDates?.[date]);
    const ranked=pending.map(t=>{
      const valid=/^\d{2}:\d{2}$/.test(t.time||'');const [h,m]=(t.time||'00:00').split(':').map(Number);const delta=h*60+m-minutes;
      const match=priority.trim()&&t.title.trim().toLowerCase()===priority.trim().toLowerCase();
      const due=valid&&delta<=0;
      return {id:t.id,title:t.title,score:(match?1000:0)+(t.deadline?400:0)+(due?300:0)+(t.priority==='high'?100:t.priority==='medium'?40:0)+(valid?Math.max(0,60-Math.abs(delta)):0),reason:match?'Өчигдөр сонгосон чухал ажил':t.deadline?`Deadline · ${t.deadline}`:due?`Цаг нь болсон · ${t.time}`:valid?`Төлөвлөсөн цаг · ${t.time}`:'Нэг жижиг алхмаас эхэлье'};
    }).sort((a,b)=>b.score-a.score||String(a.id).localeCompare(String(b.id)));
    if(priority.trim()&&!tasks.some(t=>t.title.trim().toLowerCase()===priority.trim().toLowerCase())) return {id:'',title:priority.trim(),reason:'Өчигдөр сонгосон чухал ажил'};
    return ranked[0]||null;
  }
  return {shop,economy,mergeEconomy,wallet,reward,mergeEntries,previousDate,nextAction};
})();
