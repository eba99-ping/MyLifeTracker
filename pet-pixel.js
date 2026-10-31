/* Original code-native pixel companions; transparent, recolorable, no image downloads. */
globalThis.TemuulPixelPet = (()=>{
  function growth(rawXP=0){
    const xp=Math.max(0,Number(rawXP)||0);
    const stages=[{id:'baby',name:'Baby',icon:'🐣',level:1,start:0,next:420,nextLevel:4,size:.72,body:'.84 .78',head:1.1},{id:'junior',name:'Өсвөр',icon:'🌱',level:4,start:420,next:1260,nextLevel:7,size:.87,body:'.94 .93',head:1.02},{id:'adult',name:'Том',icon:'✨',level:7,start:1260,next:null,nextLevel:null,size:1,body:'1 1',head:.94}];
    const stage=xp>=1260?stages[2]:xp>=420?stages[1]:stages[0];
    return {...stage,progress:stage.next?Math.min(100,Math.floor((xp-stage.start)/(stage.next-stage.start)*100)):100,remaining:stage.next?Math.max(0,stage.next-xp):0};
  }
  function artwork(record){
    const stage=growth(record.xp);
    const shape=['cat','bear','bunny','panda'].includes(record.shape)?record.shape:'bunny';
    const color=/^#[0-9a-f]{6}$/i.test(record.color||'')?record.color:'#8b72ff';
    const tint=(target,a)=>'#'+[1,3,5].map(i=>Math.round(parseInt(color.slice(i,i+2),16)*(1-a)+target*a).toString(16).padStart(2,'0')).join('');
    const ink='#25212c',cream='#fff5e7',coat=color,shade=tint(35,.25),light=tint(255,.35),pink='#f4a8ba';
    const r=(x,y,w,h,c,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" ${extra}/>`;
    const p=(d,c)=>`<path d="${d}" fill="${c}"/>`;
    let ears='';
    if(shape==='cat')ears=p('M6 10V3H10V5H12V8H20V5H22V3H26V10Z',ink)+p('M7 9V4H9V6H11V9ZM21 9V6H23V4H25V9Z',coat)+r(8,6,2,3,pink)+r(22,6,2,3,pink);
    else if(shape==='bunny')ears=p('M7 10V2H8V0H12V2H13V9H19V2H20V0H24V2H25V10Z',ink)+r(8,2,4,8,coat)+r(20,2,4,8,coat)+r(9,3,2,6,pink)+r(21,3,2,6,pink);
    else ears=p('M5 10V5H6V4H11V5H12V10ZM20 10V5H21V4H26V5H27V10Z',ink)+r(7,6,3,3,shape==='panda'?ink:pink)+r(22,6,3,3,shape==='panda'?ink:pink);
    const tail=shape==='cat'?p('M24 27H28V20H32V29H30V31H23Z',ink)+p('M25 28H29V21H31V28H29V30H25Z',coat):shape==='bunny'?r(25,24,4,4,ink)+r(26,25,2,2,cream):'';
    const body=p('M10 18H22V20H24V26H26V31H6V27H8V21H10Z',ink)+p('M11 19H21V21H23V28H24V30H8V28H10V22H11Z',coat)+r(19,23,4,6,shade)+p('M13 20H19V21H20V25H18V26H14V25H12V21H13Z',cream);
    const limb=(id,markup)=>`<g data-pet-leg="${id}">${markup}</g>`;
    const limbs=limb(0,r(8,21,3,6,shape==='panda'?ink:shade))+limb(1,r(21,21,3,6,shape==='panda'?ink:shade))+limb(2,r(7,28,7,3,ink)+r(8,28,4,2,shape==='panda'?ink:coat))+limb(3,r(18,28,7,3,ink)+r(19,28,4,2,shape==='panda'?ink:coat));
    const head=p('M9 7H23V8H26V10H28V17H27V19H25V21H7V20H5V18H4V11H6V9H9Z',ink)+p('M10 8H22V9H25V11H27V17H26V18H24V20H8V19H6V17H5V12H7V10H10Z',coat)+r(7,10,2,5,shape==='panda'?'#fffdf6':light)+r(24,12,2,5,shade);
    const patches=shape==='panda'?p('M8 11H12V12H13V15H11V16H8V15H7V12H8ZM20 11H24V12H25V15H24V16H21V15H19V12H20Z',ink):shape==='cat'?p('M7 14H11V15H12V17H14V18H18V17H20V15H21V14H25V18H23V19H9V18H7Z',cream):p('M12 15H20V16H22V18H20V19H12V18H10V16H12Z',cream);
    const eye=(x)=>`<g class="pet-eye">${r(x,12,2,4,ink)}${r(x,12,1,1,'#fff')}${shape==='panda'?r(x+1,13,1,1,'#fff'):''}</g>`;
    const face=patches+eye(10)+eye(21)+r(15,15,3,2,ink)+r(16,17,1,2,ink)+r(13,18,2,1,ink)+r(18,18,2,1,ink)+r(7,16,3,1,pink,'class="pet-cheek"')+r(23,16,3,1,pink,'class="pet-cheek"');
    const whiskers=shape==='cat'?r(2,15,5,1,ink)+r(2,18,5,1,ink)+r(25,15,5,1,ink)+r(25,18,5,1,ink):'';
    const bamboo=shape==='panda'?p('M8 21H9V22H11V24H13V26H15V28H16V30H14V28H12V26H10V24H8Z','#62c978')+r(8,21,4,1,'#b9f19b')+r(10,24,4,1,'#b9f19b')+p('M8 20H4V18H7V19H9ZM12 25H16V23H14V24H12Z','#60ce75'):'';
    const accessories={
      sprout:r(15,4,1,4,'#36764d')+p('M15 5H12V4H11V2H14V3H15ZM16 4V2H18V1H20V3H19V4Z','#7fda9d')+r(12,2,2,1,'#bdf2b3')+r(18,1,2,1,'#c6f6bb')+r(14,4,1,1,'#4ca56f'),
      star:p('M15 1H17V3H20V5H18V8H16V7H14V8H12V5H10V3H14V2H15Z','#ffe184')+r(15,3,2,2,'#fff4be')+r(12,5,1,2,'#dcaa52')+r(17,6,1,1,'#dcaa52')+r(15,1,2,1,'#fff4be'),
      flower:p('M14 1H18V3H20V4H22V7H19V9H17V8H15V9H12V7H10V4H12V3H14Z','#b95b8c')+r(14,2,4,6,'#f68eb5')+r(12,4,8,3,'#f68eb5')+r(14,2,2,1,'#ffd4e4')+r(12,4,2,1,'#ffd4e4')+r(15,4,3,3,'#ffe184')+r(15,4,1,1,'#fff4be'),
      crown:p('M9 1H12V3H14V0H17V3H19V1H22V9H9Z','#8f6135')+p('M10 2H11V4H15V1H16V4H20V2H21V8H10Z','#ffd779')+r(10,7,11,1,'#fff0bd')+r(15,5,2,2,'#ad84ef')+r(11,5,1,1,'#eb7b9a')+r(19,5,1,1,'#75cbdc'),
      bow:p('M9 2H12V3H14V4H17V3H19V2H22V9H19V8H17V7H14V8H12V9H9Z','#a44f79')+p('M10 3H12V4H14V5H17V4H19V3H21V8H19V7H17V6H14V7H12V8H10Z','#f68eb5')+r(14,4,3,3,'#ffd4e4')+r(10,3,2,1,'#ffd4e4')+r(19,3,2,1,'#ffd4e4'),
      headphones:p('M4 15V9H5V7H7V6H25V7H27V9H28V15H26V9H24V8H8V9H6V15Z','#46506b')+r(8,6,16,1,'#a9aac9')+r(2,11,5,7,'#25212c')+r(25,11,5,7,'#25212c')+r(3,12,3,5,'#6ae0d7')+r(26,12,3,5,'#6ae0d7')+r(3,12,1,4,'#c9fff0')+r(26,12,1,4,'#c9fff0'),
      wizard:p('M8 7H10V5H11V3H12V0H16V2H18V4H20V6H22V7H24V10H7V7Z','#32335e')+p('M9 8H11V5H12V3H13V1H15V3H17V5H19V7H22V8Z','#7867bf')+r(9,8,13,1,'#b9a5ed')+r(12,6,8,1,'#efbd78')+r(14,3,2,2,'#ffe5a0')+r(18,7,1,1,'#fff1bc'),
      halo:p('M10 1H22V2H24V4H22V5H10V4H8V2H10ZM11 2V4H21V2Z','#ffda75')+r(11,1,10,1,'#fff3c2')+r(9,2,1,1,'#fff3c2')+r(25,0,1,3,'#fff3c2')+r(24,1,3,1,'#fff3c2'),
      diamond:p('M11 1H21V2H23V3H24V5H22V6H20V8H18V10H14V8H12V6H10V5H8V3H9V2H11Z','#438eae')+p('M11 2H21V3H23V5H21V6H19V8H17V9H15V8H13V6H11V5H9V3H11Z','#8de7f2')+r(12,3,8,1,'#ecfcff')+r(15,4,2,4,'#e7ffff')+r(10,4,3,1,'#d4faff')
    };
    return `<g data-pet-anatomy="${shape}" data-pet-style="pixel" data-pet-growth="${stage.id}" transform="translate(100 194) scale(${stage.size}) translate(-100 -194)"><g shape-rendering="crispEdges" transform="translate(4 8) scale(6)"><g class="pixel-reaction"><g class="pixel-tail">${tail}</g><g transform="translate(16 26) scale(${stage.body}) translate(-16 -26)"><g class="pixel-body">${body}${limbs}${bamboo}</g></g><g transform="translate(16 21) scale(${stage.head}) translate(-16 -21)"><g class="pixel-head"><g class="pixel-ears">${ears}</g>${head}${face}${whiskers}${accessories[record.accessory]||''}</g></g></g></g></g>`;
  }
  return {artwork,growth};
})();
