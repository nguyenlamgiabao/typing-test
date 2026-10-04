/* ===== Typo Souls - Chúa Tể Gõ Sai ===== */
(()=>{
const g=$('ghid'),EXT=['png','webp','jpg','gif'],CACHE={};
const probe=n=>CACHE[n]||(CACHE[n]=new Promise(r=>{let i=0;(function t(){if(i>=EXT.length)return r(null);const u='images/'+n+'.'+EXT[i++],m=new Image();m.onload=()=>r(u);m.onerror=t;m.src=u})()}));
async function spr(el,base,state){let u=state&&await probe(base+'_'+state);if(!u)u=await probe(base);el.style.backgroundImage=u?'url("'+u+'")':'';el.classList.toggle('blank',!u)}
const fx=(el,c,ms)=>{el.classList.remove(c);void el.offsetWidth;el.classList.add(c);setTimeout(()=>el.classList.remove(c),ms||600)};
const BOSS=[
 {n:'Gã Caps Lock Điên',t:'kẻ chưa bao giờ tắt Caps Lock',hp:100,len:[5,6],pc:.55,gap:1.6,dmg:18},
 {n:'Bà Chúa Dấu Hỏi Ngã',t:'hỏi hay ngã, bà cũng đập',hp:140,len:[6,7],pc:.48,gap:1.3,dmg:20},
 {n:'Hiệp Sĩ Phím Dính Cơm',t:'giáp làm từ cơm nguội',hp:190,len:[7,9],pc:.42,gap:1.0,dmg:23},
 {n:'Chúa Tể Gõ Sai',t:'Ctrl+Z cũng không cứu nổi bạn',hp:260,len:[9,12],pc:.37,gap:.8,dmg:26}];
const ATK=['Chém Ngang Ba Hoa','Đập Búa Deadline','Phóng Cầu Lửa Bug','Nện Đít Syntax Error','Quét Sàn Null Pointer','Hú Tiếng Sét Wifi Yếu'];
const LO='abcdefghjkmnpqrstuvwxyz',UP='ABCDEFGHJKLMNPQRSTUVWXYZ',DG='23456789',SP='!@#$%^&*()-_=+[]{};:,.?/<>~';
const pick=s=>s[Math.random()*s.length|0],esc=c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]||c);
function gen(n,l){ // càng về sau càng nhiều loại ký tự; luôn đủ mọi loại cần thiết
 const pool=[LO+UP,LO+UP+DG,LO+UP+DG+SP,LO+UP+DG+SP][l],need=[[UP],[UP,DG],[UP,SP],[UP,DG,SP]][l];
 const s=Array.from({length:n},()=>pick(pool)),idx=s.map((_,i)=>i).sort(()=>Math.random()-.5);
 need.forEach((c,k)=>s[idx[k]]=pick(c));return s.join('');
}
let S='off',bi=0,hp=100,bhp=100,cur='',kind='dodge',dl=0,ts=0,raf=0,tm=0,stat={d:0,p:0,h:0};
const bs=()=>$('gBoss'),me=()=>$('gMe');
function msg(t,c){const m=$('gMsg');m.textContent=t;m.className='sg-msg '+(c||'')}
function bars(){$('gMeHp').style.width=hp+'%';$('gBossHp').style.width=Math.max(0,bhp)/BOSS[bi].hp*100+'%'}
function paint(k){$('gStr').innerHTML=[...cur].map((c,i)=>'<i class="k'+(i<k?' ok':i===k?' cur':'')+'">'+esc(c)+'</i>').join('')}
function idle(){spr(me(),'player');spr(bs(),'boss'+(bi+1))}
function over(t,d,win,btn){S='dead';const o=$('gOver');o.classList.toggle('win',!!win);o.classList.add('show');$('gOT').textContent=t;$('gOD').textContent=d;$('gGo').textContent=btn}
function start(){
 clearTimeout(tm);cancelAnimationFrame(raf);
 hp=100;bi=0;stat={d:0,p:0,h:0};$('gOver').classList.remove('show');spr($('gBg'),'bg');loadBoss();
}
function loadBoss(){
 const b=BOSS[bi];bhp=b.hp;$('gName').textContent='Boss '+(bi+1)+'/'+BOSS.length+' · '+b.n+' - '+b.t;
 bs().classList.remove('dead');idle();bars();$('gStr').textContent='';$('gKind').textContent='Chuẩn bị...';$('gKind').className='sg-kind';$('gTime').style.width='0';
 msg(b.n+' xuất hiện!');S='idle';g.value='';g.focus();tm=setTimeout(attack,1800);
}
function attack(){
 if(S!=='idle')return;
 const b=BOSS[bi];kind=Math.random()<.4?'parry':'dodge';
 const n=(b.len[0]+Math.random()*(b.len[1]-b.len[0]+1)|0)+(kind==='parry'?3:0);
 cur=gen(n,bi);g.value='';S='wind';ts=performance.now();dl=ts+(1.3+n*b.pc)*(kind==='parry'?.95:1)*1000;
 $('gKind').textContent=(kind==='parry'?'🛡 ĐỠ ĐÒN (Parry): ':'🌀 NÉ ĐÒN (Dodge Roll): ')+pick(ATK)+'!';
 $('gKind').className='sg-kind '+kind;msg('');paint(0);
 spr(bs(),'boss'+(bi+1),'attack');bs().classList.add('wind');loop();
}
function loop(){
 if(S!=='wind')return;
 const now=performance.now();$('gTime').style.width=Math.max(0,(dl-now)/(dl-ts))*100+'%';
 if(now>=dl)return fail('Chậm như rùa! Đòn đã trúng.');
 raf=requestAnimationFrame(loop);
}
function end(){cancelAnimationFrame(raf);bs().classList.remove('wind');g.value=''}
function success(){
 end();S='idle';const b=BOSS[bi];
 if(kind==='parry'){stat.p++;bhp-=b.hp*.28;fx(me(),'parry');fx(bs(),'stagger');spr(me(),'player','parry');msg('PARRY! Phản đòn cực mạnh!','good')}
 else{stat.d++;bhp-=b.hp*.08;fx(me(),'roll');spr(me(),'player','dodge');msg('Né đẹp! Lăn một vòng.','good')}
 spr(bs(),'boss'+(bi+1),'hurt');sfx('key');bars();$('gKind').textContent='';
 setTimeout(idle,650);
 if(bhp<=0)return setTimeout(down,700);
 tm=setTimeout(attack,b.gap*1000);
}
function fail(why){
 end();S='idle';const b=BOSS[bi],d=Math.round(b.dmg*(kind==='parry'?1.4:1));
 hp=Math.max(0,hp-d);stat.h++;fx(me(),'hurt');fx($('sg'),'shake',400);spr(me(),'player','hurt');
 msg(why+' -'+d+' HP','bad');sfx('err');bars();setTimeout(idle,650);
 if(hp<=0)return setTimeout(die,800);
 tm=setTimeout(attack,b.gap*1000+500);
}
function down(){
 bs().classList.add('dead');sfx('end');
 if(bi===BOSS.length-1)return setTimeout(()=>over('✦ CHÚA TỂ ĐÃ NGÃ XUỐNG ✦','Bạn đã hạ cả '+BOSS.length+' boss! Né '+stat.d+' · Đỡ '+stat.p+' · Dính đòn '+stat.h,1,'Chơi lại (Enter)'),1400);
 msg(BOSS[bi].n+' đã bị hạ! Hồi 40 HP.','good');hp=Math.min(100,hp+40);bi++;tm=setTimeout(loadBoss,2400);
}
function die(){end();spr(me(),'player','dead');over('BẠN ĐÃ GÕ SAI','Gục trước '+BOSS[bi].n+' (boss '+(bi+1)+'/'+BOSS.length+'). Né '+stat.d+' · Đỡ '+stat.p+' · Dính đòn '+stat.h,0,'Thử lại (Enter)')}
g.addEventListener('input',()=>{
 if(S!=='wind')return;
 const t=g.value;
 if(!cur.startsWith(t)){
  const c=t[t.length-1],e=cur[t.length-1];
  return fail(c&&e&&c!==e&&c.toLowerCase()===e.toLowerCase()&&c.toUpperCase()===e.toUpperCase()?'Caps Lock hả?!':'Gõ sai ký tự "'+c+'" (cần "'+e+'").');
 }
 paint(t.length);if(t.length===cur.length)success();
});
g.addEventListener('keydown',e=>{if(e.key==='Backspace'||e.key==='Delete'||e.key.startsWith('Arrow'))e.preventDefault()});
$('gGo').onclick=start;
window.addEventListener('keydown',e=>{
 if(mode!=='game'||(e.target.closest&&e.target.closest('.panel')))return;
 if(e.key==='Enter'&&$('gOver').classList.contains('show')){e.preventDefault();return start()}
 if(document.activeElement!==g&&!e.ctrlKey&&!e.metaKey&&!e.altKey)g.focus();
});
$('sg').addEventListener('click',()=>g.focus());
function setMode(m){
 mode=m;$('typeView').hidden=m!=='type';$('gameView').hidden=m!=='game';
 document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('on',b.dataset.mode===m));
 if(m==='game'){clearInterval(timer);S='off';clearTimeout(tm);cancelAnimationFrame(raf);
  $('gOT').textContent='TYPO SOULS';$('gOD').textContent='Chúa Tể Gõ Sai đang chờ bạn. Nhớ tắt bộ gõ tiếng Việt!';$('gGo').textContent='Bắt đầu (Enter)';$('gOver').className='sg-over show';
  spr($('gBg'),'bg');spr(bs(),'boss1');spr(me(),'player');$('gName').textContent='';g.focus()}
 else{S='off';clearTimeout(tm);cancelAnimationFrame(raf);reset()}
}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
})();
