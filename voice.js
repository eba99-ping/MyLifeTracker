globalThis.TemuulVoice = (() => {
  const byId = id => document.getElementById(id);
  let room = null;
  const supported = () => !!(globalThis.RTCPeerConnection && navigator.mediaDevices?.getUserMedia);
  const status = text => { byId('voiceStatus').textContent = text; };

  function release(session){
    session.peer?.close();
    session.stream?.getTracks().forEach(track => track.stop());
    session.peer = session.stream = null;
    session.nonce = '';
    if(room === session){
      byId('voiceAudio').srcObject = null;
      byId('voiceListen').hidden = true;
    }
  }

  function live(call){
    if(!call || call.state === 'ended') return false;
    const started = call.startedAt?.toMillis();
    return !started || Date.now() - started < (call.state === 'ringing' ? 120000 : 7200000);
  }

  function render(session){
    if(room !== session) return;
    const call = session.call;
    const active = live(call);
    byId('voiceDial').hidden = active;
    byId('voiceDial').disabled = session.busy || !session.ready || !supported();
    byId('voiceAnswer').hidden = !active || call.state !== 'ringing' || call.caller === session.uid;
    byId('voiceAnswer').disabled = session.busy || !supported();
    byId('voiceEnd').hidden = !active;
    byId('voiceEnd').disabled = session.busy;
    if(session.note) status(session.note);
    else if(!supported()) status('Энэ хөтөч дуут дуудлага дэмжихгүй байна.');
    else if(active && call.state === 'ringing') status(call.caller === session.uid ? 'Хариу хүлээж байна…' : 'Дуут дуудлага ирлээ');
    else if(active) status(session.peer?.connectionState === 'connected' ? 'Дуудлага холбогдлоо' : session.peer ? 'Холбогдож байна…' : 'Өмнөх дуудлага нээлттэй байна. Шинээр дуудахын өмнө таслаарай.');
    else status('');
  }

  async function end(session,nonce){
    if(!nonce) return;
    const {sdk,ref} = session;
    await sdk.runTransaction(sdk.db,async transaction => {
      const call = (await transaction.get(ref)).data();
      if(call?.nonce === nonce && call.state !== 'ended') transaction.update(ref,{state:'ended'});
    });
  }

  async function createPeer(session,nonce){
    const stream = await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    if(room !== session){
      stream.getTracks().forEach(track => track.stop());
      throw new Error('Chat changed');
    }
    session.stream = stream;
    session.nonce = nonce;
    const peer = new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});
    session.peer = peer;
    stream.getTracks().forEach(track => peer.addTrack(track,stream));
    peer.ontrack = event => {
      if(room !== session || session.peer !== peer) return;
      const audio = byId('voiceAudio');
      audio.srcObject = event.streams[0] || new MediaStream([event.track]);
      audio.play().catch(() => { if(room === session) byId('voiceListen').hidden = false; });
    };
    peer.onconnectionstatechange = () => {
      if(room !== session || session.peer !== peer) return;
      if(peer.connectionState === 'failed'){
        release(session);
        session.note = 'Шууд холболт үүссэнгүй. Өөр сүлжээгээр дахин оролдоорой.';
        end(session,nonce).catch(() => {});
      }
      render(session);
    };
    return peer;
  }

  async function gather(peer,description){
    await peer.setLocalDescription(description);
    if(peer.iceGatheringState !== 'complete'){
      await new Promise(resolve => {
        const finish = () => {
          clearTimeout(timer);
          peer.removeEventListener('icegatheringstatechange',changed);
          resolve();
        };
        const changed = () => { if(peer.iceGatheringState === 'complete') finish(); };
        const timer = setTimeout(finish,5000);
        peer.addEventListener('icegatheringstatechange',changed);
        changed();
      });
    }
    return peer.localDescription.sdp;
  }

  async function act(action){
    const session = room;
    if(!session || session.busy) return;
    session.busy = true;
    session.note = '';
    render(session);
    try{ await action(session); }
    catch(error){
      if(room === session){
        release(session);
        session.note = error.name === 'NotAllowedError' ? 'Микрофоны зөвшөөрлөө шалгана уу.' : 'Дуудлага амжилтгүй боллоо. Дахин оролдоорой.';
      }
    }finally{
      session.busy = false;
      render(session);
    }
  }

  function update(sdk,user,id){
    if(room?.id === id && room?.uid === user?.uid) return;
    if(room){
      const previous = room;
      previous.unsubscribe();
      clearInterval(previous.clock);
      const nonce = previous.nonce;
      release(previous);
      end(previous,nonce).catch(() => {});
    }
    room = null;
    byId('voiceListen').hidden = true;
    byId('connectionVoice').hidden = !id || !user || !sdk;
    if(!id || !user || !sdk) return;
    const ref = sdk.doc(sdk.db,'connections',id,'voice','current');
    const session = {sdk,id,uid:user.uid,ref};
    room = session;
    render(session);
    session.unsubscribe = sdk.onSnapshot(ref,snapshot => {
      if(room !== session) return;
      session.ready = true;
      session.call = snapshot.data();
      const call = session.call;
      if(session.nonce && call && !snapshot.metadata.hasPendingWrites){
        if(call.state === 'ended') release(session);
        else if(call.state === 'answered' && call.nonce === session.nonce
          && call.caller === session.uid && session.peer?.signalingState === 'have-local-offer'){
          session.peer.setRemoteDescription({type:'answer',sdp:call.answer}).catch(() => {
            if(room === session) status('Дуудлагын хариуг холбож чадсангүй.');
          });
        }
      }
      render(session);
    },() => {
      if(room === session) status('Дуудлагын төлөв ачаалагдсангүй.');
    });
    session.clock = setInterval(() => {
      if(session.call && !live(session.call) && session.nonce) release(session);
      render(session);
    },5000);
  }

  byId('voiceDial').onclick = () => act(async session => {
    if(!session.ready || live(session.call)) return;
    const nonce = crypto.randomUUID();
    const peer = await createPeer(session,nonce);
    const offer = await gather(peer,await peer.createOffer());
    if(room !== session) return;
    await session.sdk.setDoc(session.ref,{caller:session.uid,offer,nonce,state:'ringing',startedAt:session.sdk.serverTimestamp()});
  });
  byId('voiceAnswer').onclick = () => act(async session => {
    const call = session.call;
    if(!live(call) || call.state !== 'ringing' || call.caller === session.uid) return;
    const peer = await createPeer(session,call.nonce);
    await peer.setRemoteDescription({type:'offer',sdp:call.offer});
    const answer = await gather(peer,await peer.createAnswer());
    if(room !== session) return;
    await session.sdk.runTransaction(session.sdk.db,async transaction => {
      const latest = (await transaction.get(session.ref)).data();
      if(room !== session || latest?.nonce !== call.nonce || latest.state !== 'ringing') throw new Error('Call changed');
      transaction.update(session.ref,{state:'answered',answer});
    });
  });
  byId('voiceEnd').onclick = () => act(async session => {
    const nonce = session.call?.nonce;
    release(session);
    byId('voiceListen').hidden = true;
    await end(session,nonce);
  });
  byId('voiceListen').onclick = () => byId('voiceAudio').play().then(() => { byId('voiceListen').hidden = true; }).catch(() => {});
  return {update};
})();
