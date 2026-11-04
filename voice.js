globalThis.TemuulVoice = (() => {
  const byId = id => document.getElementById(id);
  let room = null;
  let inbox = null;
  const supported = () => !!(globalThis.RTCPeerConnection && navigator.mediaDevices?.getUserMedia);
  const status = text => { byId('voiceStatus').textContent = text; };

  function release(session){
    session.peer?.close();
    session.stream?.getTracks().forEach(track => track.stop());
    session.camera?.getTracks().forEach(track => track.stop());
    session.camera = null;
    session.remoteVideo = null;
    session.remoteCamera = false;
    session.mediaChannel = null;
    session.peer = session.stream = null;
    session.nonce = '';
    if(room === session){
      byId('voiceAudio').srcObject = null;
      byId('voiceListen').hidden = true;
      byId('voiceLocalVideo').srcObject = null;
      byId('voiceRemoteVideo').srcObject = null;
      byId('voiceMediaControls').hidden = true;
      byId('voiceVideos').hidden = true;
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
    const connected = session.peer?.connectionState === 'connected';
    const mic = session.stream?.getAudioTracks()[0];
    const direction = videoChannel(session)?.currentDirection;
    byId('voiceMediaControls').hidden = !connected;
    byId('voiceMic').setAttribute('aria-pressed',String(!!mic?.enabled));
    byId('voiceMic').textContent = mic?.enabled ? '🎙 Микрофон унтраах' : '🎙 Микрофон асаах';
    byId('voiceCamera').disabled = session.cameraBusy || session.mediaChannel?.readyState !== 'open'
      || !['sendrecv','sendonly'].includes(direction);
    byId('voiceCamera').setAttribute('aria-pressed',String(!!session.camera));
    byId('voiceCamera').textContent = session.camera ? '📷 Камер унтраах' : '📷 Камер асаах';
    byId('voiceFlip').hidden = !session.camera;
    byId('voiceFlip').disabled = !!session.cameraBusy;
    byId('voiceLocalVideo').hidden = !session.camera;
    byId('voiceRemoteVideo').hidden = !session.remoteCamera || !session.remoteVideo || session.remoteVideo.muted;
    byId('voiceVideos').hidden = byId('voiceLocalVideo').hidden && byId('voiceRemoteVideo').hidden;
    if(session.note) status(session.note);
    else if(!supported()) status('Энэ хөтөч дуут дуудлага дэмжихгүй байна.');
    else if(active && call.state === 'ringing') status(call.caller === session.uid ? 'Хариу хүлээж байна…' : 'Дуут дуудлага ирлээ');
    else if(active) status(session.peer?.connectionState === 'connected' ? 'Дуудлага холбогдлоо' : session.peer ? 'Холбогдож байна…' : 'Өмнөх дуудлага нээлттэй байна. Шинээр дуудахын өмнө таслаарай.');
    else status('');
  }

  function videoChannel(session){
    return session.peer?.getTransceivers().find(channel => channel.receiver.track.kind === 'video');
  }

  function shareCameraState(session){
    try{
      if(session.mediaChannel?.readyState === 'open') session.mediaChannel.send(session.camera ? 'on' : 'off');
    }catch{ /* The connection may close as the state is sent. */ }
  }

  function attachMediaChannel(session,channel){
    session.mediaChannel = channel;
    channel.onopen = () => { shareCameraState(session); render(session); };
    channel.onclose = () => { session.remoteCamera = false; render(session); };
    channel.onmessage = event => {
      if(session.mediaChannel !== channel || !['on','off'].includes(event.data)) return;
      session.remoteCamera = event.data === 'on';
      render(session);
    };
  }

  async function end(session,nonce){
    if(!nonce) return;
    const {sdk,ref} = session;
    await sdk.runTransaction(sdk.db,async transaction => {
      const call = (await transaction.get(ref)).data();
      if(call?.nonce === nonce && call.state !== 'ended') transaction.update(ref,{state:'ended'});
    });
  }

  async function createPeer(session,nonce,caller=false){
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
    if(caller){
      peer.addTransceiver('video',{direction:'sendrecv'});
      attachMediaChannel(session,peer.createDataChannel('camera-state'));
    }else{
      peer.ondatachannel = event => {
        if(room === session && session.peer === peer && event.channel.label === 'camera-state') attachMediaChannel(session,event.channel);
      };
    }
    peer.ontrack = event => {
      if(room !== session || session.peer !== peer) return;
      if(event.track.kind === 'video'){
        session.remoteVideo = event.track;
        byId('voiceRemoteVideo').srcObject = new MediaStream([event.track]);
        event.track.onmute = event.track.onunmute = () => render(session);
        render(session);
        return;
      }
      const audio = byId('voiceAudio');
      audio.srcObject = new MediaStream([event.track]);
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
    const peer = await createPeer(session,nonce,true);
    const offer = await gather(peer,await peer.createOffer());
    if(room !== session) return;
    await session.sdk.setDoc(session.ref,{caller:session.uid,offer,nonce,state:'ringing',startedAt:session.sdk.serverTimestamp()});
  });
  byId('voiceAnswer').onclick = () => act(async session => {
    const call = session.call;
    if(!live(call) || call.state !== 'ringing' || call.caller === session.uid) return;
    const peer = await createPeer(session,call.nonce);
    await peer.setRemoteDescription({type:'offer',sdp:call.offer});
    const video = videoChannel(session);
    if(video) video.direction = 'sendrecv';
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
  byId('voiceMic').onclick = () => {
    const mic = room?.stream?.getAudioTracks()[0];
    if(!mic) return;
    mic.enabled = !mic.enabled;
    render(room);
  };
  async function changeCamera(flip=false){
    const session = room;
    const peer = session?.peer;
    const channel = session && videoChannel(session);
    if(!channel || session.cameraBusy) return;
    session.cameraBusy = true;
    session.note = '';
    render(session);
    let stream;
    try{
      const enable = flip || !session.camera;
      const facing = flip && session.facing !== 'environment' ? 'environment' : 'user';
      if(session.camera){
        session.camera.getTracks().forEach(track => track.stop());
        session.camera = null;
        byId('voiceLocalVideo').srcObject = null;
        await channel.sender.replaceTrack(null);
      }
      if(enable && room === session && session.peer === peer){
        stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:flip?{exact:facing}:{ideal:facing}},audio:false});
        if(room !== session || session.peer !== peer) return;
        await channel.sender.replaceTrack(stream.getVideoTracks()[0]);
        if(room !== session || session.peer !== peer) return;
        session.camera = stream;
        session.facing = stream.getVideoTracks()[0].getSettings?.().facingMode || facing;
        byId('voiceLocalVideo').srcObject = stream;
        byId('voiceLocalVideo').dataset.facing = session.facing;
      }
    }catch(error){
      if(room === session) session.note = error.name === 'NotAllowedError' ? 'Камерын зөвшөөрлөө шалгана уу.' : flip ? 'Нөгөө камерыг нээж чадсангүй.' : 'Камер асааж чадсангүй.';
    }finally{
      if(stream && session.camera !== stream) stream.getTracks().forEach(track => track.stop());
      session.cameraBusy = false;
      shareCameraState(session);
      render(session);
    }
  }
  byId('voiceCamera').onclick = () => changeCamera();
  byId('voiceFlip').onclick = () => changeCamera(true);

  function showIncoming(session){
    if(inbox !== session) return;
    clearTimeout(session.expiry);
    const incoming = [...session.calls].find(([,call]) =>
      call?.state === 'ringing' && call.caller !== session.uid && call.startedAt && live(call));
    byId('incomingCall').hidden = !incoming;
    if(!incoming) return;
    const [id,call] = incoming;
    byId('incomingOpen').onclick = () => session.open(id);
    session.expiry = setTimeout(() => showIncoming(session),Math.max(0,call.startedAt.toMillis()+120000-Date.now())+50);
    if(document.hidden && globalThis.Notification?.permission === 'granted' && !session.notified.has(call.nonce)){
      const worker = navigator.serviceWorker?.controller;
      if(!worker) return;
      session.notified.add(call.nonce);
      worker.postMessage({type:'SHOW_NOTIFICATION',title:'Тэмүүл · Дуудлага ирлээ',options:{
        body:'Тэмүүлийг нээгээд дуудлагаа аваарай.',
        tag:'temuul-incoming-call',
        data:{url:`/?call=${encodeURIComponent(id)}#connections`}
      }});
    }
  }

  function watch(sdk,user,open){
    if(inbox?.uid === user?.uid && inbox) return;
    if(inbox){
      inbox.stop();
      clearTimeout(inbox.expiry);
      inbox.subscriptions.forEach(stop => stop());
      document.removeEventListener('visibilitychange',inbox.visibility);
    }
    inbox = null;
    byId('incomingCall').hidden = true;
    if(!sdk || !user) return;
    const session = {uid:user.uid,open,calls:new Map(),subscriptions:new Map(),notified:new Set()};
    inbox = session;
    session.visibility = () => showIncoming(session);
    document.addEventListener('visibilitychange',session.visibility);
    const query = sdk.query(sdk.collection(sdk.db,'connections'),sdk.where('members','array-contains',user.uid));
    session.stop = sdk.onSnapshot(query,snapshot => {
      if(inbox !== session) return;
      const ids = new Set(snapshot.docs.filter(doc => doc.data().status === 'active').map(doc => doc.id));
      session.subscriptions.forEach((stop,id) => {
        if(ids.has(id)) return;
        stop();
        session.subscriptions.delete(id);
        session.calls.delete(id);
      });
      ids.forEach(id => {
        if(session.subscriptions.has(id)) return;
        const ref = sdk.doc(sdk.db,'connections',id,'voice','current');
        const stop = sdk.onSnapshot(ref,call => {
          if(inbox !== session) return;
          session.calls.set(id,call.data());
          showIncoming(session);
        },() => {
          session.calls.delete(id);
          showIncoming(session);
        });
        session.subscriptions.set(id,stop);
      });
      showIncoming(session);
    },() => {
      session.calls.clear();
      session.subscriptions.forEach(stop => stop());
      session.subscriptions.clear();
      showIncoming(session);
    });
  }
  return {update,watch};
})();
