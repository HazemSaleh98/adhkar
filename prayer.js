/* Prayer times: astronomical algorithm and calculation methods from praytimes.org (docs/calculation, docs/methods). Offline, no keys. */
var PT=(function(){
var d2r=Math.PI/180,r2d=180/Math.PI;
function sin(d){return Math.sin(d*d2r)}function cos(d){return Math.cos(d*d2r)}function tan(d){return Math.tan(d*d2r)}
function asin(x){return r2d*Math.asin(x)}function acos(x){return r2d*Math.acos(x)}function atan2(y,x){return r2d*Math.atan2(y,x)}function acot(x){return r2d*Math.atan(1/x)}
function fa(a){a=a-360*Math.floor(a/360);return a<0?a+360:a}function fh(h){h=h-24*Math.floor(h/24);return h<0?h+24:h}
var METHODS={egypt:{n:'الهيئة المصرية العامة للمساحة',f:19.5,i:17.5},makkah:{n:'جامعة أم القرى، مكة المكرمة',f:18.5,i:'90 min'},mwl:{n:'رابطة العالم الإسلامي',f:18,i:17},isna:{n:'الجمعية الإسلامية لأمريكا الشمالية',f:15,i:15}};
function julian(y,m,d){if(m<=2){y-=1;m+=12}var A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
function sunPos(jd){var D=jd-2451545.0,g=fa(357.529+0.98560028*D),q=fa(280.459+0.98564736*D),L=fa(q+1.915*sin(g)+0.020*sin(2*g)),e=23.439-0.00000036*D,RA=atan2(cos(e)*sin(L),cos(L))/15;return{decl:asin(sin(e)*sin(L)),eqt:q/15-fh(RA)}}
function offset(tz,y,m,d){try{var dt=new Date(Date.UTC(y,m-1,d,12)),p=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric'}).formatToParts(dt),o={};p.forEach(function(x){o[x.type]=+x.value});var l=Date.UTC(o.year,o.month-1,o.day,o.hour,o.minute);return (l-dt.getTime())/36e5}catch(e){return -new Date(y,m-1,d).getTimezoneOffset()/60}}
function calc(y,m,d,lat,lon,tz,method){var M=METHODS[method]||METHODS.mwl,jd=julian(y,m,d)-lon/(15*24),tzo=offset(tz,y,m,d);
 function mid(t){return fh(12-sunPos(jd+t).eqt)}
 function ang(a,t,ccw){var dc=sunPos(jd+t).decl,n=mid(t),v=1/15*acos((-sin(a)-sin(dc)*sin(lat))/(cos(dc)*cos(lat)));return n+(ccw?-v:v)}
 function asr(t){var dc=sunPos(jd+t).decl;return ang(-acot(1+tan(Math.abs(lat-dc))),t)}
 var t={fajr:5/24,sunrise:6/24,dhuhr:.5,asr:13/24,sunset:18/24,isha:18/24},r={};
 for(var k=0;k<2;k++){
  r.fajr=ang(M.f,t.fajr,true);r.sunrise=ang(0.833,t.sunrise,true);r.dhuhr=mid(t.dhuhr);r.asr=asr(t.asr);r.maghrib=ang(0.833,t.sunset);
  r.isha=typeof M.i==='string'?r.maghrib+parseFloat(M.i)/60:ang(M.i,t.isha);
  Object.keys(r).forEach(function(n){t[n==='maghrib'?'sunset':n]=r[n]/24})}
 Object.keys(r).forEach(function(n){r[n]=fh(r[n]+tzo-lon/15)});
 var o={};Object.keys(r).forEach(function(n){o[n]=Math.round(r[n]*60)});return {t:o,method:M.n,tzo:tzo}}
function nowIn(tz){try{var p=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'}).formatToParts(new Date()),o={};p.forEach(function(x){o[x.type]=+x.value});return {y:o.year,m:o.month,d:o.day,min:o.hour*60+o.minute+o.second/60}}catch(e){var n=new Date();return {y:n.getFullYear(),m:n.getMonth()+1,d:n.getDate(),min:n.getHours()*60+n.getMinutes()+n.getSeconds()/60}}}
return {calc:calc,nowIn:nowIn,METHODS:METHODS}})();
var CITIES=[
['cairo','القاهرة',30.0444,31.2357,'Africa/Cairo','egypt'],['giza','الجيزة',30.0131,31.2089,'Africa/Cairo','egypt'],['alex','الإسكندرية',31.2001,29.9187,'Africa/Cairo','egypt'],['mansoura','المنصورة',31.0409,31.3785,'Africa/Cairo','egypt'],['tanta','طنطا',30.7865,31.0004,'Africa/Cairo','egypt'],['zagazig','الزقازيق',30.5877,31.5019,'Africa/Cairo','egypt'],['portsaid','بورسعيد',31.2653,32.3019,'Africa/Cairo','egypt'],['suez','السويس',29.9668,32.5498,'Africa/Cairo','egypt'],['ismailia','الإسماعيلية',30.5965,32.2715,'Africa/Cairo','egypt'],['damietta','دمياط',31.4165,31.8133,'Africa/Cairo','egypt'],['kafr','كفر الشيخ',31.1107,30.9388,'Africa/Cairo','egypt'],['fayoum','الفيوم',29.3084,30.8428,'Africa/Cairo','egypt'],['beni','بني سويف',29.0661,31.0994,'Africa/Cairo','egypt'],['minya','المنيا',28.1099,30.7503,'Africa/Cairo','egypt'],['assiut','أسيوط',27.1783,31.1859,'Africa/Cairo','egypt'],['sohag','سوهاج',26.5591,31.6948,'Africa/Cairo','egypt'],['luxor','الأقصر',25.6872,32.6396,'Africa/Cairo','egypt'],['aswan','أسوان',24.0889,32.8998,'Africa/Cairo','egypt'],['hurghada','الغردقة',27.2579,33.8116,'Africa/Cairo','egypt'],['sharm','شرم الشيخ',27.9158,34.33,'Africa/Cairo','egypt'],
['makkah','مكة المكرمة',21.3891,39.8579,'Asia/Riyadh','makkah'],['madinah','المدينة المنورة',24.4672,39.6024,'Asia/Riyadh','makkah'],['riyadh','الرياض',24.7136,46.6753,'Asia/Riyadh','makkah'],['dubai','دبي',25.2048,55.2708,'Asia/Dubai','makkah'],['kuwait','الكويت',29.3759,47.9774,'Asia/Kuwait','makkah'],['doha','الدوحة',25.2854,51.531,'Asia/Qatar','makkah'],
['amman','عمّان',31.9454,35.9284,'Asia/Amman','mwl'],['beirut','بيروت',33.8938,35.5018,'Asia/Beirut','egypt'],['baghdad','بغداد',33.3152,44.3661,'Asia/Baghdad','mwl'],['london','لندن',51.5072,-0.1276,'Europe/London','mwl'],['ny','نيويورك',40.7128,-74.006,'America/New_York','isna']];
