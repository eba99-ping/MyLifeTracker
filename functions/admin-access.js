'use strict';
function accountSummary(user){
  return {uid:user.uid,email:user.email||'',name:user.displayName||'',
    emailVerified:user.emailVerified===true,disabled:user.disabled===true,
    createdAt:user.metadata?.creationTime||null,lastSignInAt:user.metadata?.lastSignInTime||null};
}
function validPageToken(value){
  return value===undefined || (typeof value==='string'&&value.length>0&&value.length<=2048);
}
module.exports={accountSummary,validPageToken};
