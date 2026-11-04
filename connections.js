globalThis.TemuulConnections = (() => {
  const find = id => document.getElementById(id);
  let sdk, user, selected, stopList, stopMessages, scope = 0;
  let records = [];
  let busy = false;
  let listeningId = '';
  const feedback = message => { find('connectionStatus').textContent = message; };
  const connection = id => sdk.doc(sdk.db,'connections',id);
  const name = () => (user.displayName || 'Тэмүүлийн гишүүн').trim().slice(0,48) || 'Тэмүүлийн гишүүн';
  const labels = {waiting:'Урилга бэлэн',pending:'Зөвшөөрөл хүлээж байна',active:'Чат нээлттэй',closed:'Хаасан'};

  function element(tag,text,className){
    const node = document.createElement(tag);
    node.textContent = text;
    if(className) node.className = className;
    return node;
  }

  function renderList(){
    const items = records.map(record => {
      const peer = record.names[record.members[0] === user.uid ? 1 : 0] || 'Шинэ урилга';
      const button = element('button','','connection-item');
      button.type = 'button';
      button.append(element('strong',peer),element('small',labels[record.status]));
      button.setAttribute('aria-pressed',String(record.id === selected));
      button.onclick = () => {
        selected = record.id;
        feedback('');
        renderList();
        renderThread();
        find('connectionPeer').focus();
      };
      return button;
    });
    find('connectionList').replaceChildren(...(items.length ? items : [element('p','Холбоо хараахан алга.')]));
  }

  function renderThread(){
    const record = records.find(item => item.id === selected);
    find('connectionThread').hidden = !record;
    if(!record){
      stopMessages?.();
      stopMessages = null;
      listeningId = '';
      find('connectionMessages').replaceChildren();
      return;
    }
    const owner = record.members[0] === user.uid;
    find('connectionPeer').textContent = record.names[owner ? 1 : 0] || 'Шинэ урилга';
    find('connectionThreadStatus').textContent = labels[record.status];
    find('connectionInvite').hidden = record.status !== 'waiting';
    find('connectionCode').value = record.status === 'waiting' ? record.id : '';
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
    find('connectionCreate').onclick = event => run(event.currentTarget,async current => {
      const id = Array.from(crypto.getRandomValues(new Uint8Array(16)),byte => byte.toString(16).padStart(2,'0')).join('');
      await sdk.setDoc(connection(id),{members:[user.uid],names:[name()],status:'waiting',createdAt:sdk.serverTimestamp()});
      if(current()){ selected = id; renderList(); renderThread(); feedback('Урилгын кодоо холбогдох хүндээ өгнө үү.'); }
    });
    find('connectionJoin').onsubmit = event => {
      event.preventDefault();
      run(find('connectionJoinButton'),async current => {
        const input = find('connectionJoinCode');
        const id = input.value.trim().toLowerCase();
        if(!/^[a-f0-9]{32}$/.test(id)){ feedback('32 тэмдэгттэй урилгын кодоо оруулаарай.'); return; }
        const uid = user.uid;
        const displayName = name();
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
  return {init,update};
})();
