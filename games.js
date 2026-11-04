import {shuffle,neighbors,moveTile,solved,makePuzzle,safeScores,recordScore,mergeBoard,mineNeighbors,mineField,revealMineArea,lineWinner,computerMove} from './games-core.js?v=2.23.0';

const root=document.getElementById('page-games');
if(root){
  const $=id=>document.getElementById(id),KEY='myLifeTracker.games.v1';
  let scores,storageAvailable=true;
  try{scores=safeScores(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{scores=safeScores(null);}
  let game='',round=0,timer=0,ticker=0,started=0,moves=0,finished=false;
  let deck=[],open=[],matched=new Set(),locked=false,board=[],reactionState='idle',greenAt=0,trials=[];
  const animals=[['🐱','Муур'],['🐰','Туулай'],['🐻','Баавгай'],['🦊','Үнэг'],['🐼','Хулсны баавгай'],['🐸','Мэлхий'],['🐧','Оцон шувуу'],['🦋','Эрвээхэй']];
  const scene=`<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360"><rect width="360" height="360" fill="#dceef1"/><circle cx="279" cy="70" r="36" fill="#ffce7b"/><g fill="#fff" opacity=".85"><rect x="28" y="64" width="113" height="21" rx="11"/><ellipse cx="80" cy="61" rx="29" ry="17"/><rect x="160" y="112" width="91" height="18" rx="9"/></g><path d="M0 216 Q90 98 190 202 Q270 124 360 213 V360 H0" fill="#9bc9b3"/><path d="M0 273 Q145 173 360 268 V360 H0" fill="#659c83"/><path d="M0 324 Q160 242 360 312 V360 H0" fill="#447b68"/><rect x="112" y="208" width="103" height="78" rx="7" fill="#f9e7c3"/><path d="M99 216 L163 156 L228 216Z" fill="#cf8d83"/><rect x="151" y="244" width="26" height="42" rx="6" fill="#986e65"/><rect x="122" y="231" width="21" height="20" rx="4" fill="#8fb5c0"/><path d="M164 287 Q186 318 244 360 H123 Q145 319 164 287" fill="#c8c8a2"/><g fill="#f3d493"><circle cx="45" cy="288" r="5"/><circle cx="67" cy="314" r="4"/><circle cx="292" cy="294" r="5"/><circle cx="320" cy="328" r="4"/></g><g fill="#365f50"><rect x="290" y="188" width="8" height="76" rx="4"/><ellipse cx="294" cy="181" rx="29" ry="40"/></g></svg>`;
  const art=`data:image/svg+xml,${encodeURIComponent(scene)}`;
  $('puzzleReference').src=art;
  $('puzzleBoard').style.setProperty('--puzzle-art',`url("${art}")`);
  const unit={memory:'алхалт',reaction:'ms',puzzle:'нүүдэл',merge:'оноо',mines:'секунд',line:'дараалсан ялалт',lights:'шат'};
  const titles={memory:'Хосоо олоорой',reaction:'Гялс дараарай',puzzle:'Бяцхан цэцэрлэг',merge:'2048',mines:'Мина илрүүлэгч',line:'3 дараалуулах',lights:'Гэрлийн хэмнэл'};
  const directions={ArrowLeft:'left',ArrowUp:'up',ArrowDown:'down',ArrowRight:'right'};
  let numbers=[],points=0,mines=null,revealed=new Set(),flags=new Set(),flagMode=false,swipe=null;
  let marks=[],streak=0,sequence=[],lightIndex=0,lightLevel=0;
  const lightButtons=[...root.querySelectorAll('[data-light]')];
  function summaries(){
    for(const id of Object.keys(titles))$('best-'+id).textContent=scores[id]?`Шилдэг: ${Math.round(scores[id].score)} ${unit[id]}`:'Анхны амжилтаа тогтоогоорой';
    $('gamesPlayCount').textContent=`${scores.plays} тоглолт дуусгасан · Энэ төхөөрөмж дээр хадгална`;
    $('gamesStorageNote').textContent=storageAvailable?'Интернетгүй үед ч тоглоно. Амжилт зөвхөн энэ төхөөрөмж дээр хадгалагдана.':'Хадгалах боломжгүй байна. Тоглож болно, гэхдээ энэ удаагийн амжилт хадгалагдахгүй.';
  }
  function announce(text,win=false){$('gameAnnouncement').textContent=text;$('gameAnnouncement').classList.toggle('win',win);}
  function stop(){clearTimeout(timer);clearInterval(ticker);timer=ticker=0;}
  function resetSession(){stop();round++;started=0;moves=0;finished=false;open=[];matched=new Set();locked=false;reactionState='idle';trials=[];}
  function clock(){
    if(started)return;
    started=performance.now();
    const target=game==='memory'?$('memoryTime'):$('puzzleTime');
    ticker=setInterval(()=>target.textContent=`${Math.floor((performance.now()-started)/1000)}с`,1000);
  }
  function result(score,text){
    if(finished)return;finished=true;stop();
    const saved=recordScore(scores,game,score);scores=saved.scores;
    try{localStorage.setItem(KEY,JSON.stringify(scores));}catch{storageAvailable=false;}
    summaries();announce(`${text}${saved.improved?' ✨ Шинэ шилдэг амжилт!':''}`,true);
  }
  function showGame(id){
    if(!Object.hasOwn(titles,id))return;
    if(game!==id)streak=0;
    resetSession();game=id;$('gamesHub').hidden=true;$('gameStage').hidden=false;
    for(const name of Object.keys(titles))$(name+'Game').hidden=name!==game;
    $('gameTitle').textContent=titles[game];
    $('gamesPauseNote').textContent='';
    if(game==='memory')newMemory();if(game==='reaction')newReaction();if(game==='puzzle')newPuzzle();
    if(game==='merge')newMerge();if(game==='mines')newMines();
    if(game==='line')newLine();if(game==='lights')newLights();
    $('gameTitle').focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'instant'});
  }
  function showHub(note=''){
    resetSession();game='';$('gameStage').hidden=true;$('gamesHub').hidden=false;$('gamesPauseNote').textContent=note;
  }
  function newMemory(){
    deck=shuffle([...animals.keys(),...animals.keys()]);$('memoryMoves').textContent='0';$('memoryPairs').textContent='0 / 8';$('memoryTime').textContent='0с';
    const cards=deck.map((value,index)=>{
      const button=document.createElement('button');button.type='button';button.className='memory-card';button.setAttribute('aria-label',`Нууц карт ${index+1}`);button.setAttribute('aria-pressed','false');
      const back=document.createElement('span');back.className='card-back';back.textContent='✧';back.setAttribute('aria-hidden','true');button.append(back);
      button.addEventListener('click',()=>flip(index));return button;
    });$('memoryBoard').replaceChildren(...cards);announce('Хоёр карт эргүүлээд ижил амьтдыг олоорой. 8 хос бий.');
  }
  function cardView(index,revealed,done=false){
    const button=$('memoryBoard').children[index];button.textContent=revealed?animals[deck[index]][0]:'✧';
    button.classList.toggle('is-open',revealed);button.classList.toggle('is-matched',done);button.disabled=done;
    button.setAttribute('aria-pressed',String(revealed));button.setAttribute('aria-label',revealed?`${animals[deck[index]][1]}${done?', хос олдсон':''}`:`Нууц карт ${index+1}`);
  }
  function flip(index){
    if(game!=='memory'||locked||finished||matched.has(index)||open.includes(index))return;
    clock();open.push(index);cardView(index,true);
    if(open.length<2)return;
    moves++;$('memoryMoves').textContent=String(moves);const [a,b]=open;
    if(deck[a]===deck[b]){
      matched.add(a);matched.add(b);cardView(a,true,true);cardView(b,true,true);open=[];$('memoryPairs').textContent=`${matched.size/2} / 8`;
      announce(`${animals[deck[a]][1]} хос олдлоо! ${matched.size/2}/8.`);
      if(matched.size===16)result(moves,`Бүх хосоо оллоо! ${moves} алхалт · ${Math.floor((performance.now()-started)/1000)} секунд.`);
    }else{
      locked=true;const current=round;announce('Өөр хос байна. Байрлалыг нь санаарай.');
      timer=setTimeout(()=>{if(current!==round||game!=='memory')return;cardView(a,false);cardView(b,false);open=[];locked=false;},850);
    }
  }
  function pad(state,icon,title,subtitle){
    reactionState=state;$('reactionPad').dataset.state=state;$('reactionIcon').textContent=icon;$('reactionTitle').textContent=title;$('reactionHint').textContent=subtitle;
  }
  function newReaction(){
    $('reactionTrials').textContent='0 / 3';$('reactionResults').replaceChildren();
    pad('idle','🌱','Бэлэн үү?','Энд дараад эхлээрэй');announce('Ногоон өнгө, “Одоо!” гэсэн бичиг гармагц дараарай. 3 удаагийн дунджаар оноо тооцно.');
  }
  function waitForGreen(){
    if(finished)return;clearTimeout(timer);const current=round;
    pad('waiting','🌙','Түр хүлээгээрэй…','Ногоон болоход дарна');
    timer=setTimeout(()=>{if(current!==round||game!=='reaction')return;greenAt=performance.now();pad('ready','⚡','Одоо!','Дараарай');},1100+Math.random()*2200);
  }
  function reactionTap(){
    if(game!=='reaction'||finished)return;
    if(['idle','early','between'].includes(reactionState)){waitForGreen();return;}
    if(reactionState==='waiting'){clearTimeout(timer);pad('early','🙈','Арай эрт дарчихлаа','Дараад дахин оролдоорой');announce('Ногоон өнгө болон “Одоо!” бичгийг хүлээгээрэй. Энэ оролдлогыг тооцоогүй.');return;}
    if(reactionState!=='ready')return;
    const elapsed=Math.round(performance.now()-greenAt);trials.push(Math.max(1,elapsed));$('reactionTrials').textContent=`${trials.length} / 3`;
    const chip=document.createElement('span');chip.textContent=`${trials.length}. ${elapsed} ms`;$('reactionResults').append(chip);
    if(trials.length===3){const average=Math.round(trials.reduce((a,b)=>a+b,0)/3);pad('done','✨',`${average} ms`,'3 оролдлогын дундаж');result(average,`Гайхалтай! Таны дундаж хурд ${average} ms.`);}
    else{pad('between','🍃',`${elapsed} ms`,'Дараад дараагийн оролдлогоо эхлүүл');announce(`${trials.length}/3 оролдлого дууслаа. Дараагийнхад бэлэн бол талбайг дарна уу.`);}
  }
  function newPuzzle(){
    board=makePuzzle();$('puzzleMoves').textContent='0';$('puzzleTime').textContent='0с';drawPuzzle();announce('Хоосон нүдний хажуугийн хэсгийг хөдөлгөж, цэцэрлэгийн зургийг эвлүүлээрэй.');
  }
  function drawPuzzle(focusIndex){
    const valid=neighbors(board.indexOf(8));
    const tiles=board.map((value,index)=>{
      const tile=document.createElement('button');tile.type='button';tile.className='puzzle-tile';
      tile.setAttribute('aria-label',value===8?'Хоосон нүд':`${value+1}-р хэсэг, ${Math.floor(index/3)+1}-р мөр ${index%3+1}-р багана${valid.includes(index)?', хөдөлгөж болно':''}`);
      if(value===8){tile.dataset.blank='';tile.disabled=true;}
      else{tile.style.backgroundPosition=`${value%3*50}% ${Math.floor(value/3)*50}%`;const number=document.createElement('span');number.textContent=String(value+1);tile.append(number);tile.disabled=finished;tile.classList.toggle('is-movable',valid.includes(index)&&!finished);tile.addEventListener('click',()=>slide(index));}
      return tile;
    });$('puzzleBoard').replaceChildren(...tiles);
    if(Number.isInteger(focusIndex)&&!finished)$('puzzleBoard').children[focusIndex]?.focus({preventScroll:true});
  }
  function slide(index){
    if(game!=='puzzle'||finished)return;const next=moveTile(board,index);if(!next)return;
    clock();const oldBlank=board.indexOf(8);board=next;moves++;$('puzzleMoves').textContent=String(moves);
    if(solved(board))result(moves,`Зураг эвлэрлээ! ${moves} нүүдэл · ${Math.floor((performance.now()-started)/1000)} секунд.`);
    drawPuzzle(oldBlank);
  }
  function spawnNumber(){
    const empty=numbers.flatMap((value,index)=>value?[]:[index]);
    if(empty.length)numbers[empty[Math.floor(Math.random()*empty.length)]]=Math.random()<.9?2:4;
  }
  function drawMerge(){
    $('mergePoints').textContent=String(points);
    $('mergeBoard').replaceChildren(...numbers.map((value,index)=>{
      const cell=document.createElement('span');
      cell.textContent=value||'';
      cell.dataset.value=String(value);
      cell.setAttribute('aria-label',`${Math.floor(index/4)+1}-р мөр, ${index%4+1}-р багана, ${value||'хоосон'}`);
      return cell;
    }));
  }
  function newMerge(){
    numbers=Array(16).fill(0);points=0;swipe=null;
    spawnNumber();spawnNumber();drawMerge();
    announce('Ижил тоонуудыг нийлүүлж 2048-д хүрээрэй.');
  }
  function shiftNumbers(direction){
    if(game!=='merge'||finished)return;
    const move=mergeBoard(numbers,direction);
    if(!move.changed)return;
    numbers=move.board;points+=move.points;
    spawnNumber();drawMerge();
    if(numbers.includes(2048))result(points,`2048-д хүрлээ! ${points} оноо.`);
    else if(!Object.values(directions).some(next=>mergeBoard(numbers,next).changed)){
      result(points,`Нүүдэл дууслаа. ${points} оноо.`);
    }
  }
  function newMines(){
    mines=null;flags=new Set();revealed=new Set();flagMode=false;
    $('mineMode').setAttribute('aria-pressed','false');
    drawMines();announce('Аюулгүй нүднүүдийг нээж, зургаан мина илрүүлээрэй.');
  }
  function drawMines(exploded){
    const activeIndex=Array.prototype.indexOf.call($('mineBoard').children,document.activeElement);
    $('mineCount').textContent=`${revealed.size} / 30`;
    $('mineFlags').textContent=`${flags.size} / 6`;
    $('mineBoard').replaceChildren(...Array.from({length:36},(_,index)=>{
      const cell=document.createElement('button');
      const open=revealed.has(index),flag=flags.has(index);
      const bomb=finished&&mines?.has(index);
      const count=open?mineNeighbors(index).filter(i=>mines.has(i)).length:0;
      cell.type='button';cell.disabled=finished;
      cell.dataset.open=String(open);cell.dataset.bomb=String(index===exploded);
      cell.textContent=bomb?'💣':flag?'🚩':count||'';
      cell.setAttribute('aria-label',`${Math.floor(index/6)+1}-р мөр, ${index%6+1}-р багана, ${bomb?'мина':flag?'тугтай':open?`${count} мина ойрхон`:'хаалттай'}`);
      cell.onclick=()=>playMine(index,flagMode);
      cell.oncontextmenu=event=>{event.preventDefault();playMine(index,true);};
      return cell;
    }));
    if(activeIndex>=0&&!finished)$('mineBoard').children[activeIndex]?.focus({preventScroll:true});
  }
  function playMine(index,flag){
    if(game!=='mines'||finished||revealed.has(index))return;
    if(flag){
      if(flags.has(index))flags.delete(index);
      else if(flags.size<6)flags.add(index);
      drawMines();return;
    }
    if(flags.has(index))return;
    if(!mines){mines=mineField(index);started=performance.now();}
    if(mines.has(index)){
      finished=true;drawMines(index);announce('Мина таарлаа. Дахин тоглоод үзээрэй.');return;
    }
    revealed=revealMineArea(index,mines,flags,revealed);
    if(revealed.size===30){
      const seconds=Math.max(1,Math.round((performance.now()-started)/1000));
      result(seconds,`Бүх аюулгүй нүд нээгдлээ! ${seconds} секунд.`);
    }
    drawMines();
  }
  function drawLine(){
    $('lineStreak').textContent=String(streak);
    $('lineBoard').replaceChildren(...marks.map((mark,index)=>{
      const cell=document.createElement('button');
      cell.type='button';
      cell.textContent=mark;
      cell.dataset.mark=mark;
      cell.disabled=finished||locked||!!mark;
      cell.setAttribute('aria-label',`${index+1}-р нүд, ${mark||'хоосон'}`);
      cell.onclick=()=>placeMark(index);
      return cell;
    }));
  }
  function newLine(){
    marks=Array(9).fill('');
    drawLine();announce('Чиний ээлж. X тавих нүдээ сонго.');
  }
  function finishLine(){
    const winner=marks[lineWinner(marks)];
    if(!winner&&marks.includes(''))return false;
    if(winner==='X'){
      streak++;
      result(streak,`Чи яллаа! ${streak} дараалсан ялалт.`);
    }else{
      finished=true;streak=0;
      announce(winner==='O'?'Компьютер яллаа. Дахин тоглоод үзээрэй.':'Тэнцлээ. Дахин тоглож болно.');
    }
    drawLine();
    return true;
  }
  function placeMark(index){
    if(game!=='line'||finished||locked||marks[index])return;
    marks[index]='X';
    if(finishLine())return;
    locked=true;drawLine();announce('Компьютерийн ээлж…');
    timer=setTimeout(()=>{
      const next=computerMove(marks);
      if(next>=0)marks[next]='O';
      locked=false;
      if(!finishLine()){drawLine();announce('Чиний ээлж.');}
    },420);
  }
  function lightPad(active=-1){
    lightButtons.forEach((button,index)=>{
      button.disabled=finished||locked;
      button.classList.toggle('lit',active===index);
    });
  }
  function newLights(){
    sequence=[];lightLevel=0;
    $('lightsLevel').textContent='0';
    nextLights();
  }
  function nextLights(){
    sequence.push(Math.floor(Math.random()*lightButtons.length));
    locked=true;lightIndex=0;lightPad();announce('Дарааллыг ажиглаарай.');
    const flash=index=>{
      if(index===sequence.length){
        locked=false;lightPad();announce('Одоо ижил дарааллаар дар.');
        return;
      }
      const pad=sequence[index];
      lightPad(pad);announce(lightButtons[pad].getAttribute('aria-label'));
      timer=setTimeout(()=>{
        lightPad();
        timer=setTimeout(()=>flash(index+1),240);
      },Math.max(310,560-lightLevel*12));
    };
    timer=setTimeout(()=>flash(0),850);
  }
  function tapLight(index){
    if(game!=='lights'||finished||locked)return;
    if(index!==sequence[lightIndex]){
      if(lightLevel)result(lightLevel,`Дараалал зөрлөө. ${lightLevel} шат давлаа.`);
      else{finished=true;announce('Дараалал зөрлөө. Дахин эхлүүлээд үзээрэй.');}
      lightPad();return;
    }
    lightIndex++;
    if(lightIndex<sequence.length){announce(`${lightIndex} / ${sequence.length} зөв`);return;}
    lightLevel++;
    $('lightsLevel').textContent=String(lightLevel);
    if(lightLevel===20){result(lightLevel,'20 шатыг бүгдийг давлаа!');lightPad();return;}
    locked=true;lightPad();announce(`${lightLevel}-р шат давлаа!`);
    timer=setTimeout(nextLights,700);
  }
  lightButtons.forEach((button,index)=>button.onclick=()=>tapLight(index));
  $('mineMode').onclick=()=>{flagMode=!flagMode;$('mineMode').setAttribute('aria-pressed',String(flagMode));};
  root.querySelectorAll('[data-merge]').forEach(button=>button.onclick=()=>shiftNumbers(button.dataset.merge));
  $('mergeGame').addEventListener('keydown',event=>{
    if(!Object.hasOwn(directions,event.key))return;
    event.preventDefault();shiftNumbers(directions[event.key]);
  });
  $('mergeBoard').addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0)return;
    swipe={id:event.pointerId,x:event.clientX,y:event.clientY};
    event.currentTarget.setPointerCapture(event.pointerId);
  });
  $('mergeBoard').addEventListener('pointercancel',()=>{swipe=null;});
  $('mergeBoard').addEventListener('pointerup',event=>{
    if(swipe?.id!==event.pointerId)return;
    const x=event.clientX-swipe.x,y=event.clientY-swipe.y;swipe=null;
    if(Math.max(Math.abs(x),Math.abs(y))<24)return;
    shiftNumbers(Math.abs(x)>Math.abs(y)?(x>0?'right':'left'):(y>0?'down':'up'));
  });
  root.querySelectorAll('[data-play-game]').forEach(button=>button.addEventListener('click',()=>showGame(button.dataset.playGame)));
  $('gameBack').addEventListener('click',()=>{showHub();root.querySelector('[data-play-game]')?.focus({preventScroll:true});});
  $('gameRestart').addEventListener('click',()=>showGame(game));
  $('reactionPad').addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();reactionTap();});
  $('reactionPad').addEventListener('keydown',event=>{if((event.key===' '||event.key==='Enter')&&!event.repeat){event.preventDefault();reactionTap();}});
  $('reactionPad').addEventListener('click',event=>{if(event.detail===0)reactionTap();});
  $('puzzleBoard').addEventListener('keydown',event=>{
    if(game!=='puzzle'||finished)return;const empty=board.indexOf(8),targets={ArrowUp:empty+3,ArrowDown:empty-3,ArrowLeft:empty+1,ArrowRight:empty-1};
    if(!(event.key in targets))return;event.preventDefault();if(neighbors(empty).includes(targets[event.key]))slide(targets[event.key]);
  });
  const pause=()=>{if(game)showHub('Тоглолтыг түр зогсоолоо. Хүссэн тоглоомоо сонгоод дахин эхлүүлээрэй.');};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  new MutationObserver(()=>{if(!root.classList.contains('active'))pause();}).observe(root,{attributes:true,attributeFilter:['class']});
  summaries();
}
