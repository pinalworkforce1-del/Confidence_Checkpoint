(function(){
  const cfg=window.LEVEL_UP_CONFIG;
  const sessionKey=`sb-${new URL(cfg.SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
  let session=null,user=null,ready=false,timer=null,lastError=null;

  function headers(extra={}){return {'apikey':cfg.SUPABASE_PUBLISHABLE_KEY,'Authorization':`Bearer ${session.access_token}`,...extra}}
  function readSession(){try{const raw=localStorage.getItem(sessionKey);if(!raw)return null;const value=JSON.parse(raw);return value?.currentSession||value}catch{return null}}
  function writeSession(value){session=value;localStorage.setItem(sessionKey,JSON.stringify(value))}
  async function refreshIfNeeded(){
    session=readSession();if(!session)return null;
    const expires=(session.expires_at||0)*1000;
    if(expires>Date.now()+60000)return session;
    if(!session.refresh_token)return null;
    const res=await fetch(`${cfg.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{'apikey':cfg.SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})});
    if(!res.ok)return null;writeSession(await res.json());return session;
  }
  async function api(path,options={}){
    const res=await fetch(`${cfg.SUPABASE_URL}/rest/v1/${path}`,{...options,headers:headers({'Content-Type':'application/json',...(options.headers||{})})});
    if(!res.ok)throw new Error(`Cloud request failed (${res.status})`);
    const text=await res.text();return text?JSON.parse(text):null;
  }
  async function init(){
    try{
      if(!await refreshIfNeeded())return {authenticated:false};
      user=session.user;
      if(!user?.id){const auth=await fetch(`${cfg.SUPABASE_URL}/auth/v1/user`,{headers:headers()});if(!auth.ok)return {authenticated:false};user=await auth.json()}
      const [profiles,progress]=await Promise.all([
        api(`profiles?user_id=eq.${encodeURIComponent(user.id)}&select=display_name,email`),
        api(`module_progress?user_id=eq.${encodeURIComponent(user.id)}&module_id=in.(${cfg.DISCOVERY_MODULE_ID},${cfg.RESUME_MODULE_ID},${cfg.MODULE_ID})&select=module_id,journey_state,xp,is_complete,updated_at`)
      ]);
      ready=true;
      const byId=Object.fromEntries((progress||[]).map(row=>[row.module_id,row]));
      return {authenticated:true,user,profile:profiles?.[0]||null,progress:byId[cfg.MODULE_ID]||null,prerequisites:{discovery:!!byId[cfg.DISCOVERY_MODULE_ID]?.is_complete,resume:!!byId[cfg.RESUME_MODULE_ID]?.is_complete}};
    }catch(error){lastError=error;return {authenticated:!!user,error}}
  }
  async function flush(state){
    if(!ready||!user)return false;
    const now=new Date().toISOString();state.updatedAt=now;
    const payload={user_id:user.id,module_id:cfg.MODULE_ID,journey_state:state,xp:Math.max(0,Math.round(state.xp||0)),is_complete:!!state.complete,updated_at:now,completed_at:state.complete?(state.completionDate||now):null};
    try{await api('module_progress?on_conflict=user_id,module_id',{method:'POST',headers:{'Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(payload)});lastError=null;window.dispatchEvent(new CustomEvent('lu-cloud-status',{detail:'synced'}));return true}catch(error){lastError=error;window.dispatchEvent(new CustomEvent('lu-cloud-status',{detail:'error'}));return false}
  }
  function queueSave(state){if(!ready)return;window.dispatchEvent(new CustomEvent('lu-cloud-status',{detail:'saving'}));clearTimeout(timer);timer=setTimeout(()=>flush(state),700)}
  window.LUCloud={init,flush,queueSave,get user(){return user},get lastError(){return lastError}};
})();
