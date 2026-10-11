import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html = fs.readFileSync('index.html','utf8');
const start = html.indexOf('    async function cloudProviderAction(provider)');
const end = html.indexOf("    $$('[data-auth-tab]')",start);
const source = html.slice(start,end);
const makeContext = () => {
  const calls = [];
  const context = {
    calls, googleLoginBusy:false, firebaseReadyBundle:null,
    navigator:{userAgent:'iPhone Safari'}, console:{error(){}},
    setAuthError:message=>calls.push(['message',message]),
    isLocalFilePreview:()=>false, isInstalledApp:()=>true,
    $:()=>({hidden:true}), renderCloudAuthAvailability(){},
    syncFirebaseUserToProfile(){calls.push(['signed-in']);},
    hideAuthScreen(){}, toast(){},
    initFirebaseAuth:async()=>calls.push(['prepare'])
  };
  vm.createContext(context);
  vm.runInContext(source,context);
  return context;
};
const ready = makeContext();
let resolvePopup;
ready.firebaseReadyBundle = {
  auth:{}, GoogleAuthProvider:class {setCustomParameters(){}},
  signInWithPopup(){ready.calls.push(['popup']);return new Promise(resolve=>{resolvePopup=resolve;});}
};
const pending = ready.cloudProviderAction('google');
assert(ready.calls.some(([name])=>name==='popup'),'Popup must start before the first async suspension');
await ready.cloudProviderAction('google');
assert.equal(ready.calls.filter(([name])=>name==='popup').length,1,'Repeated tap must not cancel active popup');
resolvePopup({user:{uid:'test'}});
await pending;
assert.equal(ready.googleLoginBusy,false);
const cold = makeContext();
await cold.cloudProviderAction('google');
assert(cold.calls.some(([name])=>name==='prepare'));
assert(!cold.calls.some(([name])=>name==='popup'),'Cold load needs a fresh user tap');
const failed = makeContext();
failed.firebaseReadyBundle={...ready.firebaseReadyBundle,signInWithPopup:async()=>{throw {code:'auth/popup-blocked'};}};
failed.firebaseErrorMessage=()=> 'Popup blocked';
await failed.cloudProviderAction('google');
assert.equal(failed.googleLoginBusy,false);
assert(failed.calls.some(([name,message])=>name==='message' && message.includes('auth/popup-blocked')));
console.log('Google auth timing, duplicate-tap, cold-load and error recovery checks passed.');
