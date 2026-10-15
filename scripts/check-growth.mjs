import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context=vm.createContext({Date});
vm.runInContext(fs.readFileSync('growth-core.js','utf8'),context);
const G=context.TemuulGrowth;
assert.equal(G.wallet(undefined).coins,0);
assert.equal(G.reward('__proto__:bad'),0);
assert.equal(G.reward('constructor:bad'),0);
assert.equal(G.wallet({earnings:{'task:a':{at:1},'bad':{amount:1000}}}).coins,5);
const a={earnings:Object.fromEntries(Array.from({length:10},(_,i)=>[`task:${i}`,{at:1}])),purchases:{meadow:{at:2}}};
const b={earnings:{'task:0':{at:1}},purchases:{beach:{at:3}}};
const merged=G.mergeEconomy(a,b),wallet=G.wallet(merged);
assert.equal(wallet.coins,25);assert.deepEqual([...wallet.owned],['meadow']);
assert.equal(JSON.stringify(G.wallet(G.mergeEconomy(b,a))),JSON.stringify(wallet));
assert.equal(G.wallet(G.mergeEconomy(a,a)).coins,25);
assert.equal(G.mergeEntries({'2026-10-15':{priority:'old',updatedAt:1}},{'2026-10-15':{priority:'new',updatedAt:2}})['2026-10-15'].priority,'new');
assert.equal(G.previousDate('2026-01-01'),'2025-12-31');
const date='2026-10-15',now=new Date(date+'T12:00:00');
const tasks=[{id:'later',title:'Later',time:'18:00',priority:'high'},{id:'due',title:'Due',time:'10:00'}];
assert.equal(G.nextAction(tasks,date,now).id,'due');
assert.equal(G.nextAction(tasks,date,now,'Later').id,'later');
assert.equal(G.nextAction([{id:'done',title:'Done',doneDates:{[date]:true}}],date,now,'Done'),null);
assert.equal(G.nextAction([],date,now,'Tomorrow priority').title,'Tomorrow priority');
assert.equal(G.nextAction([],date,now,{}),null);
const html=fs.readFileSync('index.html','utf8');
assert.match(html,/if\(focusState.active\)return;/);
assert.match(html,/reviews:TemuulGrowth.mergeEntries/);
assert.match(html,/care:Object.fromEntries/);
assert.match(html,/if\(TemuulGrowth.reward\(eventKey\) && !petState.economy.earnings\[eventKey\]\)/);
console.log('PASS: coin dedupe, deterministic offline purchases, nonnegative wallet, review merge, year boundary, next-action ranking and active-focus guard');

// Exercise the actual form and Focus handlers against an isolated DOM/state.
const nodes=new Map();
function node(selector){if(!nodes.has(selector))nodes.set(selector,{value:'',textContent:'',dataset:{},listeners:{},addEventListener(name,fn){this.listeners[name]=fn;}});return nodes.get(selector);}
const integration=vm.createContext({Date,TemuulGrowth:G,$:node,state:{tasks:[{id:'one',title:'Read',time:'10:00'}],study:{assignments:[]},goals:[],reviews:{}},focusState:{settings:{minutes:25},active:null},petState:{},today:()=>date,visibleTasks(){return this.state.tasks;},uid:()=> 'focus-test',save(){},savePet(){},saveFocus(){},renderFocus(){},renderPet(){},toast(){},switchPage(){}});
// Host functions do not use VM-global `this`.
integration.visibleTasks=()=>integration.state.tasks;
const section=(start,end)=>html.slice(html.indexOf(start),html.indexOf(end,html.indexOf(start)));
vm.runInContext(section('    function startOrPauseFocus(){','    function cancelFocus(){')+section('    function suggestedAction(){',"    $('#eveningReview').addEventListener")+section("    $('#eveningReview').addEventListener",'    setInterval(()=>'),integration);
node('#eveningReview').open=true;node('#eveningReview').listeners.toggle();
node('#reviewWin').value='Finished reading';node('#reviewPriority').value='Write tomorrow';
node('#reviewForm').listeners.submit({preventDefault(){}});
assert.equal(integration.state.reviews[date].priority,'Write tomorrow');
node('#reviewWin').value='';node('#eveningReview').listeners.toggle();assert.equal(node('#reviewWin').value,'Finished reading');
node('#nextActionStart').listeners.click();const active=integration.focusState.active;
assert.equal(active.taskTitle,'Read');assert.equal(active.taskId,'one');assert.equal(active.status,'running');
node('#nextActionStart').listeners.click();assert.equal(integration.focusState.active,active);assert.equal(active.status,'running');
console.log('PASS: actual evening form save/reopen and Focus start/double-click handlers');
