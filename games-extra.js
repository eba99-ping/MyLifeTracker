export const extraGames = {
  maze: ['Лабиринт', 'алхам'],
  words: ['Нууц үг', 'зөв'],
  lamps: ['Гэрэл унтраагч', 'нүүдэл'],
  math: ['Тооны сорил', 'зөв'],
  four: ['4 дараалуулах', 'нүүдэл']
};

export function makeMaze(random=Math.random){
  const size=11, cells=Array(size*size).fill(false), stack=[12];
  cells[12]=true;
  while(stack.length){
    const at=stack.at(-1), x=at%size, y=Math.floor(at/size);
    const options=[[2,0],[-2,0],[0,2],[0,-2]]
      .filter(([dx,dy])=>x+dx>0&&x+dx<10&&y+dy>0&&y+dy<10&&!cells[at+dy*size+dx]);
    if(!options.length){stack.pop();continue;}
    const [dx,dy]=options[Math.floor(random()*options.length)];
    const next=at+dy*size+dx;
    cells[(at+next)/2]=cells[next]=true;
    stack.push(next);
  }
  return cells;
}

export function toggleLamp(board,index){
  const copy=[...board], x=index%4, y=Math.floor(index/4);
  const adjacent=[index,x>0?index-1:-1,x<3?index+1:-1,y>0?index-4:-1,y<3?index+4:-1];
  for(const cell of adjacent)if(cell>=0)copy[cell]=!copy[cell];
  return copy;
}

export function dropIndex(board,col){
  for(let row=5;row>=0;row--)if(!board[row*7+col])return row*7+col;
  return -1;
}

export function fourWins(board,index){
  const mark=board[index];
  if(!mark)return false;
  for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
    let count=1;
    for(const direction of [-1,1]){
      let x=index%7+dx*direction,y=Math.floor(index/7)+dy*direction;
      while(x>=0&&x<7&&y>=0&&y<6&&board[y*7+x]===mark){
        count++;x+=dx*direction;y+=dy*direction;
      }
    }
    if(count>=4)return true;
  }
  return false;
}

const vocabulary=[
  ['МУУР','Мяу гэж дуугардаг амьтан'],
  ['САР','Шөнө тэнгэрт гэрэлтдэг, дэлхийн дагуул'],
  ['ЦАС','Өвөл тэнгэрээс унах цагаан ширхэг'],
  ['МОД','Үндэс, иш, мөчиртэй ургамал'],
  ['ЗАГАС','Усанд сэлж, заламгайгаар амьсгалдаг'],
  ['НОМ','Хуудас эргүүлж уншдаг зүйл'],
  ['ГОЛ','Урсаж байдаг ус'],
  ['БАЛ','Зөгий цэцгийн шүүсээр хийдэг амттан']
];

export function mountExtra(id,root,{announce,finish,shuffle}){
  root.replaceChildren();
  let ended=false;
  const node=(tag,text='',className='')=>{
    const element=document.createElement(tag);
    element.textContent=text;
    element.className=className;
    return element;
  };
  const button=(label,action)=>{
    const item=node('button',label,'btn secondary');
    item.type='button';
    item.onclick=()=>{if(!ended)action(item);};
    return item;
  };
  const end=(score,message)=>{
    ended=true;
    root.querySelectorAll('button').forEach(item=>{item.disabled=true;});
    finish(score,message);
  };
  const info=node('p','','extra-game-info');
  root.append(info);
  const grid=(columns,kind)=>{
    const board=node('div','',`extra-grid ${kind}`);
    board.style.setProperty('--columns',columns);
    root.append(board);
    return board;
  };

  if(id==='maze'){
    const field=makeMaze(), board=grid(11,'extra-maze'), goal=108;
    const vectors={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    let position=12,moves=0;
    const cells=field.map(open=>{
      const cell=node('span');
      cell.dataset.open=String(open);
      return cell;
    });
    board.tabIndex=0;
    board.append(...cells);
    cells[goal].textContent='⚑';
    cells[position].textContent='●';
    const move=key=>{
      if(ended)return;
      const [dx,dy]=vectors[key], next=position+dx+dy*11;
      if(!field[next])return;
      cells[position].textContent='';
      position=next;
      cells[position].textContent='●';
      info.textContent=`Алхам: ${++moves}`;
      if(position===goal)end(moves,`Гарц оллоо! ${moves} алхам.`);
    };
    board.onkeydown=event=>{
      if(!Object.hasOwn(vectors,event.key))return;
      event.preventDefault();move(event.key);
    };
    const controls=node('div','','merge-controls');
    ['←','↑','↓','→'].forEach((symbol,i)=>controls.append(button(symbol,()=>move(['ArrowLeft','ArrowUp','ArrowDown','ArrowRight'][i]))));
    root.append(controls);
    info.textContent='Алхам: 0';
    announce('Сумтай товчоор хөдөлж, тугтай гарцад хүрээрэй.');
    return;
  }

  if(id==='lamps'){
    let board=Array(16).fill(false),moves=0;
    const field=grid(4,'extra-lamps');
    do{board=shuffle([...Array(16).keys()]).slice(0,5).reduce(toggleLamp,Array(16).fill(false));}
    while(!board.some(Boolean));
    const cells=board.map((_,index)=>button('○',()=>{
      board=toggleLamp(board,index);
      moves++;
      draw();
      if(!board.some(Boolean))end(moves,`Бүх гэрэл унтарлаа! ${moves} нүүдэл.`);
    }));
    function draw(){
      info.textContent=`Нүүдэл: ${moves}`;
      cells.forEach((cell,index)=>{
        cell.textContent=board[index]?'✦':'○';
        cell.setAttribute('aria-pressed',String(board[index]));
        cell.setAttribute('aria-label',`${index+1}-р гэрэл ${board[index]?'асаалттай':'унтраалттай'}`);
      });
    }
    field.append(...cells);draw();
    announce('Нүд дарахад өөрөө болон дөрвөн хөрш нь солигдоно. Бүх гэрлийг унтраа.');
    return;
  }

  if(id==='four'){
    const board=Array(42).fill(''), field=grid(7,'extra-four');
    const display=board.map(()=>node('span'));
    field.append(...display);
    const controls=grid(7,'extra-four-controls');
    let moves=0;
    const columns=Array.from({length:7},(_,col)=>button(String(col+1),()=>{
      const placed=dropIndex(board,col);
      if(placed<0)return;
      board[placed]='X';
      moves++;
      draw();
      if(fourWins(board,placed)){end(moves,`Чи яллаа! ${moves} нүүдэл.`);return;}
      const available=[3,2,4,1,5,0,6].map(column=>dropIndex(board,column)).filter(i=>i>=0);
      if(!available.length){end(0,'Тэнцлээ!');return;}
      let reply=available[0];
      for(const mark of ['O','X']){
        const tactical=available.find(i=>{
          const trial=[...board];trial[i]=mark;
          return fourWins(trial,i);
        });
        if(tactical!==undefined){reply=tactical;break;}
      }
      board[reply]='O';draw();
      if(fourWins(board,reply))end(0,'Компьютер яллаа.');
      else if(board.every(Boolean))end(0,'Тэнцлээ!');
    }));
    function draw(){
      info.textContent=`Чи X · Компьютер O · Нүүдэл: ${moves}`;
      display.forEach((cell,index)=>{cell.textContent=board[index];cell.dataset.mark=board[index];});
      columns.forEach((cell,index)=>{cell.disabled=dropIndex(board,index)<0;});
    }
    controls.append(...columns);draw();
    announce('Баганын дугаар дээр дарж, дөрвөн X-ийг нэг шугамд оруулаарай.');
    return;
  }

  const words=id==='words'?shuffle(vocabulary).slice(0,5):null;
  const total=words?words.length:10;
  const question=node('h4','','extra-question');
  const answer=node('p','','extra-answer');
  const options=node('div','','extra-options');
  let index=0,score=0,graded=false;
  const next=button('Дараах →',()=>{
    index++;
    if(index===total){end(score,`${score} / ${total} зөв!`);return;}
    renderQuestion();
  });
  root.append(question,answer,options,next);
  function grade(correct,solution){
    if(graded)return;
    graded=true;
    if(correct)score++;
    options.querySelectorAll('button').forEach(item=>{item.disabled=true;});
    answer.textContent=correct?'✓ Зөв!':`Зөв хариулт: ${solution}`;
    next.hidden=false;
    next.textContent=index===total-1?'Дүн харах':'Дараах →';
  }
  function renderQuestion(){
    graded=false;
    info.textContent=`Сорил ${index+1} / ${total} · ${score} зөв`;
    answer.textContent='';
    next.hidden=true;
    options.replaceChildren();
    if(words){
      const [word,clue]=words[index];
      let entered='';
      const letters=shuffle([...word]).map(letter=>button(letter,item=>{
        entered+=letter;item.disabled=true;answer.textContent=entered;
        if(entered.length===word.length)grade(entered===word,word);
      }));
      const clear=button('↶ Арилгах',()=>{
        entered='';answer.textContent='';
        letters.forEach(item=>{item.disabled=false;});
      });
      question.textContent=clue;
      options.append(...letters,clear);
    }else{
      const a=2+Math.floor(Math.random()*10), b=2+Math.floor(Math.random()*9);
      const multiply=index>=4, correct=multiply?a*b:a+b;
      question.textContent=`${a} ${multiply?'×':'+'} ${b} = ?`;
      const choices=shuffle([correct,correct-2,correct+1,correct+3]);
      options.append(...choices.map(value=>button(String(value),()=>grade(value===correct,correct))));
    }
  }
  renderQuestion();
  announce(words?'Тайлбарыг уншаад үсгүүдийг зөв дарааллаар дар.':'Арван бодлогын зөв хариуг сонго.');
}
