// Background reminders via Web Push. Set PUSH_API to the Worker address to switch it on.
// Phone-side state: only a random id and a secret, kept in this browser (localStorage 'adhkar.push.v1').
(function(){
var PUSH_API='https://adhkar-push.adhkar-push-eg.workers.dev';
var K='adhkar.push.v1';
function st(){try{return JSON.parse(localStorage.getItem(K))||null}catch(e){return null}}
function put(v){if(v)localStorage.setItem(K,JSON.stringify(v));else localStorage.removeItem(K)}
function b64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';var r=atob(s),o=new Uint8Array(r.length);for(var i=0;i<r.length;i++)o[i]=r.charCodeAt(i);return o}
function supported(){return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window}
function standalone(){return window.navigator.standalone===true||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)}
function post(path,body){return fetch(PUSH_API+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})}
function available(){return !!PUSH_API}
function active(){return !!st()&&('Notification' in window)&&Notification.permission==='granted'}
// cfg: {tz,interval,from,to,fixed:[]}. Must be called from a tap.
async function enable(cfg){
  if(!PUSH_API)return {ok:false,why:'noapi'};
  if(!supported())return {ok:false,why:standalone()?'unsupported':'install'};
  if(!standalone())return {ok:false,why:'install'};
  var perm=await Notification.requestPermission();
  if(perm!=='granted')return {ok:false,why:'denied'};
  try{
    var reg=await navigator.serviceWorker.ready;
    var key=(await (await fetch(PUSH_API+'/vapid-public')).json()).key;
    var sub=await reg.pushManager.getSubscription()||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(key)});
    var r=await post('/subscribe',{subscription:sub.toJSON(),settings:cfg});
    if(r.status===409){await sub.unsubscribe();sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(key)});r=await post('/subscribe',{subscription:sub.toJSON(),settings:cfg})}
    if(!r.ok)return {ok:false,why:'server'};
    put(await r.json().then(function(j){return {id:j.id,token:j.token}}));
    return {ok:true};
  }catch(e){return {ok:false,why:'error'}}
}
// Unsubscribe and delete all server-side data for this phone.
async function disable(){
  var s=st(),del=true;
  try{if(s&&PUSH_API){var r=await post('/unsubscribe',{id:s.id,token:s.token});del=r.ok}}catch(e){del=false}
  try{var reg=await navigator.serviceWorker.ready,sub=await reg.pushManager.getSubscription();if(sub)await sub.unsubscribe()}catch(e){}
  if(del)put(null);
  return {ok:del};
}
var tm=0;
function sync(cfg){
  var s=st();if(!s||!PUSH_API)return;clearTimeout(tm);
  tm=setTimeout(async function(){try{var reg=await navigator.serviceWorker.ready,sub=await reg.pushManager.getSubscription();if(!sub)return;await post('/subscribe',{id:s.id,token:s.token,subscription:sub.toJSON(),settings:cfg})}catch(e){}},1500);
}
window.AdhkarPush={enable:enable,disable:disable,sync:sync,supported:supported,standalone:standalone,available:available,active:active};
})();
