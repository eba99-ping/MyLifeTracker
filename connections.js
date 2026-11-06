globalThis.TemuulConnections = (() => {
  const find = id => document.getElementById(id);
  let sdk, user, selected, stopList, stopMessages, scope = 0;
  let records = [];
  let busy = false;
  let listeningId = '';
  let profileThread = '';
  let requestedThread = '';
  let handle='', attachment=null, recording=null, recordingTimer;
  let publisher=null;
  const friendProfiles=new Map(), profileSubscriptions=new Map();
  const privateProfiles=new Map(), privateSubscriptions=new Map();
  const tr = (mn,en) => globalThis.TemuulLocale?.t(mn,en) ?? mn;
  const feedback = (mn,en) => { find('connectionStatus').textContent = tr(mn,en); };
  const validHandle = value => /^[a-z0-9_]{3,20}$/.test(value);
  const handleValue = input => input.value.trim().toLowerCase().replace(/^@/,'');
  const payloadLimit=220000;
  const audioTypes=['audio/webm','audio/mp4','audio/ogg'];
  const safeAvatar=value=>typeof value==='string'&&value.length<=160000&&
    (/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value)||/^https:\/\/lh3\.googleusercontent\.com\/[^\s]+$/.test(value))?value:'';
  const label=(value,fallback)=>typeof value==='string'&&value.trim()?value.trim().slice(0,48):fallback;
  const peerUid=record=>record.members.find(uid=>uid!==user?.uid);

  function account(api,identity,read){
    if(publisher?.uid===identity?.uid&&publisher&&(publisher.ready||publisher.loading))return;
    if(publisher){clearTimeout(publisher.timer);publisher.stopFriends?.();}
    publisher=null;
    if(!api||!identity)return;
    const current={api,uid:identity.uid,read,changes:new Set(),handle:'',busy:false,exists:false,loading:true,threads:new Set(),missing:new Set()};
    publisher=current;
    const handleRef=api.doc(api.db,'chatHandles',current.uid);
    const profileRef=api.doc(api.db,'chatProfiles',current.uid);
    Promise.all([api.getDoc(handleRef),api.getDoc(profileRef)]).then(([registered,profile])=>{
      if(publisher!==current)return;
      current.handle=registered.data()?.handle||'';
      current.exists=profile.exists();
      current.ready=true;
      if(!current.handle)watchPrivateFriends(current);
      if(current.handle&&!current.exists)current.changes.add('initial');
      schedulePublish(current);
    }).catch(()=>{}).finally(()=>{current.loading=false;});
  }

  function watchPrivateFriends(current){
    const {api,uid}=current;
    const query=api.query(api.collection(api.db,'connections'),api.where('members','array-contains',uid));
    current.stopFriends=api.onSnapshot(query,{includeMetadataChanges:true},snapshot=>{
      if(publisher!==current||current.handle||snapshot.metadata.fromCache)return;
      const threads=new Set(snapshot.docs.filter(doc=>doc.data().status==='active').map(doc=>doc.id));
      for(const id of threads){
        if(current.threads.has(id))continue;
        const ref=api.doc(api.db,'connections',id,'friendCards',uid);
        api.getDoc(ref).then(card=>{
          if(publisher!==current||current.handle||!current.threads.has(id)||card.exists())return;
          current.missing.add(id);
          schedulePublish(current);
        }).catch(()=>{});
      }
      current.threads=threads;
      for(const id of current.missing)if(!threads.has(id))current.missing.delete(id);
      schedulePublish(current);
    },()=>{});
  }

  function schedulePublish(current){
    if(publisher!==current||!current.ready||!navigator.onLine)return;
    if(current.handle?!current.changes.size:!current.missing.size&&!(current.threads.size&&current.changes.size))return;
    clearTimeout(current.timer);
    current.timer=setTimeout(()=>flushProfile(current),300);
  }

  function publish(part){
    if(!publisher)return;
    publisher.changes.add(part);
    schedulePublish(publisher);
  }

  async function flushProfile(current){
    if(publisher!==current||current.busy||!navigator.onLine||(!current.changes.size&&!current.missing.size))return;
    const {api,uid}=current;
    const changes=[...current.changes];
    current.changes.clear();
    current.busy=true;
    try{
      const data=current.read();
      const bounded=(value,min,max)=>Math.max(min,Math.min(max,Math.floor(Number(value)||0)));
      const pet={...data.pet,name:label(data.pet.name,'Nomi'),xp:bounded(data.pet.xp,0,100000000),
        level:bounded(data.pet.level,1,200000),needed:bounded(data.pet.needed,1,10000)};
      pet.current=bounded(data.pet.current,0,pet.needed);
      if(!current.handle){
        const ids=[...(changes.length?current.threads:current.missing)];
        const card={handle:'',name:label(data.name,'Тэмүүлийн гишүүн'),avatar:safeAvatar(data.avatar),pet};
        await Promise.all(ids.map(async id=>{
          if(publisher!==current||!current.threads.has(id))return;
          await api.setDoc(api.doc(api.db,'connections',id,'friendCards',uid),card);
          current.missing.delete(id);
        }));
        schedulePublish(current);
        return;
      }
      const patch={handle:current.handle};
      if(!current.exists||changes.includes('initial')||changes.includes('profile')){
        patch.name=label(data.name,'@'+current.handle);
        patch.avatar=safeAvatar(data.avatar);
      }
      if(!current.exists||changes.includes('initial')||changes.includes('pet'))patch.pet=pet;
      await api.setDoc(api.doc(api.db,'chatProfiles',uid),patch,{merge:true});
      current.exists=true;
      schedulePublish(current);
    }catch{
      for(const change of changes)current.changes.add(change);
    }finally{current.busy=false;}
  }
  const sharedFor=record=>friendProfiles.get(peerUid(record))||privateProfiles.get(record.id);
  const connection = id => sdk.doc(sdk.db,'connections',id);
  const name = () => (user.displayName || 'Тэмүүлийн гишүүн').trim().slice(0,48) || 'Тэмүүлийн гишүүн';
  const labels = {waiting:'Урилга бэлэн',pending:'Зөвшөөрөл хүлээж байна',active:'Чат нээлттэй',closed:'Хаасан'};
  const peerName = record => (record.members[0] === user.uid ? record.guestName || record.names[1] : record.names[0]) || 'Шинэ урилга';

  function element(tag,text,className){
    const node = document.createElement(tag);
    node.textContent = text;
    if(className) node.className = className;
    return node;
  }

  function avatarCard(data,fallback){
    const src=safeAvatar(data?.avatar);
    if(!src)return element('span',fallback.slice(0,1).toUpperCase(),'friend-avatar');
    const image=element('img','','friend-avatar friend-photo');
    image.src=src;image.alt='';image.referrerPolicy='no-referrer';
    image.onerror=()=>image.replaceWith(element('span',fallback.slice(0,1).toUpperCase(),'friend-avatar'));
    return image;
  }

  function renderFriendCard(card,data,fallback,bio=''){
    const name=label(data?.name,fallback);
    const header=element('div','','friend-card-header');
    const identity=element('div','','friend-card-identity');
    identity.append(element('strong',name));
    if(data?.handle)identity.append(element('small','@'+data.handle));
    header.append(avatarCard(data,name),identity);
    card.replaceChildren(header);
    if(bio)card.append(element('p',bio));
    const pet=data?.pet;
    if(!pet||!globalThis.TemuulPixelPet)return;
    const panel=element('div','','friend-pet-card');
    const art=element('div','','friend-pet-art');
    art.setAttribute('aria-hidden','true');
    const accessory=['none','sprout','star','flower','crown','bow','headphones','wizard','halo','diamond'].includes(pet.accessory)?pet.accessory:'none';
    art.innerHTML='<svg viewBox="0 0 200 205">'+TemuulPixelPet.artwork({shape:pet.shape,color:pet.color,accessory,xp:pet.xp})+'</svg>';
    const copy=element('div','','friend-pet-info');
    const level=Number(pet.level)||1,current=Number(pet.current)||0,needed=Math.max(1,Number(pet.needed)||1);
    const progress=element('progress');
    progress.max=needed;progress.value=current;
    progress.setAttribute('aria-label','Pet XP');
    copy.append(element('strong',label(pet.name,'Pet')),element('small',`Level ${level} · ${current} / ${needed} XP`),progress);
    panel.append(art,copy);card.append(panel);
  }

  function observeFriendProfiles(){
    const wanted=new Set(records.filter(record=>record.status==='active').map(peerUid).filter(Boolean));
    for(const [uid,stop] of profileSubscriptions){
      if(wanted.has(uid))continue;
      stop();profileSubscriptions.delete(uid);friendProfiles.delete(uid);
    }
    const currentScope=scope;
    for(const uid of wanted){
      if(profileSubscriptions.has(uid))continue;
      const stop=sdk.onSnapshot(sdk.doc(sdk.db,'chatProfiles',uid),snapshot=>{
        if(scope!==currentScope||!profileSubscriptions.has(uid))return;
        friendProfiles.set(uid,snapshot.data());
        renderList();
        const record=records.find(item=>item.id===selected);
        if(record&&peerUid(record)===uid){
          const data=sharedFor(record);
          find('connectionPeer').textContent=label(data?.name,peerName(record));
          if(find('friendProfile').open){
            const card=find('friendProfileCard');
            renderFriendCard(card,data,peerName(record),card.dataset.bio||'');
          }
        }
      },()=>{});
      profileSubscriptions.set(uid,stop);
    }
    const threads=records.filter(record=>record.status==='active');
    const ids=new Set(threads.map(record=>record.id));
    for(const [id,stop] of privateSubscriptions){
      if(ids.has(id))continue;
      stop();privateSubscriptions.delete(id);privateProfiles.delete(id);
    }
    for(const record of threads){
      const id=record.id,peer=peerUid(record);
      if(!peer||privateSubscriptions.has(id))continue;
      const stop=sdk.onSnapshot(sdk.doc(connection(id),'friendCards',peer),snapshot=>{
        if(scope!==currentScope||!privateSubscriptions.has(id))return;
        privateProfiles.set(id,snapshot.data());
        renderList();
        if(selected===id){
          const data=sharedFor(record);
          find('connectionPeer').textContent=label(data?.name,peerName(record));
          const card=find('friendProfileCard');
          if(find('friendProfile').open)renderFriendCard(card,data,peerName(record),card.dataset.bio||'');
        }
      },()=>{});
      privateSubscriptions.set(id,stop);
    }
  }

  function renderList(){
    const items = [];
    for(const [title,statuses] of [['Найзууд',['active']],['Хүсэлт ба урилга',['pending','waiting']],['Хаасан чат',['closed']]]){
      const group = records.filter(record => statuses.includes(record.status));
      if(!group.length) continue;
      items.push(element('h4',tr(title),'friend-group-title'));
      for(const record of group){
        const publicProfile=sharedFor(record);
        const peer = label(publicProfile?.name,peerName(record));
        const button = element('button','','connection-item');
        button.type = 'button';
        const copy = element('span','');
        copy.append(element('strong',peer),element('small',tr(labels[record.status])));
        button.append(avatarCard(publicProfile,peer),copy);
        button.setAttribute('aria-pressed',String(record.id === selected));
        button.onclick = () => {
          selected = record.id;
          feedback('');
          renderList();
          renderThread();
          find('connectionPeer').focus();
        };
        items.push(button);
      }
    }
    find('connectionList').replaceChildren(...(items.length ? items : [element('p',tr('Холбоо хараахан алга.'))]));
  }

  function renderThread(){
    const record = records.find(item => item.id === selected);
    const profile = find('friendProfile');
    const activeId = record?.status === 'active' ? record.id : '';
    if(activeId !== profileThread){
      clearAttachment();
      profileThread = activeId;
      profile.open = !!activeId;
      find('friendProfileCard').replaceChildren();
      delete find('friendProfileCard').dataset.bio;
      find('friendProfileName').value = '';
      find('friendProfileBio').value = '';
    }
    profile.hidden = !activeId;
    globalThis.TemuulVoice?.update(sdk,user,record?.status === 'active' ? record.id : '');
    find('connectionThread').hidden = !record;
    if(!record){
      stopMessages?.();
      stopMessages = null;
      listeningId = '';
      find('connectionMessages').replaceChildren();
      return;
    }
    const owner = record.members[0] === user.uid;
    find('connectionPeer').textContent = label(sharedFor(record)?.name,peerName(record));
    find('connectionThreadStatus').textContent = tr(labels[record.status]);
    find('connectionAccept').hidden = !owner || record.status !== 'pending';
    find('connectionClose').hidden = record.status === 'closed';
    find('connectionClose').textContent = record.status === 'waiting' ? 'Урилга цуцлах' : record.status === 'pending' ? 'Хүсэлт цуцлах' : 'Чат хаах';
    find('connectionCompose').hidden = record.status !== 'active';
    const showMessages = record.status === 'active' || record.status === 'closed';
    const messages = find('connectionMessages');
    messages.hidden = !showMessages;
    const nextId = showMessages ? record.id : '';
    if(listeningId === nextId) return;
    stopMessages?.();
    stopMessages = null;
    listeningId = nextId;
    messages.replaceChildren();
    find('connectionText').value = '';
    if(!showMessages) return;
    messages.append(element('p','Зурвасуудыг ачаалж байна…'));
    const currentScope = scope;
    const query = sdk.query(sdk.collection(connection(record.id),'messages'),sdk.orderBy('createdAt','desc'),sdk.limit(50));
    stopMessages = sdk.onSnapshot(query,snapshot => {
      if(scope !== currentScope || listeningId !== record.id) return;
      const rows = [...snapshot.docs].reverse().map(doc => {
        const data = doc.data();
        const own = data.sender === user.uid;
        const bubble = element('div','','connection-message'+(own?' mine':''));
        bubble.append(element('small',own?tr('Та','You'):find('connectionPeer').textContent));
        bubble.append(mediaElement(data,true) || element('p',data.text || ''));
        return bubble;
      });
      messages.replaceChildren(...(rows.length ? rows : [element('p',tr('Одоогоор зурвас алга.'))]));
      messages.scrollTop = messages.scrollHeight;
    },() => {
      if(scope === currentScope && listeningId === record.id) messages.replaceChildren(element('p','Зурвас ачаалж чадсангүй. Хэсгийг дахин нээгээрэй.'));
    });
  }

  function update(nextSdk,nextUser,active){
    const nextUid = active ? nextUser?.uid : null;
    if(nextUid && nextUid === user?.uid && stopList) return;
    scope++;
    if(find('chatImageViewer').open)find('chatImageViewer').close();
    for(const stop of profileSubscriptions.values())stop();
    profileSubscriptions.clear();friendProfiles.clear();
    for(const stop of privateSubscriptions.values())stop();
    privateSubscriptions.clear();privateProfiles.clear();
    clearAttachment();
    stopList?.();
    stopMessages?.();
    stopList = stopMessages = null;
    listeningId = '';
    selected = '';
    records = [];
    busy = false;
    sdk = nextSdk;
    user = nextUid ? nextUser : null;
    handle='';
    find('connectionHandle').value='';
    find('connectionHandle').readOnly=false;
    find('connectionHandleSave').hidden=false;
    find('connectionSearchResult').replaceChildren();
    find('connectionPanel').hidden = !user;
    find('connectionLogin').hidden = !!user;
    find('connectionList').replaceChildren();
    find('connectionJoinCode').value = '';
    find('connectionText').value = '';
    feedback('');
    renderThread();
    if(!user || !sdk) return;
    const currentScope = scope;
    sdk.getDoc(sdk.doc(sdk.db,'chatHandles',user.uid)).then(snapshot=>{
      if(scope===currentScope&&snapshot.exists())setHandle(snapshot.data().handle);
    }).catch(()=>{});
    feedback('Холбоог ачаалж байна…');
    const query = sdk.query(sdk.collection(sdk.db,'connections'),sdk.where('members','array-contains',user.uid));
    stopList = sdk.onSnapshot(query,snapshot => {
      if(scope !== currentScope) return;
      records = snapshot.docs.map(doc => ({...doc.data(),id:doc.id}))
        .sort((a,b) => (b.createdAt?.seconds || 0)-(a.createdAt?.seconds || 0));
      if(requestedThread){
        if(records.some(record => record.id === requestedThread)) selected = requestedThread;
        requestedThread = '';
      }
      if(find('connectionStatus').textContent === 'Холбоог ачаалж байна…') feedback('');
      renderList();
      renderThread();
      observeFriendProfiles();
    },() => { if(scope === currentScope) feedback('Холбоог ачаалж чадсангүй. Интернэтээ шалгаад хэсгийг дахин нээгээрэй.'); });
  }

  function setHandle(value){
    handle=value;
    find('connectionHandle').value='@'+value;
    find('connectionHandle').readOnly=true;
    find('connectionHandleSave').hidden=true;
    if(publisher?.uid===user.uid){
      publisher.handle=value;
      publisher.stopFriends?.();
      if(!publisher.exists)publish('initial');
    }
  }

  function openImage(src){
    const viewer=find('chatImageViewer');
    find('chatImageFull').src=src;
    find('chatImageDownload').href=src;
    find('chatImageDownload').download='temuul-chat.jpg';
    if(!viewer.open)viewer.showModal();
  }

  function mediaElement(data,viewable=false){
    if(typeof data.payload!=='string'||data.payload.length>payloadLimit||!/^[A-Za-z0-9+/]+={0,2}$/.test(data.payload))return null;
    if(data.kind==='image'&&data.mime==='image/jpeg'){
      const image=document.createElement('img');
      image.alt=tr('Илгээсэн зураг','Shared image');image.loading='lazy';
      image.src='data:image/jpeg;base64,'+data.payload;
      if(viewable){
        const trigger=element('button','','chat-image-trigger');
        trigger.type='button';
        trigger.setAttribute('aria-label',tr('Зураг томоор нээх','Open full image'));
        trigger.append(image);
        trigger.onclick=()=>openImage(image.src);
        return trigger;
      }
      return image;
    }
    if(data.kind==='audio'&&audioTypes.includes(data.mime)){
      const audio=document.createElement('audio');
      audio.controls=true;audio.preload='none';
      audio.src='data:'+data.mime+';base64,'+data.payload;
      return audio;
    }
    return null;
  }

  function clearAttachment(){
    clearTimeout(recordingTimer);
    if(recording){
      recording.onstop=null;
      if(recording.state!=='inactive')recording.stop();
      recording.stream.getTracks().forEach(track=>track.stop());
      recording=null;
    }
    attachment=null;
    find('connectionAttachment').replaceChildren();
    find('connectionAttachment').hidden=true;
    find('connectionAttachmentClear').hidden=true;
    find('connectionText').required=true;
    find('connectionRecord').textContent=tr('🎙 Бичих','🎙 Record');
  }

  function attach(data){
    if(data.payload.length>payloadLimit)throw new Error('Attachment too large');
    const preview=mediaElement(data);
    if(!preview)throw new Error('Invalid attachment');
    attachment=data;
    find('connectionAttachment').replaceChildren(preview);
    find('connectionAttachment').hidden=false;
    find('connectionAttachmentClear').hidden=false;
    find('connectionText').required=false;
  }

  async function imagePayload(file){
    if(!file?.type.startsWith('image/')||file.size>12000000)throw new Error('Invalid image');
    const url=URL.createObjectURL(file);
    try{
      const image=new Image();
      image.src=url;
      await image.decode();
      const canvas=document.createElement('canvas');
      const context=canvas.getContext('2d');
      for(const size of [960,720,480,320]){
        const scale=Math.min(1,size/Math.max(image.width,image.height));
        canvas.width=Math.max(1,Math.round(image.width*scale));
        canvas.height=Math.max(1,Math.round(image.height*scale));
        context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);
        context.drawImage(image,0,0,canvas.width,canvas.height);
        const payload=canvas.toDataURL('image/jpeg',.72).split(',')[1];
        if(payload&&payload.length<=payloadLimit)return {kind:'image',mime:'image/jpeg',payload};
      }
      throw new Error('Attachment too large');
    }finally{URL.revokeObjectURL(url);}
  }

  function blobPayload(blob){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');
      reader.onerror=reject;
      reader.readAsDataURL(blob);
    });
  }

  async function run(button,action){
    if(!user || !sdk || busy) return;
    if(!navigator.onLine){ feedback('Интернэтэд холбогдоод дахин оролдоорой.'); return; }
    const currentScope = scope;
    const isCurrent = () => scope === currentScope;
    busy = true;
    button.disabled = true;
    feedback('');
    try{ await action(isCurrent); }
    catch(error){
      if(isCurrent()) feedback(error.code === 'permission-denied'
        ? 'Код буруу, ашиглагдсан, эсвэл энэ үйлдэлд хандах эрхгүй байна.'
        : 'Үйлдэл амжилтгүй боллоо. Дахин оролдоорой.');
    }finally{
      button.disabled = false;
      if(isCurrent()) busy = false;
    }
  }

  function init(openProfile){
    find('connectionSignIn').onclick = openProfile;
    find('chatImageViewer').addEventListener('close',()=>{
      find('chatImageFull').removeAttribute('src');
      find('chatImageDownload').removeAttribute('href');
    });
    find('friendProfile').ontoggle = async event => {
      if(!event.currentTarget.open || !profileThread) return;
      const record = records.find(item => item.id === profileThread);
      if(!record) return;
      const activeScope = scope;
      const peer = record.members.find(uid => uid !== user.uid);
      const fallback = peerName(record);
      const card = find('friendProfileCard');
      card.replaceChildren(element('p','Профайл ачаалж байна…'));
      find('friendProfileSave').disabled = true;
      try{
        const ref = connection(record.id);
        const [other,own] = await Promise.all([sdk.getDoc(sdk.doc(ref,'profiles',peer)),sdk.getDoc(sdk.doc(ref,'profiles',user.uid))]);
        if(scope !== activeScope || profileThread !== record.id) return;
        const shown = other.data();
        card.dataset.bio=shown?.bio||'';
        renderFriendCard(card,sharedFor(record),shown?.name||fallback,card.dataset.bio);
        find('friendProfileName').value = own.data()?.name || name();
        find('friendProfileBio').value = own.data()?.bio || '';
      }catch{
        if(scope === activeScope && profileThread === record.id) card.replaceChildren(element('p','Профайл ачаалж чадсангүй.'));
      }finally{
        if(scope === activeScope && profileThread === record.id) find('friendProfileSave').disabled = false;
      }
    };
    find('friendProfileForm').onsubmit = event => {
      event.preventDefault();
      run(find('friendProfileSave'),async current => {
        if(!profileThread) return;
        const display = find('friendProfileName').value.trim();
        const bio = find('friendProfileBio').value.trim();
        if(!display){ feedback('Харагдах нэрээ оруулаарай.'); return; }
        await sdk.setDoc(sdk.doc(connection(profileThread),'profiles',user.uid),{name:display,bio});
        if(current()) feedback('Найзад харагдах профайл хадгалагдлаа.');
      });
    };

    find('connectionHandleForm').onsubmit = event => {
      event.preventDefault();
      run(find('connectionHandleSave'),async current=>{
        const value=handleValue(find('connectionHandle'));
        if(!validHandle(value)){feedback('Username 3–20 тэмдэгттэй байна.','Use 3–20 letters, numbers, or underscores.');return;}
        const uid=user.uid, batch=sdk.writeBatch(sdk.db);
        batch.set(sdk.doc(sdk.db,'chatHandles',uid),{handle:value});
        batch.set(sdk.doc(sdk.db,'chatUsernames',value),{uid});
        try{await batch.commit();}
        catch(error){
          if(error.code!=='permission-denied')throw error;
          if(current())feedback('Энэ username ашиглагдсан эсвэл та аль хэдийн нэртэй.','This username is taken, or you already have one.');
          return;
        }
        if(current()){setHandle(value);feedback('Username хадгалагдлаа.','Username saved.');}
      });
    };
    find('connectionJoin').onsubmit = event => {
      event.preventDefault();
      const results=find('connectionSearchResult');
      results.replaceChildren();
      run(find('connectionJoinButton'),async current=>{
        const value=handleValue(find('connectionJoinCode'));
        if(!validHandle(value)){feedback('Зөв username оруулаарай.','Enter a valid username.');return;}
        const snapshot=await sdk.getDoc(sdk.doc(sdk.db,'chatUsernames',value));
        if(!current())return;
        const target=snapshot.data()?.uid;
        if(!target){feedback('Хэрэглэгч олдсонгүй.','User not found.');return;}
        if(target===user.uid){feedback('Энэ таны username.','This is your username.');return;}
        const existing=records.find(item=>item.members.includes(target)&&item.status!=='closed');
        const shared=await sdk.getDoc(sdk.doc(sdk.db,'chatProfiles',target)).catch(()=>null);
        if(!current())return;
        const button=element('button',existing?tr('Нээх','Open'):tr('Найзын хүсэлт илгээх','Send friend request'),'btn secondary small');
        button.type='button';
        const preview=element('div','','friend-search-profile');
        renderFriendCard(preview,shared?.data(), '@'+value);
        results.append(preview,button);
        button.onclick=()=>{
          if(existing){select(existing.id);return;}
          run(button,async stillCurrent=>{
            if(!handle){feedback('Эхлээд өөрийн username-аа хадгалаарай.','Save your own username first.');return;}
            if(records.some(item=>item.members.includes(target)&&item.status!=='closed')){
              if(stillCurrent())feedback('Холбоо аль хэдийн байна.','You already have a connection.');
              return;
            }
            const previous=records.filter(item=>item.members.includes(target)&&item.status==='closed').map(item=>item.id).sort();
            const bytes=new TextEncoder().encode(JSON.stringify([[target,user.uid].sort(),previous]));
            const hash=await crypto.subtle.digest('SHA-256',bytes);
            if(!stillCurrent())return;
            const id=Array.from(new Uint8Array(hash).slice(0,16),byte=>byte.toString(16).padStart(2,'0')).join('');
            await sdk.setDoc(connection(id),{members:[target,user.uid],names:['@'+value,'@'+handle],targetHandle:value,status:'pending',createdAt:sdk.serverTimestamp()});
            if(stillCurrent()){results.replaceChildren();select(id);feedback('Найзын хүсэлт илгээлээ.','Friend request sent.');}
          });
        };
      });
    };
    for(const [id,status] of [['connectionAccept','active'],['connectionClose','closed']]){
      find(id).onclick = event => run(event.currentTarget,async () => {
        await sdk.updateDoc(connection(selected),{status});
      });
    }
    const connectivity=()=>{find('connectionOffline').hidden=navigator.onLine;};
    window.addEventListener('online',()=>{connectivity();if(publisher)schedulePublish(publisher);});
    window.addEventListener('offline',connectivity);
    document.addEventListener('temuul:language',()=>{if(user){renderList();renderThread();}});
    connectivity();
    find('connectionAttachmentClear').onclick=clearAttachment;
    find('connectionImage').onclick=()=>find('connectionImageFile').click();
    find('connectionImageFile').onchange=async event=>{
      const input=event.currentTarget;
      const file=input.files[0];input.value='';
      if(!file)return;
      const id=selected, currentScope=scope;
      try{
        const data=await imagePayload(file);
        if(scope===currentScope&&selected===id){clearAttachment();attach(data);}
      }catch{if(scope===currentScope&&selected===id)feedback('Энэ зургийг бэлдэж чадсангүй.','This image could not be prepared.');}
    };
    find('connectionRecord').onclick=async event=>{
      if(recording){
        if(recording.state==='recording')recording.stop();
        return;
      }
      const button=event.currentTarget, id=selected, currentScope=scope;
      if(!globalThis.MediaRecorder||!navigator.mediaDevices?.getUserMedia){
        feedback('Энэ хөтөч дуу бичих боломжгүй.','Voice recording is unavailable in this browser.');return;
      }
      button.disabled=true;
      let stream;
      try{
        stream=await navigator.mediaDevices.getUserMedia({audio:true});
        if(scope!==currentScope||selected!==id){stream.getTracks().forEach(track=>track.stop());return;}
        const supported=audioTypes.find(type=>MediaRecorder.isTypeSupported(type));
        const recorder=new MediaRecorder(stream,supported?{mimeType:supported,audioBitsPerSecond:32000}:undefined);
        const chunks=[];
        recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
        recorder.onstop=async ()=>{
          stream.getTracks().forEach(track=>track.stop());
          clearTimeout(recordingTimer);
          if(recording!==recorder)return;
          recording=null;
          button.textContent=tr('🎙 Бичих','🎙 Record');
          try{
            const mime=(recorder.mimeType||chunks[0]?.type||'').split(';')[0];
            const payload=await blobPayload(new Blob(chunks,{type:mime}));
            if(scope===currentScope&&selected===id&&!recording)attach({kind:'audio',mime,payload});
          }catch{if(scope===currentScope&&selected===id)feedback('Дуут зурвас хэт том эсвэл бичлэг уншигдсангүй.','Voice message is too large or could not be read.');}
        };
        recorder.onerror=()=>{
          if(recording!==recorder)return;
          clearAttachment();
          feedback('Дуу бичихэд алдаа гарлаа.','Voice recording failed.');
        };
        recorder.start();
        recording=recorder;
        button.textContent=tr('■ Зогсоох','■ Stop');
        const maxMs=Math.min(15000,Math.floor(1200000000/(recorder.audioBitsPerSecond||32000)));
        recordingTimer=setTimeout(()=>{if(recorder.state==='recording')recorder.stop();},maxMs);
      }catch{
        stream?.getTracks().forEach(track=>track.stop());
        if(scope===currentScope&&selected===id)feedback('Микрофоны зөвшөөрлөө шалгаарай.','Check your microphone permission.');
      }finally{button.disabled=false;}
    };
    const emojiList=find('connectionEmojiList');
    find('connectionEmoji').onclick=()=>{
      emojiList.hidden=!emojiList.hidden;
      find('connectionEmoji').setAttribute('aria-expanded',String(!emojiList.hidden));
    };
    for(const emoji of ['😊','😂','❤️','👍','🎉','🔥','😢','👋','✨','🐾']){
      const button=element('button',emoji,'btn secondary small');
      button.type='button';
      button.onclick=()=>{
        const input=find('connectionText');
        const start=input.selectionStart,end=input.selectionEnd;
        if(input.value.length-(end-start)+emoji.length>1000)return;
        input.setRangeText(emoji,start,end,'end');input.focus();
      };
      emojiList.append(button);
    }
    find('connectionCompose').onsubmit = event => {
      event.preventDefault();
      run(find('connectionSend'),async current => {
        const input = find('connectionText');
        const draft = input.value;
        const id = selected;
        const text = draft.trim();
        const media=attachment;
        if(recording||(!text&&!media)||text.length>1000)return;
        const messages=sdk.collection(connection(id),'messages');
        const batch=sdk.writeBatch(sdk.db);
        const envelope={sender:user.uid,createdAt:sdk.serverTimestamp()};
        if(media)batch.set(sdk.doc(messages),{...envelope,...media});
        if(text)batch.set(sdk.doc(messages),{...envelope,text});
        await batch.commit();
        if(current()&&selected===id){
          if(attachment===media)clearAttachment();
          if(input.value===draft)input.value='';
        }
      });
    };
  }
  function select(id){
    if(!records.some(record => record.id === id)){ requestedThread = id; return; }
    selected = id;
    renderList();
    renderThread();
    find('connectionPeer').focus();
  }
  return {init,update,select,account,publish};
})();
