(()=>{
  const app=document.getElementById('app');
  const stage=document.querySelector('.stage');
  const video=document.getElementById('narration');
  const next=document.getElementById('nextBtn');
  const sound=document.getElementById('soundBtn');
  const nativePlay=document.getElementById('narrationBtn');
  const accessBtn=document.getElementById('accessBtn');
  const accessDialog=document.getElementById('accessDialog');
  const reduceMotion=document.getElementById('reduceMotion');
  if(!app||!stage)return;

  app.classList.add('level-up-standard');

  const rail=document.createElement('aside');
  rail.className='level-up-scene-rail';
  rail.setAttribute('aria-label','Scene controls');
  rail.innerHTML=`
    <small>SCENE CONTROLS</small>
    <button data-action="audio"><span class="control-icon">🔊</span><span class="control-label">Audio on</span></button>
    <button data-action="access"><span class="control-icon">◉</span><span class="control-label">Accessibility</span></button>
    <button data-action="replay"><span class="control-icon">↻</span><span class="control-label">Replay narration</span></button>
    <button data-action="skip"><span class="control-icon">↠</span><span class="control-label">Skip narration</span></button>
    <button data-action="play"><span class="control-icon">▶</span><span class="control-label">Play narration</span></button>
    <button class="rail-continue" data-action="continue">Continue <span>→</span></button>`;
  stage.insertAdjacentElement('afterend',rail);

  // Keep the original module controls as the functional source of truth, but
  // remove duplicate learner-facing controls from the stage/bottom navigation.
  if(nativePlay){nativePlay.setAttribute('aria-hidden','true');nativePlay.tabIndex=-1;}
  if(accessBtn){accessBtn.setAttribute('aria-hidden','true');accessBtn.tabIndex=-1;}
  if(reduceMotion)document.body.classList.toggle('reduce-motion',reduceMotion.checked);

  const q=(action)=>rail.querySelector(`[data-action="${action}"]`);
  const refresh=()=>{
    const playing=video&&!video.paused&&!video.ended;
    stage.classList.toggle('is-narrating',!!playing);
    q('audio').querySelector('.control-icon').textContent=video?.muted?'🔇':'🔊';
    q('audio').querySelector('.control-label').textContent=video?.muted?'Audio off':'Audio on';
    q('play').querySelector('.control-icon').textContent=playing?'Ⅱ':'▶';
    q('play').querySelector('.control-label').textContent=playing?'Pause narration':'Play narration';
    q('continue').disabled=!!next?.disabled;
  };

  q('audio').onclick=()=>{sound?.click();setTimeout(refresh,0);};

  q('access').onclick=()=>{
    if(accessDialog?.showModal){
      if(!accessDialog.open)accessDialog.showModal();
    }else{
      accessBtn?.click();
    }
  };

  q('play').onclick=()=>{
    if(!video)return;
    if(video.paused||video.ended){
      if(video.ended)video.currentTime=0;
      video.play().catch(()=>nativePlay?.click());
    }else{
      video.pause();
    }
    refresh();
  };

  q('replay').onclick=()=>{
    if(!video)return;
    video.currentTime=0;
    video.play().catch(()=>nativePlay?.click());
    refresh();
  };

  // Skip must finish the current narration state without invoking the native
  // toggle button after pausing it. The previous adapter paused first and then
  // clicked the toggle, which correctly interpreted the click as "replay".
  q('skip').onclick=()=>{
    if(!video)return;
    video.pause();
    if(Number.isFinite(video.duration)&&video.duration>0){
      video.currentTime=Math.max(0,video.duration-.05);
    }
    video.dispatchEvent(new Event('ended'));
    stage.classList.remove('is-narrating');
    setTimeout(refresh,0);
  };

  q('continue').onclick=()=>next?.click();

  if(video){
    ['play','pause','ended','volumechange','loadedmetadata'].forEach((eventName)=>video.addEventListener(eventName,refresh));
  }
  new MutationObserver(refresh).observe(next||app,{attributes:true,attributeFilter:['disabled','class']});
  refresh();
})();
