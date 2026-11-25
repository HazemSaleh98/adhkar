var IC=(function(){var P={
sunrise:'<path d="M4 18h16M7 18a5 5 0 0 1 10 0M12 6v3M4.9 10.9l1.8 1.8M19.1 10.9l-1.8 1.8M2 14h2M20 14h2"/><path d="M9.5 6.5 12 4l2.5 2.5"/>',
sunset:'<path d="M4 18h16M7 18a5 5 0 0 1 10 0M12 3v6M4.9 10.9l1.8 1.8M19.1 10.9l-1.8 1.8M2 14h2M20 14h2"/><path d="M9.5 6.5 12 9l2.5-2.5"/>',
mosque:'<path d="M4 21v-7c0-3.6 3.2-6.2 8-8.5 4.8 2.3 8 4.9 8 8.5v7M2.5 21h19M10 21v-3.5a2 2 0 0 1 4 0V21M12 3.5V2M10.6 2.9a1.6 1.6 0 1 0 2.6 1"/>',
moon:'<path d="M20 14.2A8 8 0 1 1 9.8 4a6.4 6.4 0 0 0 10.2 10.2z"/><path d="M17 4v3M15.5 5.5h3"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>',
book:'<path d="M12 6.5C10.5 5 8 4.5 4.5 4.7v13.6c3.5-.2 6 .3 7.5 1.7 1.5-1.4 4-1.9 7.5-1.7V4.7C16 4.5 13.5 5 12 6.5zM12 6.5V20"/>',
beads:'<circle cx="12" cy="4.5" r="1.7"/><circle cx="17.2" cy="6.5" r="1.7"/><circle cx="19.4" cy="11.5" r="1.7"/><circle cx="17.8" cy="16.7" r="1.7"/><circle cx="6.8" cy="6.5" r="1.7"/><circle cx="4.6" cy="11.5" r="1.7"/><circle cx="6.2" cy="16.7" r="1.7"/><path d="M12 19.5v2.5M10.6 20.2h2.8"/>',
home:'<path d="M3.5 11 12 3.5l8.5 7.5M5.5 9.5V20h4.5v-5.5h4V20h4.5V9.5"/>',
heart:'<path d="M12 20.5S3.5 15.4 3.5 9.4A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 8.5 1.8c0 6-8.5 11.1-8.5 11.1z"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>',
share:'<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12.5V20h14v-7.5"/>',
chev:'<path d="M14.5 5.5 8 12l6.5 6.5"/>',
next:'<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
check:'<path d="M5 12.8 10 17.5 19 7"/>',
bell:'<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 21a2 2 0 0 0 4 0"/>',
reset:'<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5M4 4v4.5h4.5"/>',
clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
type:'<path d="M4 18 9 5l5 13M5.8 14h6.4M15.5 18l3-8 2.5 8M16.6 15.5h3.8"/>',
copy:'<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6A2.5 2.5 0 0 0 13 3.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>'};
return function(n,s,c){return '<svg class="i '+(c||'')+'" width="'+(s||24)+'" height="'+(s||24)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+P[n]+'</svg>'}})();
var CATIC={morning:'sunrise',evening:'sunset',prayer:'mosque',sleep:'moon',wake:'sun',daily:'book',tasbih:'beads'};
