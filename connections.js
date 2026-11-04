globalThis.TemuulConnections = (() => {
  const find = id => document.getElementById(id);
  let sdk, user, selected, stopList, stopMessages, scope = 0;
  let records = [];
  let busy = false;
  let listeningId = '';
  let profileThread = '';
  let requestedThread = '';
  const feedback = message => { find('connectionStatus').textContent = message; };
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

  function renderList(){
    const items = [];
    for(const [title,statuses] of [['Найзууд',['active']],['Хүсэлт ба урилга',['pending','waiting']],['Хаасан чат',['closed']]]){
      const group = records.filter(record => statuses.includes(record.status));
      if(!group.length) continue;
      items.push(element('h4',title,'friend-group-title'));
      for(const record of group){
        const peer = peerName(record);
        const button = element('button','','connection-item');
        button.type = 'button';
        const copy = element('span','');
        copy.append(element('strong',peer),element('small',labels[record.status]));
        button.append(element('span',peer.slice(0,1).toUpperCase(),'friend-avatar'),copy);
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
    find('connectionList').replaceChildren(...(items.length ? items : [element('p','Холбоо хараахан алга.')]));
  }

  function renderThread(){
    const record = records.find(item => item.id === selected);
    const profile = find('friendProfile');
    const activeId = record?.status === 'active' ? record.id : '';
    if(activeId !== profileThread){
      profileThread = activeId;
      profile.open = false;
      find('friendProfileCard').replaceChildren();
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
    find('connectionPeer').textContent = peerName(record);
    find('connectionThreadStatus').textContent = labels[record.status];
    find('connectionInvite').hidden = record.status !== 'waiting';
    find('connectionCode').value = record.status === 'waiting' ? record.shortCode || record.id : '';
    find('connectionCodeExpiry').textContent = record.shortCode ? '· үүссэнээс хойш 10 минут' : '';
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
        bubble.append(element('small',own?'Та':find('connectionPeer').textContent),element('p',data.text));
        return bubble;
      });
      messages.replaceChildren(...(rows.length ? rows : [element('p','Одоогоор зурвас алга.')]));
      messages.scrollTop = messages.scrollHeight;
    },() => {
      if(scope === currentScope && listeningId === record.id) messages.replaceChildren(element('p','Зурвас ачаалж чадсангүй. Хэсгийг дахин нээгээрэй.'));
    });
  }

  function update(nextSdk,nextUser,active){
    const nextUid = active ? nextUser?.uid : null;
    if(nextUid && nextUid === user?.uid && stopList) return;
    scope++;
    stopList?.();
    stopMessages?.();
    stopList = stopMessages = null;
    listeningId = '';
    selected = '';
    records = [];
    busy = false;
    sdk = nextSdk;
    user = nextUid ? nextUser : null;
    find('connectionPanel').hidden = !user;
    find('connectionLogin').hidden = !!user;
    find('connectionList').replaceChildren();
    find('connectionJoinCode').value = '';
    find('connectionCode').value = '';
    find('connectionText').value = '';
    feedback('');
    renderThread();
    if(!user || !sdk) return;
    const currentScope = scope;
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
    },() => { if(scope === currentScope) feedback('Холбоог ачаалж чадсангүй. Интернэтээ шалгаад хэсгийг дахин нээгээрэй.'); });
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
        const display = shown?.name || fallback;
        card.replaceChildren(element('span',display.slice(0,1).toUpperCase(),'friend-avatar'),element('strong',display),element('p',shown?.bio || 'Танилцуулга нэмээгүй байна.'));
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
    find('connectionCreate').onclick = event => run(event.currentTarget,async current => {
      const id = Array.from(crypto.getRandomValues(new Uint8Array(16)),byte => byte.toString(16).padStart(2,'0')).join('');
      const members = [user.uid];
      const names = [name()];
      for(let attempt=0;attempt<6 && current();attempt++){
        const number = crypto.getRandomValues(new Uint32Array(1))[0] % 10000;
        const pin = String(number).padStart(4,'0');
        const batch = sdk.writeBatch(sdk.db);
        batch.set(connection(id),{members,names,status:'waiting',shortCode:pin,createdAt:sdk.serverTimestamp()});
        batch.set(sdk.doc(sdk.db,'connectionCodes',pin),{thread:id,createdAt:sdk.serverTimestamp()});
        try{ await batch.commit(); }
        catch(error){ if(error.code === 'permission-denied' && attempt < 5) continue; throw error; }
        if(current()){ selected = id; renderList(); renderThread(); feedback('4 оронтой кодоо найздаа өгнө үү.'); }
        return;
      }
    });
    find('connectionJoin').onsubmit = event => {
      event.preventDefault();
      run(find('connectionJoinButton'),async current => {
        const input = find('connectionJoinCode');
        let id = input.value.trim().toLowerCase();
        if(!/^(?:[0-9]{4}|[a-f0-9]{32})$/.test(id)){ feedback('Найзынхаа 4 оронтой кодыг оруулаарай.'); return; }
        const uid = user.uid;
        const displayName = name();
        if(id.length === 4){
          const code = await sdk.getDoc(sdk.doc(sdk.db,'connectionCodes',id));
          if(!current()) return;
          id = code.data()?.thread;
          if(!id){ feedback('Код олдсонгүй. Шинэ код аваарай.'); return; }
          if(!records.some(record => record.id === id)){
            // The rules verify the invite and membership without exposing the owner's profile.
            await sdk.updateDoc(connection(id),{members:sdk.arrayUnion(uid),guestName:displayName,status:'pending'});
          }
          if(current()){ input.value = ''; selected = id; renderList(); renderThread(); feedback('Урилгын эзэн зөвшөөрөхөд чат нээгдэнэ.'); }
          return;
        }
        const ref = connection(id);
        const joined = await sdk.runTransaction(sdk.db,async transaction => {
          if(!current()) throw new Error('Session changed');
          const snapshot = await transaction.get(ref);
          if(!current()) throw new Error('Session changed');
          const data = snapshot.data();
          if(data?.members.includes(uid)) return false;
          if(data?.status !== 'waiting') throw new Error('Invite unavailable');
          transaction.update(ref,{members:[data.members[0],uid],names:[data.names[0],displayName],status:'pending'});
          return true;
        });
        if(current()){
          input.value = '';
          selected = id;
          renderList();
          renderThread();
          feedback(joined ? 'Урилгын эзэн зөвшөөрөхөд чат нээгдэнэ.' : 'Энэ код таны холбооны жагсаалтад байна.');
        }
      });
    };
    find('connectionCopy').onclick = async () => {
      const input = find('connectionCode');
      try{ await navigator.clipboard.writeText(input.value); feedback('Код хууллаа.'); }
      catch{ input.select(); feedback('Тэмдэглэсэн кодыг хуулж аваарай.'); }
    };
    for(const [id,status] of [['connectionAccept','active'],['connectionClose','closed']]){
      find(id).onclick = event => run(event.currentTarget,async () => {
        await sdk.updateDoc(connection(selected),{status});
      });
    }
    find('connectionCompose').onsubmit = event => {
      event.preventDefault();
      run(find('connectionSend'),async current => {
        const input = find('connectionText');
        const draft = input.value;
        const id = selected;
        const text = draft.trim();
        if(!text || text.length > 1000) return;
        await sdk.addDoc(sdk.collection(connection(id),'messages'),{sender:user.uid,text,createdAt:sdk.serverTimestamp()});
        if(current() && selected === id && input.value === draft) input.value = '';
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
  return {init,update,select};
})();
