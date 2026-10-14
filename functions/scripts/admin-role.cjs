'use strict';
// Owner-only local operation. Uses the already-approved Firebase CLI session;
// credentials are kept in the CLI store and never printed or saved here.
const path=require('node:path');
const {initializeApp}=require('firebase-admin/app');
const {getAuth}=require('firebase-admin/auth');
async function main(){
  const [cliDirectory,email,action='inspect']=process.argv.slice(2);
  if(!cliDirectory||!email||!['inspect','grant'].includes(action)) throw new Error('usage');
  const cliAuth=require(path.join(cliDirectory,'auth.js'));
  const account=cliAuth.getGlobalDefaultAccount();
  if(!account?.tokens?.refresh_token) throw new Error('not-authenticated');
  const credential={async getAccessToken(){
    const result=await cliAuth.getAccessToken(account.tokens.refresh_token,account.tokens.scopes||[]);
    return {access_token:result.access_token,expires_in:3600};
  }};
  const app=initializeApp({projectId:'my-life-tracker-6c19b',credential});
  const auth=getAuth(app),user=await auth.getUserByEmail(email);
  if(user.email?.toLowerCase()!==email.toLowerCase()||user.disabled||!user.emailVerified) throw new Error('account-not-eligible');
  if(action==='grant') await auth.setCustomUserClaims(user.uid,{...user.customClaims,admin:true});
  const checked=await auth.getUser(user.uid);
  console.log(JSON.stringify({uid:checked.uid,email:checked.email,emailVerified:checked.emailVerified,admin:checked.customClaims?.admin===true,action}));
  const token=await credential.getAccessToken();
  const response=await fetch('https://cloudbilling.googleapis.com/v1/projects/my-life-tracker-6c19b/billingInfo',{headers:{Authorization:`Bearer ${token.access_token}`}});
  if(response.ok){const billing=await response.json();console.log(JSON.stringify({billingEnabled:billing.billingEnabled===true}));}
  else console.log(JSON.stringify({billingCheckStatus:response.status}));
}
main().catch(error=>{console.error(JSON.stringify({error:error.code||'admin-operation-failed'}));process.exitCode=1;});
