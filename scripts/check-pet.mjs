import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync('index.html','utf8');
function section(start,end){
  const a=html.indexOf(start),b=html.indexOf(end,a);
  assert(a>=0&&b>a,`Missing source: ${start}`);
  return html.slice(a,b);
}
const context=vm.createContext({Date,console,PET_KEY:'myLifeTracker.pet.v1',setTimeout(){},toast(){},scheduleCloudSync(){},localStorage:{setItem(){}},cloneData:structuredClone});
vm.runInContext(fs.readFileSync('growth-core.js','utf8'),context);
vm.runInContext(fs.readFileSync('pet-pixel.js','utf8'),context);
vm.runInContext(section('    const PET_LEVELS','    function seedPetFromTracker')+
  section('    function normalizePetAppearance','    function petStreak()')+
  section('    function normalizePetRecord','    function mergePetRecords')+
  'var petState=defaultPetState();'+
  section('    function savePet(','    function defaultQuestState')+
  section('    function awardPetXP','    function computedPetMood'),context);
for(const [xp,level] of [[0,1],[99,1],[100,2],[240,3],[2100,9],[2649,9],[2650,10],[3200,11],[8700,21]]){
  context.petState.xp=xp;
  const info=vm.runInContext('petLevelInfo()',context);
  assert.equal(info.level,level);
  assert(info.current>=0&&info.current<info.needed);
}
context.raw={name:'Old pet',xp:350,xpEvents:{'task:old':1}};
const migrated=vm.runInContext('normalizePetRecord(raw)',context);
assert.equal(migrated.xp,350);assert.equal(migrated.shape,'bunny');
context.raw={...migrated,shape:'cat',color:'#12ABcd',backdrop:'ocean'};
assert.equal(vm.runInContext('normalizePetRecord(raw)',context).shape,'cat');
context.raw={...migrated,shape:'invalid',color:'bad',backdrop:'invalid'};
assert.equal(vm.runInContext('normalizePetRecord(raw)',context).color,'#8b72ff');
vm.runInContext('petState=defaultPetState();awardPetXP("task:new",100);awardPetXP("task:new",100)',context);
assert.equal(context.petState.xp,100);
assert.equal(vm.runInContext('petLevelInfo().level',context),2);
assert.match(html,/grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
console.log('PASS: pet migration, appearance validation, level boundaries, duplicate XP and six-column navigation');
vm.runInContext(section('    function petArtwork','    function renderPet'),context);
for(const shape of ['bunny','bear','cat','panda']){
  context.look={shape,color:'#12abcf',accessory:'crown'};
  const art=vm.runInContext('petArtwork(look,"preview")',context);
  assert(art.includes('shape-rendering="crispEdges"')&&art.includes('#ffd779'));
  assert(art.includes('#12abcf'));
  assert(!art.includes('<image')&&!art.includes('linearGradient'));
  assert(!art.includes('undefined'));
  assert.equal((art.match(/data-pet-leg=/g)||[]).length,4);
  assert(art.includes(`data-pet-anatomy="${shape}"`));
  for(const part of ['pixel-body','pixel-head','pixel-tail','pixel-ears','pixel-reaction'])assert(art.includes(`class="${part}"`));
  assert(!art.includes('NaN'));
}
context.look={shape:'cat',color:'"><script>bad</script>',accessory:'unknown'};
assert(!vm.runInContext('petArtwork(look)',context).includes('<script>'));
assert.match(html,/addEventListener\('input',previewPetAppearance\)/);
for(const accessory of ['none','sprout','star','flower','crown','bow','headphones','wizard','halo','diamond']){
  context.look={shape:'panda',color:'#12abcf',accessory};
  const art=vm.runInContext('petArtwork(look)',context);
  assert(!art.includes('undefined')&&!art.includes('NaN'));
  assert(art.includes('data-pet-style="pixel"'));
}
for(const shape of ['bunny','bear','cat','panda']){
  context.look={shape,color:'#fa7ca8',accessory:'none'};
  const pink=vm.runInContext('petArtwork(look)',context);
  context.look.color='#73bdf4';
  const blue=vm.runInContext('petArtwork(look)',context);
  assert(pink.includes('#fa7ca8')&&blue.includes('#73bdf4')&&pink!==blue);
}
console.log('PASS: four recolorable pixel pets, all level accessories, isolated preview and safe color rendering');
const motion=fs.readFileSync('pet-motion.css','utf8');
assert.match(motion,/#page-pet\.active/);assert.match(motion,/prefers-reduced-motion:reduce/);
for(const action of ['pet','feed','play'])assert(motion.includes(`[data-reaction="${action}"]`));
assert.match(html,/clearTimeout\(petReactionTimer\)/);
console.log('PASS: articulated pixel anatomy, active-page motion, reduced-motion support and three care reactions');
for(const [xp,id,progress] of [[0,'baby',0],[419,'baby',99],[420,'junior',0],[1259,'junior',99],[1260,'adult',100],[9999,'adult',100]]){
  const growth=context.TemuulPixelPet.growth(xp);assert.equal(growth.id,id);assert.equal(growth.progress,progress);
  context.look={shape:'cat',color:'#73bdf4',xp};
  assert(vm.runInContext('petArtwork(look)',context).includes(`data-pet-growth="${id}"`));
}
assert.match(html,/selected.id,growth.id/);
assert.equal(context.TemuulPixelPet.growth(-10).id,'baby');
assert.equal(context.TemuulPixelPet.growth('bad').id,'baby');
console.log('PASS: Baby L1 → junior L4 → adult L7 boundaries, visual stages and evolution render cache');
