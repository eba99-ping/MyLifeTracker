const {test}=require('node:test');
const assert=require('node:assert/strict');
const {accountSummary,validPageToken}=require('../admin-access');
test('admin list exposes account metadata only',()=>{
  const data=accountSummary({uid:'u1',email:'test@example.com',passwordHash:'secret',customClaims:{admin:true},refreshTokens:['secret'],journal:'private',chat:'private',metadata:{creationTime:'date'}});
  assert.deepEqual(Object.keys(data).sort(),['uid','email','name','emailVerified','disabled','createdAt','lastSignInAt'].sort());
  assert.equal(data.createdAt,'date');assert.equal(data.disabled,false);
});
test('pagination input is bounded',()=>{
  assert(validPageToken(undefined));assert(validPageToken('next'));assert(!validPageToken({}));assert(!validPageToken('x'.repeat(2049)));
});
