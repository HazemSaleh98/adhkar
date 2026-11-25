(function(){
var $=function(s){return document.querySelector(s)};
var KEY='adhkar.v1';
var S=load();
function load(){var d={};try{d=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}
 return Object.assign({fav:{},prog:{},tt:33,fs:30,dark:false,tas:0,m:{on:true,t:'05:30'},e:{on:true,t:'17:00'},iv:{on:false,min:15,from:'08:00',to:'22:00'},fired:{},next:0},d)}
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

function ring(sz,sw,f,col,tr){var r=(sz-sw)/2,c=2*Math.PI*r;return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 '+sz+' '+sz+'"><circle cx="'+sz/2+'" cy="'+sz/2+'" r="'+r+'" fill="none" stroke="'+(tr||'rgba(255,255,255,.22)')+'" stroke-width="'+sw+'"/><circle class="pr" cx="'+sz/2+'" cy="'+sz/2+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-dasharray="'+c+'" stroke-dashoffset="'+c*(1-f)+'" style="transition:stroke-dashoffset .35s ease"/></svg>'}
function tabs(){var T=[['home','home','الرئيسية'],['tas','beads','المسبحة'],['fav','heart','المفضلة'],['set','gear','الإعدادات']];
 return '<div class="tabs">'+T.map(function(t){return '<button data-t="'+t[0]+'" class="'+(view.t===t[0]?'on':'')+'">'+IC(t[1],23)+t[2]+'</button>'}).join('')+'</div>'}
function render(){
 document.body.className=S.dark?'dark':'';document.documentElement.style.setProperty('--fs',S.fs+'px');
 var h;
 if(view.t==='read'){h=readView()}else{h='<div class="scr"><div class="main">'+(view.t==='home'?home():view.t==='tas'?tasView():view.t==='fav'?favView():setView())+'</div>'+tabs()+'</div>'}
 $('#app').innerHTML=h;bind()}
function list(c){return DH.filter(function(d){return d.c.indexOf(c)>=0})}
function home(){var sc=suggest(),c=catById(sc),p=catProg(sc),r=POOL[Math.floor(Date.now()/36e5)%POOL.length],f=p.n?p.done/p.n:0;
 var hij=new Date().toLocaleDateString('ar-EG-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}),gr=new Date().toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});
 var h='<h1 class="h1">'+greet()+'</h1><p class="sub">'+gr+' · <span class="hij">'+hij+'</span></p>';
 h+='<div class="hero"><div class="k">'+IC(CATIC[sc],18)+'الآن</div><h2>'+c.n+'</h2><p>'+(p.done>=p.n?'أتممت أذكار اليوم، تقبّل الله':'تم '+an(p.done)+' من '+an(p.n)+' · '+c.d)+'</p><div class="row"><button class="go" data-read="'+sc+'">'+(p.done?'متابعة':'ابدأ')+IC('chev',18)+'</button><div class="rg">'+ring(62,5,f,'#fff')+'<b>'+an(Math.round(f*100))+'٪</b></div></div></div>';
 h+='<div class="sec">الأذكار</div><div class="list">'+CATS.map(function(c){var p=catProg(c.id),f=p.n?p.done/p.n:0;return '<button class="it" data-read="'+c.id+'"><div class="ib">'+IC(CATIC[c.id],24)+'</div><div class="t"><b>'+c.n+'</b><span>'+c.d+'</span></div><div class="e"><span class="mini rg" style="width:30px;height:30px">'+ring(30,3,f,'var(--acc2)','var(--line)')+'</span></div></button>'}).join('')+'</div>';
 h+='<div class="sec">ذكر الساعة</div><div class="quote"><div class="orn">'+IC('beads',14)+'</div><div class="tx">'+esc(r.t)+'</div><small>'+esc(r.s||'')+'</small></div>';return h}
function sizeFor(t){var n=t.length,b=S.fs;return n>420?Math.min(b,21):n>260?Math.min(b,24):n>150?Math.min(b,27):b}
function readView(){var l=list(view.id),c=catById(view.id);
 if(view.i>=l.length){return '<div class="scr rd"><div class="rtop"><button class="cb" data-home="1">'+IC('next',20)+'</button><h3>'+c.n+'</h3><span style="width:42px"></span></div><div class="fin"><div class="ck"><svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.8 10 17.5 19 7"/></svg></div><h2>تقبّل الله منك</h2><p>أتممت '+c.n+'</p><div class="row" style="display:flex;gap:10px;justify-content:center"><button class="btn o" data-again="1">من البداية</button><button class="btn" data-home="1">الرئيسية</button></div></div></div>'}
 var d=l[view.i],n=cnt(view.id,d.id),done=n>=d.k,f=n/d.k;
 var segs=l.map(function(x,j){var dn=cnt(view.id,x.id)>=x.k;return '<i class="'+(dn?'d':j===view.i?'c':'')+'"></i>'}).join('');
 return '<div class="scr rd"><div class="rtop"><button class="cb" data-home="1">'+IC('next',20)+'</button><h3>'+c.n+' · '+an(view.i+1)+'/'+an(l.length)+'</h3><button class="cb'+(S.fav[d.id]?' on':'')+'" data-fav="'+d.id+'">'+IC('heart',20)+'</button></div><div class="segs">'+segs+'</div>'+
 '<div class="rbody" data-tapzone="1"><div class="pcard" data-d="'+d.id+'"><div class="tx" style="font-size:'+sizeFor(d.t)+'px">'+esc(d.t)+'</div>'+(d.s?'<div class="src">'+esc(d.s)+'</div>':'')+(d.h?'<div class="fd">'+esc(d.h)+'</div>':'')+'</div></div>'+
 '<div class="dock"><button class="cb nv" data-nav="-1" '+(view.i<=0?'disabled':'')+'>'+IC('next',22)+'</button><button class="ctr'+(done?' dn':'')+'" data-ctr="1">'+ring(132,6,f,'var(--acc2)','var(--line)')+'<span class="n"><b>'+(done?IC('check',34):an(d.k-n))+'</b><small>'+(d.k>1?'من '+an(d.k):'مرة')+'</small></span></button><button class="cb nv" data-nav="1" '+(view.i>=l.length?'disabled':'')+'>'+IC('chev',22)+'</button></div></div>'}
function favView(){var l=DH.filter(function(d){return S.fav[d.id]});
 return '<h1 class="h1">المفضلة</h1><p class="sub" style="margin-bottom:20px">أذكارك المحفوظة</p>'+(l.length?l.map(function(d){return '<div class="fc"><div class="tx">'+esc(d.t)+'</div><div class="row"><button class="cb on" data-fav="'+d.id+'">'+IC('heart',20)+'</button><small>'+esc(d.s||'')+'</small><button class="cb" data-share="'+d.id+'">'+IC('share',20)+'</button></div></div>'}).join(''):'<div class="empty"><div class="ib">'+IC('heart',28)+'</div>اضغط على القلب في أي ذكر<br>وهيتحفظ هنا</div>')}
function tasView(){var t=S.tt==null?33:S.tt,n=t?S.tas%t:S.tas,lap=t?Math.floor(S.tas/t):0,f=t?n/t:0;
 return '<h1 class="h1">المسبحة</h1><p class="sub">اضغط على الدايرة للعدّ</p><div class="tw"><button class="big" data-tas="1">'+ring(260,7,f,'var(--gold)','var(--line)')+'<span class="n"><b>'+an(n)+'</b><small>'+(t?'من '+an(t):'')+'</small></span></button>'+
 '<div class="seg">'+[33,99,100,0].map(function(x){return '<button data-tt="'+x+'" class="'+(t===x?'on':'')+'">'+(x?an(x):'حر')+'</button>'}).join('')+'</div><div class="tot">الإجمالي '+an(S.tas)+(lap?' · '+an(lap)+' دورة':'')+'</div><button class="btn o" data-tasr="1" style="display:flex;gap:8px;align-items:center">'+IC('reset',18)+'تصفير</button></div>'}
function row(ic,t,ctl){return '<label><span class="l"><span class="ib">'+IC(ic,18)+'</span>'+t+'</span>'+ctl+'</label>'}
function sw(k,v){return '<input type="checkbox" class="sw" data-k="'+k+'" '+(v?'checked':'')+'>'}
function setView(){var iv=S.iv;
 return '<h1 class="h1">الإعدادات</h1><p class="sub" style="margin-bottom:20px">التذكيرات والمظهر</p>'+
 '<div class="sec">التذكيرات</div><div class="list st">'+row('sunrise','أذكار الصباح',sw('m.on',S.m.on))+row('clock','الوقت','<input type="time" data-k="m.t" value="'+S.m.t+'">')+row('sunset','أذكار المساء',sw('e.on',S.e.on))+row('clock','الوقت','<input type="time" data-k="e.t" value="'+S.e.t+'">')+'</div>'+
 '<div class="sec">ذكر كل فترة</div><div class="list st">'+row('bell','تفعيل',sw('iv.on',iv.on))+row('clock','كل','<select data-k="iv.min">'+[1,5,10,15,20,30,45,60,90,120].map(function(m){return '<option value="'+m+'"'+(iv.min==m?' selected':'')+'>'+an(m)+' دقيقة</option>'}).join('')+'</select>')+row('sun','من','<input type="time" data-k="iv.from" value="'+iv.from+'">')+row('moon','إلى','<input type="time" data-k="iv.to" value="'+iv.to+'">')+'</div>'+
 '<div class="list st"><button class="it" data-perm="1"><div class="ib">'+IC('bell',22)+'</div><div class="t"><b>السماح بالإشعارات</b><span id="pst">'+permTxt()+'</span></div></button><button class="it" data-test="1"><div class="ib">'+IC('check',22)+'</div><div class="t"><b>جرّب إشعار الآن</b></div></button></div>'+
 '<p class="note">الإشعارات بتوصل والتطبيق مفتوح. على الآيفون، أضف التطبيق للشاشة الرئيسية الأول.</p>'+
 '<div class="sec">المظهر</div><div class="list st">'+row('moon','الوضع الليلي',sw('dark',S.dark))+row('type','حجم الخط','<input type="range" min="22" max="40" value="'+S.fs+'" data-k="fs">')+'</div>'+
 '<p class="note" style="text-align:center;margin-top:0">© Hazem Saleh</p>'}
function permTxt(){if(!('Notification' in window))return 'غير متاحة هنا، أضف التطبيق للشاشة الرئيسية';return {granted:'مفعّلة',denied:'مرفوضة، فعّلها من إعدادات الآيفون',default:'لسه ماتفعّلتش'}[Notification.permission]}
function advance(){var l=list(view.id);view.i++;render()}
function bind(){
 document.querySelectorAll('.tabs button').forEach(function(b){b.onclick=function(){view={t:b.dataset.t};render()}});
 document.querySelectorAll('[data-read]').forEach(function(b){b.onclick=function(){var c=b.dataset.read,l=list(c),i=0;for(;i<l.length;i++)if(cnt(c,l[i].id)<l[i].k)break;view={t:'read',id:c,i:i>=l.length?0:i};render()}});
 document.querySelectorAll('[data-home]').forEach(function(b){b.onclick=function(){view={t:'home'};render()}});
 var ag=document.querySelector('[data-again]');if(ag)ag.onclick=function(){var p=dayP();Object.keys(p).forEach(function(k){if(k.indexOf(view.id+'|')===0)delete p[k]});save();view.i=0;render()};
 document.querySelectorAll('[data-nav]').forEach(function(b){b.onclick=function(){view.i=Math.max(0,view.i+ +b.dataset.nav);render()}});
 var tap=function(){var l=list(view.id),d=l[view.i],p=dayP(),k=view.id+'|'+d.id;if((p[k]||0)>=d.k)return;p[k]=(p[k]||0)+1;save();if(navigator.vibrate)navigator.vibrate(12);
  var done=p[k]>=d.k,c=document.querySelector('.ctr');c.classList.remove('pulse');void c.offsetWidth;c.classList.add('pulse');
  var pr=c.querySelector('.pr'),r=+pr.getAttribute('r'),C=2*Math.PI*r;pr.setAttribute('stroke-dashoffset',C*(1-p[k]/d.k));
  if(done){c.classList.add('dn');c.querySelector('b').innerHTML=IC('check',34);if(navigator.vibrate)navigator.vibrate([20,40,20]);setTimeout(advance,650)}else c.querySelector('b').textContent=an(d.k-p[k])};
 var ct=document.querySelector('[data-ctr]');if(ct)ct.onclick=function(e){e.stopPropagation();tap()};
 var tz=document.querySelector('[data-tapzone]');if(tz)tz.onclick=function(e){if(!e.target.closest('button'))tap()};
 document.querySelectorAll('[data-fav]').forEach(function(b){b.onclick=function(){var id=+b.dataset.fav;S.fav[id]=!S.fav[id];if(!S.fav[id])delete S.fav[id];save();render()}});
 document.querySelectorAll('[data-share]').forEach(function(b){b.onclick=function(){var d=DH[+b.dataset.share],t=d.t+(d.s?'\n['+d.s+']':'');if(navigator.share)navigator.share({text:t}).catch(function(){});else if(navigator.clipboard){navigator.clipboard.writeText(t);toast('تم النسخ')}}});
 var tb=document.querySelector('[data-tas]');if(tb)tb.onclick=function(){S.tas++;save();if(navigator.vibrate)navigator.vibrate(S.tt&&S.tas%S.tt===0?[30,50,30]:8);render()};
 var tr=document.querySelector('[data-tasr]');if(tr)tr.onclick=function(){S.tas=0;save();render()};
 document.querySelectorAll('[data-tt]').forEach(function(b){b.onclick=function(){S.tt=+b.dataset.tt;save();render()}});
 document.querySelectorAll('[data-k]').forEach(function(i){i.onchange=i.oninput=function(){var p=i.dataset.k.split('.'),v=i.type==='checkbox'?i.checked:(i.type==='range'||i.tagName==='SELECT'?+i.value:i.value);
  if(p.length===2)S[p[0]][p[1]]=v;else S[p[0]]=v;if(p[0]==='iv')S.next=0;save();if(i.type==='range'){document.documentElement.style.setProperty('--fs',S.fs+'px')}else if(p[0]==='dark')render()}});
 var pm=document.querySelector('[data-perm]');if(pm)pm.onclick=function(){if(!('Notification' in window)){toast('أضف التطبيق للشاشة الرئيسية الأول');return}Notification.requestPermission().then(function(){var e=$('#pst');if(e)e.textContent=permTxt()})};
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
