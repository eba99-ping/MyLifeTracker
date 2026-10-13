import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('api/chat.js','utf8').replace(/import .*?;\s*/,'').replace('export default async function handler','async function handler');
async function run(body,{key='test-only',method='POST',failures=[]}={}){
  let calls=0;const res={statusCode:200,setHeader(){},status(n){this.statusCode=n;return this;},json(data){this.data=data;return this;}};
  const context=vm.createContext({process:{env:{GEMINI_API_KEY:key}},console:{error(){}},setTimeout:fn=>fn(),GoogleGenAI:class{models={generateContent:async()=>{const failure=failures[calls++];if(failure)throw failure;return {text:'Тест хариу'};}};}});
  vm.runInContext(source,context);await context.handler({method,body},res);return {...res,calls};
}
assert.equal((await run({message:'  '})).statusCode,400);
assert.equal((await run({message:'x'.repeat(4001)})).statusCode,400);
assert.equal((await run({message:'test',tracker:'bad'})).statusCode,400);
assert.equal((await run({message:'test',tracker:{text:'x'.repeat(40001)}})).statusCode,413);
assert.equal((await run({message:'test'},{key:''})).statusCode,503);
const retried=await run({message:'test'},{failures:[{status:503}]});assert.equal(retried.statusCode,200);assert.equal(retried.calls,2);
const failed=await run({message:'test'},{failures:[{status:503,message:'secret'},{status:503,message:'secret'}]});assert.equal(failed.statusCode,502);assert(!JSON.stringify(failed.data).includes('secret'));
const quota=await run({message:'test'},{failures:[{status:429}]});assert.equal(quota.statusCode,429);assert.equal(quota.calls,1);
assert.equal((await run({message:'test'},{method:'GET'})).statusCode,405);
console.log('PASS: AI validation, bounded retry, quota errors and secret-safe responses');
