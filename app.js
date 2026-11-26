(function(){
var $=function(s){return document.querySelector(s)};
var KEY='adhkar.v2';
var S=load();
function load(){var d={};try{d=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}
 return Object.assign({fav:{},prog:{},tt:33,fs:30,dark:false,tas:0,m:{on:true,t:'05:30'},e:{on:true,t:'17:00'},iv:{on:false,min:15,from:'08:00',to:'22:00'},fired:{},next:0,city:'cairo',hist:{},total:0,ctr:{ist:{d:'',n:0,g:100},sal:{d:'',n:0,g:100}},pr:{on:false},tm:'free'},d)}
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
function dkey(d){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function today(){return dkey(new Date())}
function esc(s){return s.replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
var AR='٠١٢٣٤٥٦٧٨٩';function an(n){return String(n).replace(/\d/g,function(d){return AR[d]})}
function p2(n){return (n<10?'0':'')+n}
var view={t:'home'};
function dayP(){if(!S.prog[today()])S.prog={},S.prog[today()]={};return S.prog[today()]}
function cnt(cat,id){return (dayP()[cat+'|'+id])||0}
function list(c){return c==='fav'?DH.filter(function(d){return S.fav[d.id]}):DH.filter(function(d){return d.c.indexOf(c)>=0})}
function catProg(c){var l=list(c),done=0;l.forEach(function(d){if(cnt(c,d.id)>=d.k)done++});return{done:done,n:l.length}}
function greet(){var h=new Date().getHours();return h<4?'أهلاً بك':h<12?'صباح الخير':h<17?'نهارك سعيد':h<20?'مساء الخير':'مساء النور'}
function toast(t){var e=$('#toast');e.textContent=t;e.className='on';clearTimeout(toast.h);toast.h=setTimeout(function(){e.className=''},6000)}
function catById(id){return id==='fav'?{id:'fav',n:'المفضلة',d:'أذكارك المحفوظة'}:CATS.filter(function(c){return c.id===id})[0]}
/* ---- prayer times ---- */
var PN=[['fajr','الفجر'],['sunrise','الشروق'],['dhuhr','الظهر'],['asr','العصر'],['maghrib','المغرب'],['isha','العشاء']];
function city(){return CITIES.filter(function(c){return c[0]===S.city})[0]||CITIES[0]}
var pcache={};
function ptimes(y,m,d){var c=city(),k=c[0]+y+'-'+m+'-'+d;return pcache[k]||(pcache[k]=PT.calc(y,m,d,c[2],c[3],c[4],c[5]))}
function ptoday(){var c=city(),n=PT.nowIn(c[4]),r=ptimes(n.y,n.m,n.d);return {t:r.t,now:n.min,method:r.method,n:n}}
function fmtT(min){var h=Math.floor(min/60)%24,m=Math.round(min)%60,h12=h%12||12;return an(h12)+':'+an(p2(m))+' '+(h<12?'ص':'م')}
function fmtLeft(min){min=Math.max(0,Math.ceil(min));var h=Math.floor(min/60),m=min%60;return h?an(h)+' س '+an(m)+' د':an(m)+' دقيقة'}
function nextPrayer(){var P=ptoday(),i;for(i=0;i<PN.length;i++){if(PN[i][0]==='sunrise')continue;if(P.t[PN[i][0]]>P.now)return {k:PN[i][0],n:PN[i][1],at:P.t[PN[i][0]],left:P.t[PN[i][0]]-P.now}}
 var dt=new Date(P.n.y,P.n.m-1,P.n.d+1),r=ptimes(dt.getFullYear(),dt.getMonth()+1,dt.getDate());return {k:'fajr',n:'الفجر',at:r.t.fajr,left:1440-P.now+r.t.fajr}}
function lastPrayer(){var P=ptoday(),best=null;['fajr','dhuhr','asr','maghrib','isha'].forEach(function(k){if(P.t[k]<=P.now)best={k:k,n:PN.filter(function(x){return x[0]===k})[0][1],ago:P.now-P.t[k]}});return best}
function suggest(){var P=ptoday(),m=P.now,t=P.t,lp=lastPrayer();
 if(lp&&lp.ago<=40)return {id:'prayer',why:'بعد صلاة '+lp.n};
 if(m>=t.fajr&&m<t.dhuhr)return {id:'morning'};if(m>=t.asr&&m<t.isha)return {id:'evening'};if(m>=t.isha||m<t.fajr)return {id:'sleep'};return {id:'daily'}}
/* ---- hijri + occasions ---- */
function hijri(dt){var o={};new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',{day:'numeric',month:'numeric',year:'numeric'}).formatToParts(dt).forEach(function(p){o[p.type]=+p.value});return {d:o.day,m:o.month,y:o.year}}
function occ(dt){var h=hijri(dt),w=dt.getDay(),o=[];
 if(h.m===9)o.push(['moon','شهر رمضان المبارك']);
 if(h.m===10&&h.d===1)o.push(['moon','عيد الفطر المبارك']);
 if(h.m===12&&h.d===10)o.push(['moon','عيد الأضحى المبارك']);
 if(h.m===12&&h.d===9)o.push(['sun','يوم عرفة، صيامه يكفّر سنتين لغير الحاج']);
 if(h.m===12&&h.d<=9)o.push(['moon','العشر الأوائل من ذي الحجة']);
 if(h.m===1&&h.d===10)o.push(['moon','يوم عاشوراء، صيامه يكفّر السنة الماضية']);
 if(w===5)o.push(['cal','يوم الجمعة: أكثر من الصلاة على النبي ﷺ واقرأ سورة الكهف']);
 var white=(h.d===13&&h.m!==12)||h.d===14||h.d===15;
 if(white)o.push(['moon','الأيام البيض: يُستحب صيام ١٣ و١٤ و١٥ من الشهر الهجري']);
 if((w===1||w===4)&&!white)o.push(['cal','اليوم '+(w===1?'الاثنين':'الخميس')+': سنة صيام الاثنين والخميس']);
 return o}
/* ---- stats ---- */
function histDay(k){return S.hist[k]||(S.hist[k]={n:0,d:false})}
function recordCount(n){n=n||1;S.total+=n;var h=histDay(today());h.n+=n;h.d=catProg('morning').done>=catProg('morning').n||catProg('evening').done>=catProg('evening').n||h.d;var ks=Object.keys(S.hist);if(ks.length>200){ks.sort(function(a,b){return new Date(a)-new Date(b)});delete S.hist[ks[0]]}}
function streaks(){var cur=0,best=0,run=0,d=new Date(),ks=Object.keys(S.hist).filter(function(k){return S.hist[k].d}).sort(function(a,b){return new Date(a)-new Date(b)}),prev=null;
 ks.forEach(function(k){var dt=new Date(k);if(prev&&Math.round((dt-prev)/864e5)===1)run++;else run=1;if(run>best)best=run;prev=dt});
 var t=new Date();if(!(S.hist[dkey(t)]&&S.hist[dkey(t)].d))t.setDate(t.getDate()-1);
 while(S.hist[dkey(t)]&&S.hist[dkey(t)].d){cur++;t.setDate(t.getDate()-1)}
 return {cur:cur,best:Math.max(best,cur)}}
function getC(m){var c=S.ctr[m];if(c.d!==today()){c.d=today();c.n=0}return c}
/* ---- ui ---- */
function ring(sz,sw,f,col,tr){var r=(sz-sw)/2,c=2*Math.PI*r;f=Math.max(0,Math.min(1,f));return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 '+sz+' '+sz+'"><circle cx="'+sz/2+'" cy="'+sz/2+'" r="'+r+'" fill="none" stroke="'+(tr||'rgba(255,255,255,.22)')+'" stroke-width="'+sw+'"/><circle class="pr" cx="'+sz/2+'" cy="'+sz/2+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-dasharray="'+c+'" stroke-dashoffset="'+c*(1-f)+'" style="transition:stroke-dashoffset .35s ease"/></svg>'}
function tabs(){var T=[['home','home','الرئيسية'],['pray','mosque','الصلاة'],['tas','beads','المسبحة'],['stat','chart','إنجازك'],['set','gear','الإعدادات']];
 return '<div class="tabs">'+T.map(function(t){return '<button data-t="'+t[0]+'" class="'+(view.t===t[0]?'on':'')+'">'+IC(t[1],22)+t[2]+'</button>'}).join('')+'</div>'}
function render(){
 document.body.className=S.dark?'dark':'';document.documentElement.style.setProperty('--fs',S.fs+'px');
 var h;
 if(view.t==='read'){h=readView()}else{var V={home:home,pray:prayView,tas:tasView,stat:statView,set:setView};h='<div class="scr"><div class="main">'+V[view.t]()+'</div>'+tabs()+'</div>'}
 $('#app').innerHTML=h;bind();cd()}
function pill(){var n=nextPrayer();return '<div class="pill" data-gopray="1"><span class="ib">'+IC('mosque',20)+'</span><div class="t"><b>الصلاة القادمة: '+n.n+'</b><span>'+fmtT(n.at)+' · '+city()[1]+'</span></div><div class="left" data-cd="1">'+fmtLeft(n.left)+'</div></div>'}
function home(){var sg=suggest(),sc=sg.id,c=catById(sc),p=catProg(sc),r=POOL[Math.floor(Date.now()/36e5)%POOL.length],f=p.n?p.done/p.n:0;
 var now=new Date(),tm=new Date(now.getTime()+864e5),hij=now.toLocaleDateString('ar-EG-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}),gr=now.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});
 var st=streaks(),h='<h1 class="h1">'+greet()+'</h1><p class="sub">'+gr+' · <span class="hij">'+hij+'</span></p>';
 h+='<div class="hero"><div class="k">'+IC(CATIC[sc],18)+(sg.why||'الآن')+'</div><h2>'+c.n+'</h2><p>'+(p.done>=p.n?'أتممت '+c.n+'، تقبّل الله':'تم '+an(p.done)+' من '+an(p.n)+' · '+c.d)+'</p><div class="row"><button class="go" data-read="'+sc+'">'+(p.done?'متابعة':'ابدأ')+IC('chev',18)+'</button><div class="rg">'+ring(62,5,f,'#fff')+'<b>'+an(Math.round(f*100))+'٪</b></div></div></div>';
 h+=pill();
 h+='<div class="chips"><div class="chip"><span class="ci">'+IC('flame',22)+'</span><b>'+an(st.cur)+'</b><small>يوم متواصل</small></div><div class="chip"><span class="ci">'+IC('beads',22)+'</span><b>'+an(histDay(today()).n)+'</b><small>ذكر اليوم</small></div></div>';
 var oc=occ(now).map(function(x){return ['اليوم',x]}).concat(occ(tm).map(function(x){return ['بكرة',x]})).slice(0,3);
 if(oc.length)h+='<div class="sec">مناسبات</div><div class="list">'+oc.map(function(x){return '<div class="it" style="cursor:default"><div class="ib">'+IC(x[1][0],22)+'</div><div class="t"><b style="font-size:14.5px;line-height:1.7;font-weight:500">'+x[1][1]+'</b><span>'+x[0]+'</span></div></div>'}).join('')+'</div>';
 h+='<div class="sec">الأذكار</div><div class="list">'+(Object.keys(S.fav).length?'<button class="it" data-read="fav"><div class="ib">'+IC('heart',24)+'</div><div class="t"><b>المفضلة</b><span>'+an(Object.keys(S.fav).length)+' ذكر محفوظ</span></div></button>':'')+CATS.map(function(c){var p=catProg(c.id),f=p.n?p.done/p.n:0;return '<button class="it" data-read="'+c.id+'"><div class="ib">'+IC(CATIC[c.id],24)+'</div><div class="t"><b>'+c.n+'</b><span>'+c.d+' · '+an(p.n)+'</span></div><div class="e"><span class="mini rg" style="width:30px;height:30px">'+ring(30,3,f,'var(--acc2)','var(--line)')+'</span></div></button>'}).join('')+'</div>';
 h+='<div class="sec">ذكر الساعة</div><div class="quote"><div class="orn">'+IC('beads',14)+'</div><div class="tx">'+esc(r.t)+'</div><small>'+esc(r.s||'')+'</small></div>';return h}
function prayView(){var P=ptoday(),n=nextPrayer(),c=city(),now=new Date();
 var h='<h1 class="h1">مواقيت الصلاة</h1><p class="sub">'+c[1]+' · <span class="hij">'+now.toLocaleDateString('ar-EG-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'})+'</span></p>';
 h+='<div class="hero"><div class="k">'+IC('mosque',18)+'الصلاة القادمة</div><h2>'+n.n+'</h2><p>'+fmtT(n.at)+'</p><div class="row"><div class="cdl" data-cd="1">'+fmtLeft(n.left)+'</div><span style="opacity:.8;font-size:13px">متبقي</span></div></div>';
 h+='<div class="list">'+PN.map(function(x){var isN=x[0]===n.k,past=P.t[x[0]]<=P.now&&!isN;return '<div class="it prow'+(isN?' nx':'')+(past?' ps':'')+'" style="cursor:default"><div class="ib">'+IC(x[0]==='fajr'?'sunrise':x[0]==='sunrise'?'sun':x[0]==='maghrib'?'sunset':x[0]==='isha'?'moon':'sun',22)+'</div><div class="t"><b>'+x[1]+'</b></div><div class="e" style="font-size:16px;color:var(--ink)">'+fmtT(P.t[x[0]])+'</div></div>'}).join('')+'</div>';
 h+='<div class="list st"><label><span class="l"><span class="ib">'+IC('pin',18)+'</span>المدينة</span><select data-city="1">'+CITIES.map(function(x){return '<option value="'+x[0]+'"'+(x[0]===S.city?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></label></div>';
 h+='<p class="note">طريقة الحساب: '+P.method+'. الحساب فلكي يعمل بدون إنترنت (خوارزمية praytimes.org). قد يختلف عن التقويم المحلي بدقيقة أو دقيقتين، فاعتمد على تقويم بلدك للاحتياط.</p>';return h}
function tasView(){var m=S.tm,seg='<div class="seg">'+[['free','حرة'],['ist','استغفار'],['sal','صلاة على النبي']].map(function(x){return '<button data-tm="'+x[0]+'" class="'+(m===x[0]?'on':'')+'">'+x[1]+'</button>'}).join('')+'</div>';
 var h='<h1 class="h1">المسبحة</h1><p class="sub">اضغط على الدايرة للعدّ</p><div class="tw">'+seg;
 if(m==='free'){var t=S.tt==null?33:S.tt,n=t?S.tas%t:S.tas,lap=t?Math.floor(S.tas/t):0,f=t?n/t:0;
  h+='<button class="big" data-tas="1">'+ring(260,7,f,'var(--gold)','var(--line)')+'<span class="n"><b>'+an(n)+'</b><small>'+(t?'من '+an(t):'')+'</small></span></button><div class="seg sm">'+[33,99,100,0].map(function(x){return '<button data-tt="'+x+'" class="'+(t===x?'on':'')+'">'+(x?an(x):'حر')+'</button>'}).join('')+'</div><div class="tot">الإجمالي '+an(S.tas)+(lap?' · '+an(lap)+' دورة':'')+'</div><button class="btn o" data-tasr="1" style="display:flex;gap:8px;align-items:center">'+IC('reset',18)+'تصفير</button>'}
 else{var c=getC(m),txt=m==='ist'?'أَسْتَغْفِرُ اللَّهَ':'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ';
  h+='<div class="ctxt">'+txt+'</div><button class="big" data-ctrm="'+m+'">'+ring(260,7,c.n/c.g,c.n>=c.g?'var(--acc2)':'var(--gold)','var(--line)')+'<span class="n"><b>'+an(c.n)+'</b><small>الهدف '+an(c.g)+'</small></span></button><div class="seg sm">'+[33,100,300,1000].map(function(x){return '<button data-goal="'+x+'" class="'+(c.g===x?'on':'')+'">'+an(x)+'</button>'}).join('')+'</div><div class="tot">'+(c.n>=c.g?'ما شاء الله، حققت هدف اليوم':'باقي '+an(c.g-c.n)+' لهدف اليوم')+'</div><button class="btn o" data-ctrr="'+m+'" style="display:flex;gap:8px;align-items:center">'+IC('reset',18)+'تصفير اليوم</button>'}
 return h+'</div>'}
function statView(){var st=streaks(),days=['ح','ن','ث','ر','خ','ج','س'],bars=[],mx=1,i,t=new Date();
 for(i=6;i>=0;i--){var d=new Date();d.setDate(t.getDate()-i);var h=S.hist[dkey(d)]||{n:0,d:false};bars.push({l:days[d.getDay()],n:h.n,d:h.d,t:i===0});if(h.n>mx)mx=h.n}
 var mp=catProg('morning'),ep=catProg('evening'),I=getC('ist'),Sa=getC('sal');
 var h='<h1 class="h1">إنجازك</h1><p class="sub" style="margin-bottom:18px">استمرارك أهم من الكثرة</p>';
 h+='<div class="hero"><div class="k">'+IC('flame',18)+'أيام متواصلة</div><h2 style="font-size:54px;margin:2px 0">'+an(st.cur)+'</h2><p>أطول سلسلة: '+an(st.best)+' · اليوم يُحتسب لما تُتمّ أذكار الصباح أو المساء</p></div>';
 h+='<div class="sec">آخر ٧ أيام</div><div class="card2"><div class="bars">'+bars.map(function(b){return '<div class="bc"><div class="bv'+(b.t?' tn':'')+'" style="height:'+Math.max(6,Math.round(b.n/mx*100))+'px"></div><small>'+an(b.n)+'</small><i class="'+(b.d?'dn':'')+'">'+b.l+'</i></div>'}).join('')+'</div></div>';
 h+='<div class="chips"><div class="chip"><span class="ci">'+IC('beads',22)+'</span><b>'+an(S.total)+'</b><small>إجمالي الأذكار</small></div><div class="chip"><span class="ci">'+IC('check',22)+'</span><b>'+an(Object.keys(S.hist).filter(function(k){return S.hist[k].d}).length)+'</b><small>أيام مكتملة</small></div></div>';
 h+='<div class="sec">اليوم</div><div class="list">'+[['sunrise','أذكار الصباح',mp.done,mp.n],['sunset','أذكار المساء',ep.done,ep.n],['moon','الاستغفار',I.n,I.g],['mosque','الصلاة على النبي ﷺ',Sa.n,Sa.g]].map(function(x){var f=x[3]?x[2]/x[3]:0;return '<div class="it" style="cursor:default"><div class="ib">'+IC(x[0],22)+'</div><div class="t"><b>'+x[1]+'</b><span>'+an(x[2])+' / '+an(x[3])+'</span></div><div class="e"><span class="mini rg" style="width:30px;height:30px">'+ring(30,3,f,'var(--acc2)','var(--line)')+'</span></div></div>'}).join('')+'</div>';return h}
function sizeFor(t){var n=t.length,b=S.fs;return n>420?Math.min(b,21):n>260?Math.min(b,24):n>150?Math.min(b,27):b}
function readView(){var l=list(view.id),c=catById(view.id);
 if(view.i>=l.length){return '<div class="scr rd"><div class="rtop"><button class="cb" data-home="1">'+IC('next',20)+'</button><h3>'+c.n+'</h3><span style="width:42px"></span></div><div class="fin"><div class="ck"><svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.8 10 17.5 19 7"/></svg></div><h2>تقبّل الله منك</h2><p>أتممت '+c.n+'</p><div class="row" style="display:flex;gap:10px;justify-content:center"><button class="btn o" data-again="1">من البداية</button><button class="btn" data-home="1">الرئيسية</button></div></div></div>'}
 var d=l[view.i],n=cnt(view.id,d.id),done=n>=d.k,f=n/d.k;
 var segs=l.map(function(x,j){var dn=cnt(view.id,x.id)>=x.k;return '<i class="'+(dn?'d':j===view.i?'c':'')+'"></i>'}).join('');
 return '<div class="scr rd"><div class="rtop"><button class="cb" data-home="1">'+IC('next',20)+'</button><h3>'+c.n+' · '+an(view.i+1)+'/'+an(l.length)+'</h3><button class="cb" data-share="'+d.id+'">'+IC('share',19)+'</button><button class="cb'+(S.fav[d.id]?' on':'')+'" data-fav="'+d.id+'">'+IC('heart',20)+'</button></div><div class="segs">'+segs+'</div>'+
 '<div class="rbody" data-tapzone="1"><div class="pcard" data-d="'+d.id+'"><div class="tx" style="font-size:'+sizeFor(d.t)+'px">'+esc(d.t)+'</div>'+(d.s?'<div class="src">'+esc(d.s)+'</div>':'')+(d.h?'<div class="fd">'+esc(d.h)+'</div>':'')+'</div></div>'+
 '<div class="dock"><button class="cb nv" data-nav="-1" '+(view.i<=0?'disabled':'')+'>'+IC('next',22)+'</button><button class="ctr'+(done?' dn':'')+'" data-ctr="1">'+ring(132,6,f,'var(--acc2)','var(--line)')+'<span class="n"><b>'+(done?IC('check',34):an(d.k-n))+'</b><small>'+(d.k>1?'من '+an(d.k):'مرة')+'</small></span></button><button class="cb nv" data-nav="1" '+(view.i>=l.length?'disabled':'')+'>'+IC('chev',22)+'</button></div></div>'}
function row(ic,t,ctl){return '<label><span class="l"><span class="ib">'+IC(ic,18)+'</span>'+t+'</span>'+ctl+'</label>'}
function sw(k,v){return '<input type="checkbox" class="sw" data-k="'+k+'" '+(v?'checked':'')+'>'}
function setView(){var iv=S.iv;
 return '<h1 class="h1">الإعدادات</h1><p class="sub" style="margin-bottom:20px">التذكيرات والمظهر</p>'+
 '<div class="sec">التذكيرات</div><div class="list st">'+row('sunrise','أذكار الصباح',sw('m.on',S.m.on))+row('clock','الوقت','<input type="time" data-k="m.t" value="'+S.m.t+'">')+row('sunset','أذكار المساء',sw('e.on',S.e.on))+row('clock','الوقت','<input type="time" data-k="e.t" value="'+S.e.t+'">')+row('mosque','تذكير بعد كل صلاة',sw('pr.on',S.pr.on))+'</div>'+
 '<div class="sec">ذكر كل فترة</div><div class="list st">'+row('bell','تفعيل',sw('iv.on',iv.on))+row('clock','كل','<select data-k="iv.min">'+[1,5,10,15,20,30,45,60,90,120].map(function(m){return '<option value="'+m+'"'+(iv.min==m?' selected':'')+'>'+an(m)+' دقيقة</option>'}).join('')+'</select>')+row('sun','من','<input type="time" data-k="iv.from" value="'+iv.from+'">')+row('moon','إلى','<input type="time" data-k="iv.to" value="'+iv.to+'">')+'</div>'+
 '<div class="list st"><button class="it" data-perm="1"><div class="ib">'+IC('bell',22)+'</div><div class="t"><b>السماح بالإشعارات</b><span id="pst">'+permTxt()+'</span></div></button><button class="it" data-test="1"><div class="ib">'+IC('check',22)+'</div><div class="t"><b>جرّب إشعار الآن</b></div></button></div>'+
 '<p class="note">الإشعارات بتوصل والتطبيق مفتوح. على الآيفون، أضف التطبيق للشاشة الرئيسية الأول.</p>'+
 '<div class="sec">المدينة</div><div class="list st">'+row('pin','مواقيت الصلاة','<select data-city="1">'+CITIES.map(function(x){return '<option value="'+x[0]+'"'+(x[0]===S.city?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select>')+'</div>'+
 '<div class="sec">المظهر</div><div class="list st">'+row('moon','الوضع الليلي',sw('dark',S.dark))+row('type','حجم الخط','<input type="range" min="22" max="40" value="'+S.fs+'" data-k="fs">')+'</div>'+
 '<p class="note" style="text-align:center;margin-top:0">© Hazem Saleh</p>'}
function permTxt(){if(!('Notification' in window))return 'غير متاحة هنا، أضف التطبيق للشاشة الرئيسية';return {granted:'مفعّلة',denied:'مرفوضة، فعّلها من إعدادات الآيفون',default:'لسه ماتفعّلتش'}[Notification.permission]}
function cd(){var e=document.querySelectorAll('[data-cd]');if(!e.length)return;var n=nextPrayer();e.forEach(function(x){x.textContent=fmtLeft(n.left)})}
setInterval(function(){if(view.t==='home'||view.t==='pray')cd()},20000);
function advance(){view.i++;render()}
/* ---- share card ---- */
function wrapLines(ctx,text,maxW){var out=[];text.split('\n').forEach(function(par){var w=par.split(/\s+/),line='';w.forEach(function(x){var t=line?line+' '+x:x;if(ctx.measureText(t).width>maxW&&line){out.push(line);line=x}else line=t});if(line)out.push(line)});return out}
function drawCard(d){var W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;var x=cv.getContext('2d');
 var g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#0c3a31');g.addColorStop(.6,'#17614f');g.addColorStop(1,'#1f7a64');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.fillStyle='rgba(8,40,33,.55)';x.beginPath();x.roundRect?x.roundRect(70,110,W-140,H-220,60):x.rect(70,110,W-140,H-220);x.fill();
 x.strokeStyle='#d8b468';x.globalAlpha=.8;x.lineWidth=3;x.beginPath();x.moveTo(W/2-120,200);x.lineTo(W/2-18,200);x.moveTo(W/2+18,200);x.lineTo(W/2+120,200);x.stroke();x.beginPath();x.arc(W/2,200,8,0,7);x.stroke();x.globalAlpha=1;
 x.direction='rtl';x.textAlign='center';x.fillStyle='#fff';var size=72,lines,maxH=760;
 for(;size>=28;size-=2){x.font='400 '+size+'px Amiri, serif';lines=wrapLines(x,d.t,W-260);if(lines.length*size*1.95<=maxH)break}
 var lh=size*1.95,y0=260+(maxH-lines.length*lh)/2+lh*.7;lines.forEach(function(l,i){x.fillText(l,W/2,y0+i*lh)});
 x.font='400 34px "IBM Plex Sans Arabic", sans-serif';x.fillStyle='rgba(255,255,255,.7)';if(d.s){var sl=wrapLines(x,d.s.length>90?d.s.slice(0,90)+'…':d.s,W-300);sl.slice(0,2).forEach(function(l,i){x.fillText(l,W/2,1075+i*46)})}
 x.font='500 32px "IBM Plex Sans Arabic", sans-serif';x.fillStyle='#d8b468';x.fillText('أذكار',W/2,1185);
 return cv}
function openShare(d){var ov=document.createElement('div');ov.className='ov';ov.innerHTML='<div class="sh"><div class="shi"><div class="empty" style="padding:60px 0">جاري تجهيز البطاقة…</div></div><div class="row2"><button class="btn" data-do="share">مشاركة</button><button class="btn o" data-do="save">حفظ الصورة</button><button class="btn o" data-do="txt">نسخ النص</button></div><button class="cl" data-do="close">إغلاق</button></div>';document.body.appendChild(ov);
 var blob=null;
 var go=function(){var cv=drawCard(d);cv.toBlob(function(b){blob=b;var u=URL.createObjectURL(b);ov.querySelector('.shi').innerHTML='<img src="'+u+'">'},'image/png')};
 (document.fonts&&document.fonts.load?Promise.all([document.fonts.load('48px Amiri'),document.fonts.load('32px "IBM Plex Sans Arabic"')]):Promise.resolve()).then(go,go);
 ov.onclick=function(e){var a=e.target.getAttribute&&e.target.getAttribute('data-do');if(e.target===ov||a==='close'){ov.remove();return}
  if(a==='txt'){var t=d.t+(d.s?'\n['+d.s+']':'');if(navigator.clipboard){navigator.clipboard.writeText(t);toast('تم النسخ')}}
  if(!blob)return;
  if(a==='share'){var f=new File([blob],'dhikr.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f]}).catch(function(){});else if(navigator.share)navigator.share({text:d.t}).catch(function(){});else toast('استخدم حفظ الصورة')}
  if(a==='save'){var l=document.createElement('a');l.href=URL.createObjectURL(blob);l.download='dhikr.png';document.body.appendChild(l);l.click();l.remove()}}}
window.__share=openShare;
function bind(){
 document.querySelectorAll('.tabs button').forEach(function(b){b.onclick=function(){view={t:b.dataset.t};render()}});
 document.querySelectorAll('[data-read]').forEach(function(b){b.onclick=function(){var c=b.dataset.read,l=list(c),i=0;for(;i<l.length;i++)if(cnt(c,l[i].id)<l[i].k)break;view={t:'read',id:c,i:i>=l.length?0:i};render()}});
 document.querySelectorAll('[data-home]').forEach(function(b){b.onclick=function(){view={t:'home'};render()}});
 var gp=document.querySelector('[data-gopray]');if(gp)gp.onclick=function(){view={t:'pray'};render()};
 var ag=document.querySelector('[data-again]');if(ag)ag.onclick=function(){var p=dayP();Object.keys(p).forEach(function(k){if(k.indexOf(view.id+'|')===0)delete p[k]});save();view.i=0;render()};
 document.querySelectorAll('[data-nav]').forEach(function(b){b.onclick=function(){view.i=Math.max(0,view.i+ +b.dataset.nav);render()}});
 var tap=function(){var l=list(view.id),d=l[view.i],p=dayP(),k=view.id+'|'+d.id;if((p[k]||0)>=d.k)return;p[k]=(p[k]||0)+1;recordCount(1);save();if(navigator.vibrate)navigator.vibrate(12);
  var done=p[k]>=d.k,c=document.querySelector('.ctr');c.classList.remove('pulse');void c.offsetWidth;c.classList.add('pulse');
  var pr=c.querySelector('.pr'),r=+pr.getAttribute('r'),C=2*Math.PI*r;pr.setAttribute('stroke-dashoffset',C*(1-p[k]/d.k));
  if(done){c.classList.add('dn');c.querySelector('b').innerHTML=IC('check',34);if(navigator.vibrate)navigator.vibrate([20,40,20]);setTimeout(advance,650)}else c.querySelector('b').textContent=an(d.k-p[k])};
 var ct=document.querySelector('[data-ctr]');if(ct)ct.onclick=function(e){e.stopPropagation();tap()};
 var tz=document.querySelector('[data-tapzone]');if(tz)tz.onclick=function(e){if(!e.target.closest('button'))tap()};
 document.querySelectorAll('[data-fav]').forEach(function(b){b.onclick=function(){var id=+b.dataset.fav;S.fav[id]=!S.fav[id];if(!S.fav[id])delete S.fav[id];save();render()}});
 document.querySelectorAll('[data-share]').forEach(function(b){b.onclick=function(){openShare(DH[+b.dataset.share])}});
 var tb=document.querySelector('[data-tas]');if(tb)tb.onclick=function(){S.tas++;recordCount(1);save();if(navigator.vibrate)navigator.vibrate(S.tt&&S.tas%S.tt===0?[30,50,30]:8);render()};
 var tr=document.querySelector('[data-tasr]');if(tr)tr.onclick=function(){S.tas=0;save();render()};
 document.querySelectorAll('[data-tt]').forEach(function(b){b.onclick=function(){S.tt=+b.dataset.tt;save();render()}});
 document.querySelectorAll('[data-tm]').forEach(function(b){b.onclick=function(){S.tm=b.dataset.tm;save();render()}});
 var cm=document.querySelector('[data-ctrm]');if(cm)cm.onclick=function(){var c=getC(cm.dataset.ctrm);var was=c.n>=c.g;c.n++;recordCount(1);save();if(navigator.vibrate)navigator.vibrate(c.n===c.g?[30,50,30]:8);if(c.n===c.g&&!was)toast('ما شاء الله، حققت هدف اليوم');render()};
 document.querySelectorAll('[data-goal]').forEach(function(b){b.onclick=function(){getC(S.tm).g=+b.dataset.goal;save();render()}});
 var cr=document.querySelector('[data-ctrr]');if(cr)cr.onclick=function(){getC(cr.dataset.ctrr).n=0;save();render()};
 document.querySelectorAll('[data-city]').forEach(function(s){s.onchange=function(){S.city=s.value;save();render()}});
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
 if(S.pr.on){var P=ptoday(),lp=lastPrayer();if(lp&&lp.ago<=4&&!S.fired[k]['p'+lp.k]){S.fired[k]['p'+lp.k]=1;save();notify('أذكار بعد الصلاة','حان وقت أذكار بعد صلاة '+lp.n)}}
 var iv=S.iv;if(iv.on){var inW=m>=mins(iv.from)&&m<=mins(iv.to);
  if(!S.next)S.next=Date.now()+iv.min*6e4;
  if(inW&&Date.now()>=S.next){var d=POOL[Math.floor(Math.random()*POOL.length)];S.next=Date.now()+iv.min*6e4;save();notify('ذكر',d.t)}
  else if(!inW&&Date.now()>=S.next){S.next=Date.now()+iv.min*6e4;save()}}}
setInterval(tick,15000);document.addEventListener('visibilitychange',function(){if(!document.hidden)tick()});
['gesturestart','gesturechange','gestureend'].forEach(function(n){document.addEventListener(n,function(e){e.preventDefault()},{passive:false})});document.addEventListener('touchmove',function(e){if(e.touches.length>1)e.preventDefault()},{passive:false});
window.__adhkar={tick:tick,S:S,notify:notify};
render();tick();
})();
