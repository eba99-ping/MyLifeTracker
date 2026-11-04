export function shuffle(items,random=Math.random){
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function neighbors(index){
  return [index-3,index+3,index%3?index-1:-1,index%3<2?index+1:-1].filter(i=>i>=0&&i<9);
}
export function moveTile(board,index){
  const blank=board.indexOf(8);
  if(!neighbors(blank).includes(index))return null;
  const result=[...board];[result[blank],result[index]]=[result[index],result[blank]];return result;
}
export function solved(board){return board.length===9&&board.every((value,index)=>value===index);}
export function makePuzzle(random=Math.random){
  let board=Array.from({length:9},(_,i)=>i),previous=-1;
  for(let step=0;step<100;step++){
    const blank=board.indexOf(8),choices=neighbors(blank).filter(index=>index!==previous);
    const index=choices[Math.floor(random()*choices.length)];board=moveTile(board,index);previous=blank;
  }
  return solved(board)?moveTile(board,7):board;
}
export function safeScores(raw){
  const out={version:1,memory:null,reaction:null,puzzle:null,merge:null,mines:null,plays:0};
  if(!raw||typeof raw!=='object')return out;
  for(const key of ['memory','reaction','puzzle','merge','mines']){
    const value=raw[key];
    if(value&&Number.isFinite(value.score)&&value.score>=(key==='merge'?0:1)&&value.score<1e9){
      out[key]={score:value.score,at:Number.isFinite(value.at)?value.at:0};
    }
  }
  if(Number.isSafeInteger(raw.plays)&&raw.plays>=0)out.plays=Math.min(raw.plays,1e8);
  return out;
}
export function recordScore(raw,game,score,now=Date.now()){
  const next=safeScores(raw);
  if(!['memory','reaction','puzzle','merge','mines'].includes(game)||!Number.isFinite(score)||score<(game==='merge'?0:1))return {scores:next,improved:false};
  const improved=!next[game]||(game==='merge'?score>next[game].score:score<next[game].score);
  if(improved)next[game]={score,at:now};
  next.plays++;
  return {scores:next,improved};
}

export function mergeBoard(board,direction){
  const next=[...board];
  let points=0;
  for(let line=0;line<4;line++){
    const indexes=Array.from({length:4},(_,i)=>direction==='left'||direction==='right'?line*4+i:i*4+line);
    if(direction==='right'||direction==='down') indexes.reverse();
    const values=indexes.map(i=>board[i]).filter(Boolean);
    const merged=[];
    for(let i=0;i<values.length;i++){
      if(values[i]===values[i+1]){
        const value=values[i]*2;
        merged.push(value);
        points+=value;
        i++;
      }else merged.push(values[i]);
    }
    indexes.forEach((index,i)=>{next[index]=merged[i]||0;});
  }
  return {board:next,points,changed:next.some((value,i)=>value!==board[i])};
}

export function mineNeighbors(index){
  const row=Math.floor(index/6),col=index%6;
  const result=[];
  for(let r=Math.max(0,row-1);r<=Math.min(5,row+1);r++){
    for(let c=Math.max(0,col-1);c<=Math.min(5,col+1);c++){
      if(r!==row||c!==col)result.push(r*6+c);
    }
  }
  return result;
}

export function mineField(first,random=Math.random){
  const safe=new Set([first,...mineNeighbors(first)]);
  return new Set(shuffle(Array.from({length:36},(_,i)=>i).filter(i=>!safe.has(i)),random).slice(0,6));
}

export function revealMineArea(first,mines,flags,revealed){
  const next=new Set(revealed), queue=[first];
  while(queue.length){
    const index=queue.pop();
    if(next.has(index)||flags.has(index)||mines.has(index))continue;
    next.add(index);
    const around=mineNeighbors(index);
    if(!around.some(i=>mines.has(i)))queue.push(...around);
  }
  return next;
}
