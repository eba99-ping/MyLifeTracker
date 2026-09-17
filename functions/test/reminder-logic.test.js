'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {findDueEvents,localParts,pruneFired,taskOccursOn} = require('../reminder-logic');

test('formats a UTC instant in the user timezone',()=>{
  assert.deepEqual(localParts(new Date('2026-09-16T01:30:00Z'),'Asia/Ulaanbaatar'),{
    date:'2026-09-16',time:'09:30',weekday:3
  });
});

test('supports once, daily, weekdays and weekly schedules',()=>{
  assert.equal(taskOccursOn({date:'2026-09-16',repeat:'once'},'2026-09-16',3),true);
  assert.equal(taskOccursOn({date:'2026-09-16',repeat:'daily'},'2026-09-17',4),true);
  assert.equal(taskOccursOn({date:'2026-09-14',repeat:'weekdays'},'2026-09-19',6),false);
  assert.equal(taskOccursOn({date:'2026-09-09',repeat:'weekly'},'2026-09-16',3),true);
  assert.equal(taskOccursOn({date:'2026-09-01',repeat:'selected-days',days:[1,3,5]},'2026-09-16',3),true);
});

test('finds due tasks and skips completed occurrences',()=>{
  const registry = {timezone:'Asia/Ulaanbaatar',tasks:[
    {id:'a',title:'Deep work',date:'2026-09-01',repeat:'daily',reminderTime:'09:30',priority:'high',doneDates:{}},
    {id:'b',title:'Done',date:'2026-09-16',repeat:'once',reminderTime:'09:30',doneDates:{'2026-09-16':true}}
  ]};
  assert.deepEqual(findDueEvents(registry,new Date('2026-09-16T01:30:30Z'),1),[{
    id:'task:a:2026-09-16:09:30',taskId:'a',date:'2026-09-16',title:'Deep work',priority:'high'
  }]);
});

test('prunes old delivery claims and caps the ledger',()=>{
  const now = Date.parse('2026-09-16T00:00:00Z');
  assert.deepEqual(pruneFired({old:now-15*86400000,recent:now-1000},now),{recent:now-1000});
});
