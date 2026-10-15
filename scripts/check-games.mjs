import assert from 'node:assert/strict';
import fs from 'node:fs';
import {shuffle,neighbors,moveTile,solved,makePuzzle,safeScores,recordScore} from '../games-core.js';
let seed=73;
const random=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const original=[0,1,2,3,4,5,6,7,8];
assert.deepEqual(shuffle(original,random).sort((a,b)=>a-b),original);
assert.deepEqual(neighbors(2),[5,1]);assert.deepEqual(neighbors(0),[3,1]);
assert.equal(moveTile(original,0),null);
assert.deepEqual(moveTile(moveTile(original,7),8),original);
for(let trial=0;trial<300;trial++){
  const board=makePuzzle(random);
  assert.equal(new Set(board).size,9);assert(!solved(board));
  const tiles=board.filter(n=>n!==8);let inversions=0;
  for(let i=0;i<tiles.length;i++)for(let j=i+1;j<tiles.length;j++)if(tiles[i]>tiles[j])inversions++;
  assert.equal(inversions%2,0,'Every shuffled 3×3 puzzle must be solvable');
}
assert.equal(safeScores({memory:{score:-8},plays:Infinity}).memory,null);
assert.equal(safeScores(null).plays,0);
const first=recordScore(null,'reaction',290,1);
const slower=recordScore(first.scores,'reaction',400,2);
assert.equal(slower.improved,false);assert.equal(slower.scores.reaction.score,290);assert.equal(slower.scores.plays,2);
const faster=recordScore(slower.scores,'reaction',220,3);assert(faster.improved);assert.equal(faster.scores.reaction.score,220);
assert.equal(recordScore(faster.scores,'unknown',1).scores.plays,3);
const html=fs.readFileSync('index.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'Games must not duplicate existing IDs');
console.log('PASS: puzzle solvability, legal moves, safe best-score migration and DOM IDs');
