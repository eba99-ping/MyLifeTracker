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
  const out={version:1,memory:null,reaction:null,puzzle:null,plays:0};
  if(!raw||typeof raw!=='object')return out;
  for(const key of ['memory','reaction','puzzle']){
    const value=raw[key];
    if(value&&Number.isFinite(value.score)&&value.score>0&&value.score<1e9){
      out[key]={score:value.score,at:Number.isFinite(value.at)?value.at:0};
    }
  }
  if(Number.isSafeInteger(raw.plays)&&raw.plays>=0)out.plays=Math.min(raw.plays,1e8);
  return out;
}
export function recordScore(raw,game,score,now=Date.now()){
  const next=safeScores(raw);
  if(!['memory','reaction','puzzle'].includes(game)||!Number.isFinite(score)||score<=0)return {scores:next,improved:false};
  const improved=!next[game]||score<next[game].score;
  if(improved)next[game]={score,at:now};
  next.plays++;
  return {scores:next,improved};
}
