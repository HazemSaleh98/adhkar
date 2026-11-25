(function(){
var $=function(s){return document.querySelector(s)};
var KEY='adhkar.v1';
var S=load();
function load(){var d={};try{d=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}
 return Object.assign({fav:{},prog:{},fs:26,dark:false,tas:0,m:{on:true,t:'05:30'},e:{on:true,t:'17:00'},iv:{on:false,min:15,from:'08:00',to:'22:00'},fired:{},next:0},d)}
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
function today(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function esc(s){return s.replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
var AR='٠١٢٣٤٥٦٧٨٩';function an(n){return String(n).replace(/\d/g,function(d){return AR[d]})}
var view={t:'home'};
function dayP(){return S.prog[today()]||(S.prog={},S.prog[today()]={})}
function cnt(cat,id){return (dayP()[cat+'|'+id])||0}
function catProg(c){var l=DH.filter(function(d){return d.c.indexOf(c)>=0}),done=0;l.forEach(function(d){if(cnt(c,d.id)>=d.k)done++});return{done:done,n:l.length}}
function greet(){var h=new Date().getHours();return h<12?'صباح الخير':h<17?'نهارك سعيد':h<20?'مساء الخير':'مساء النور'}
function suggest(){var h=new Date().getHours();return h>=3&&h<12?'morning':h>=12&&h<20?'evening':'sleep'}
function toast(t){var e=$('#toast');e.textContent=t;e.className='on';clearTimeout(toast.h);toast.h=setTimeout(function(){e.className=''},6000)}
function catById(id){return CATS.filter(function(c){return c.id===id})[0]}
function tabs(){var T=[['home','🏠','الرئيسية'],['tas','📿','المسبحة'],['fav','❤️','المفضلة'],['set','⚙️','الإعدادات']];
 return '<div class="tabs">'+T.map(function(t){return '<button data-t="'+t[0]+'" class="'+(view.t===t[0]||(view.t==='cat'&&t[0]==='home')?'on':'')+'"><b>'+t[1]+'</b>'+t[2]+'</button>'}).join('')+'</div>'}
function render(){
 document.body.className=S.dark?'dark':'';document.documentElement.style.setProperty('--fs',S.fs+'px');
 var h='';
 if(view.t==='home')h=home();else if(view.t==='cat')h=catView(view.id);else if(view.t==='tas')h=tasView();else if(view.t==='fav')h=favView();else h=setView();
 $('#app').innerHTML=h+tabs();bind()}
function dhCard(d,cat){var n=cnt(cat,d.id),done=n>=d.k;
 return '<div class="card dh'+(done?' done':'')+'" data-d="'+d.id+'" data-c="'+cat+'"><div class="tx">'+esc(d.t)+'</div>'+(d.h?'<div class="hd">'+esc(d.h)+'</div>':'')+(d.s?'<div class="src">'+esc(d.s)+'</div>':'')+
 '<div class="act"><button class="ic" data-share="'+d.id+'">📤</button><button class="cnt" data-tap="1">'+(done?'✓':an(d.k-n))+'<small>'+(d.k>1?'من '+an(d.k):'مرة')+'</small></button><button class="ic'+(S.fav[d.id]?' on':'')+'" data-fav="'+d.id+'">'+(S.fav[d.id]?'♥':'♡')+'</button></div></div>'}
function home(){var sc=suggest(),c=catById(sc),r=POOL[Math.floor(Date.now()/36e5)%POOL.length],p=catProg(sc);
 var h='<div class="top"><h1>'+greet()+'</h1><p>'+new Date().toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'})+'</p></div><div class="main">';
 h+='<div class="card hero"><small>ذكر الساعة</small><div class="tx">'+esc(r.t)+'</div><small>'+esc(r.s||'')+'</small></div>';
 h+='<button class="cat" style="width:100%;margin-bottom:12px;display:flex;align-items:center;gap:14px" data-cat="'+sc+'"><i>'+c.ic+'</i><div style="flex:1"><b>الآن: '+c.n+'</b><span>تم '+an(p.done)+' من '+an(p.n)+'</span><div class="pg"><div style="width:'+(p.n?p.done/p.n*100:0)+'%"></div></div></div></button>';
 h+='<div class="sec">كل الأذكار</div><div class="grid">'+CATS.map(function(c){var p=catProg(c.id);return '<button class="cat" data-cat="'+c.id+'"><i>'+c.ic+'</i><b>'+c.n+'</b><span>'+c.d+'</span><div class="pg"><div style="width:'+(p.n?p.done/p.n*100:0)+'%"></div></div></button>'}).join('')+'</div></div>';return h}
function catView(id){var c=catById(id),l=DH.filter(function(d){return d.c.indexOf(id)>=0}),p=catProg(id);
 return '<div class="top"><div class="bar"><button class="back" data-back="1">›</button><div><h1>'+c.ic+' '+c.n+'</h1><p>تم '+an(p.done)+' من '+an(p.n)+'</p></div></div></div><div class="main">'+l.map(function(d){return dhCard(d,id)}).join('')+'<div class="empty"><button class="btn out" data-reset="'+id+'">إعادة العدّ</button></div></div>'}
function favView(){var l=DH.filter(function(d){return S.fav[d.id]});
 return '<div class="top"><h1>المفضلة</h1><p>الأذكار اللي حفظتها</p></div><div class="main">'+(l.length?l.map(function(d){return dhCard(d,'fav')}).join(''):'<div class="empty">اضغط ♡ على أي ذكر عشان يتحفظ هنا</div>')+'</div>'}
function tasView(){return '<div class="top"><h1>المسبحة</h1><p>اضغط للعدّ</p></div><div class="main"><div class="tas"><button class="big" data-tas="1">'+an(S.tas)+'</button><div class="row" style="margin-top:22px"><button class="btn out" data-tasr="1">تصفير</button></div><p class="note">العدّاد محفوظ على جهازك.</p></div></div>'}
function setView(){var iv=S.iv;
 return '<div class="top"><h1>الإعدادات</h1><p>التذكيرات والمظهر</p></div><div class="main"><div class="card set">'+
 '<label>تذكير أذكار الصباح<input type="checkbox" class="sw" data-k="m.on" '+(S.m.on?'checked':'')+'></label><label>وقته<input type="time" data-k="m.t" value="'+S.m.t+'"></label>'+
 '<label>تذكير أذكار المساء<input type="checkbox" class="sw" data-k="e.on" '+(S.e.on?'checked':'')+'></label><label>وقته<input type="time" data-k="e.t" value="'+S.e.t+'"></label></div>'+
 '<div class="card set"><label>ذكر كل فترة<input type="checkbox" class="sw" data-k="iv.on" '+(iv.on?'checked':'')+'></label>'+
 '<label>كل<select data-k="iv.min">'+[1,5,10,15,20,30,45,60,90,120].map(function(m){return '<option value="'+m+'"'+(iv.min==m?' selected':'')+'>'+an(m)+' دقيقة</option>'}).join('')+'</select></label>'+
 '<label>من<input type="time" data-k="iv.from" value="'+iv.from+'"></label><label>إلى<input type="time" data-k="iv.to" value="'+iv.to+'"></label></div>'+
 '<div class="card set"><button class="btn" data-perm="1" style="width:100%">تفعيل الإشعارات</button><p class="note" id="pst">'+permTxt()+'</p><button class="btn out" data-test="1" style="width:100%;margin-top:8px">جرّب إشعار الآن</button>'+
 '<p class="note">في نسخة المعاينة، الإشعارات بتشتغل والتطبيق مفتوح. عشان توصلك والتطبيق مقفول محتاجة خادم صغير مجاني (الخطوة الجاية).</p></div>'+
 '<div class="card set"><label>الوضع الليلي<input type="checkbox" class="sw" data-k="dark" '+(S.dark?'checked':'')+'></label><label>حجم الخط<input type="range" min="20" max="40" value="'+S.fs+'" data-k="fs"></label></div></div>'}
function permTxt(){if(!('Notification' in window))return 'الإشعارات غير متاحة هنا. على الآيفون ضيف التطبيق للشاشة الرئيسية الأول.';return {granted:'الإشعارات مفعّلة.',denied:'الإشعارات مرفوضة، فعّلها من إعدادات الآيفون.',default:'لسه ماتفعّلتش.'}[Notification.permission]}
function bind(){
 document.querySelectorAll('.tabs button').forEach(function(b){b.onclick=function(){view={t:b.dataset.t};render()}});
 document.querySelectorAll('[data-cat]').forEach(function(b){b.onclick=function(){view={t:'cat',id:b.dataset.cat};render()}});
 var bk=document.querySelector('[data-back]');if(bk)bk.onclick=function(){view={t:'home'};render()};
 document.querySelectorAll('.dh').forEach(function(card){var id=+card.dataset.d,cat=card.dataset.c,d=DH[id];
  card.querySelector('[data-tap]').onclick=function(){var p=dayP(),k=cat+'|'+id;if((p[k]||0)<d.k){p[k]=(p[k]||0)+1;save();if(navigator.vibrate)navigator.vibrate(15);render()}};
  card.querySelector('[data-fav]').onclick=function(){S.fav[id]=!S.fav[id];if(!S.fav[id])delete S.fav[id];save();render()};
  card.querySelector('[data-share]').onclick=function(){var t=d.t+(d.s?'\n['+d.s+']':'');if(navigator.share)navigator.share({text:t}).catch(function(){});else if(navigator.clipboard){navigator.clipboard.writeText(t);toast('تم النسخ')}}});
 var rs=document.querySelector('[data-reset]');if(rs)rs.onclick=function(){var p=dayP();Object.keys(p).forEach(function(k){if(k.indexOf(rs.dataset.reset+'|')===0)delete p[k]});save();render()};
 var tb=document.querySelector('[data-tas]');if(tb)tb.onclick=function(){S.tas++;save();if(navigator.vibrate)navigator.vibrate(10);tb.textContent=an(S.tas)};
 var tr=document.querySelector('[data-tasr]');if(tr)tr.onclick=function(){S.tas=0;save();render()};
 document.querySelectorAll('[data-k]').forEach(function(i){i.onchange=i.oninput=function(){var p=i.dataset.k.split('.'),v=i.type==='checkbox'?i.checked:(i.type==='range'||i.tagName==='SELECT'?+i.value:i.value);
  if(p.length===2)S[p[0]][p[1]]=v;else S[p[0]]=v;if(p[0]==='iv')S.next=0;save();if(i.type==='range'||p[0]==='dark')render()}});
 var pm=document.querySelector('[data-perm]');if(pm)pm.onclick=function(){if(!('Notification' in window)){toast('ضيف التطبيق للشاشة الرئيسية الأول');return}Notification.requestPermission().then(function(){var e=$('#pst');if(e)e.textContent=permTxt()})};
 var ts=document.querySelector('[data-test]');if(ts)ts.onclick=function(){notify('أذكار','سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ')}}
var reg=null;
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').then(function(r){reg=r}).catch(function(){});
function notify(title,body){toast(body);if('Notification' in window&&Notification.permission==='granted'){try{if(reg)reg.showNotification(title,{body:body,icon:'icons/icon-192.png',dir:'rtl',lang:'ar',tag:'adhkar'});else new Notification(title,{body:body})}catch(e){}}}
function mins(t){var p=t.split(':');return +p[0]*60+ +p[1]}
function tick(){var n=new Date(),m=n.getHours()*60+n.getMinutes(),k=today();
 if(!S.fired[k]){S.fired={};S.fired[k]={}}
 [['m','أذكار الصباح','حان وقت أذكار الصباح 🌅'],['e','أذكار المساء','حان وقت أذكار المساء 🌇']].forEach(function(x){var c=S[x[0]];
  if(c.on&&!S.fired[k][x[0]]&&m>=mins(c.t)&&m<mins(c.t)+180){S.fired[k][x[0]]=1;save();notify(x[1],x[2])}});
 var iv=S.iv;if(iv.on){var inW=m>=mins(iv.from)&&m<=mins(iv.to);
  if(!S.next)S.next=Date.now()+iv.min*6e4;
  if(inW&&Date.now()>=S.next){var d=POOL[Math.floor(Math.random()*POOL.length)];S.next=Date.now()+iv.min*6e4;save();notify('ذكر',d.t)}
  else if(!inW&&Date.now()>=S.next){S.next=Date.now()+iv.min*6e4;save()}}}
setInterval(tick,15000);document.addEventListener('visibilitychange',function(){if(!document.hidden)tick()});
window.__adhkar={tick:tick,S:S,notify:notify};
render();tick();
})();
