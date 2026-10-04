const $=id=>document.getElementById(id);
const hid=$('hid'),words=$('words'),box=$('box');
const EXTRA=8;   // tối đa số ký tự gõ lố thêm cho mỗi từ
let mode='type',endless=false,lang='vi',W=[],started=false,ended=false,t0=0,timer=null,dur=30,
composing=false,prevLen=0,prevSt=[],prevTW=new Set(),prevMW=new Set(),keys=0,errN=0,lastGrow=0,ebt={},errs={},kinds={dau:0,chu:0},cum=[],okNow=0,lastV=[],rendered=0;
/* ---- phân tích ký tự tiếng Việt: chữ gốc + mũ/móc + dấu thanh ---- */
const TONES={'\u0300':1,'\u0301':2,'\u0309':3,'\u0303':4,'\u0323':5},MODS={'\u0302':'^','\u0306':'(','\u031B':'+'},DC={};
function dec(ch){
 if(DC[ch])return DC[ch];
 let b,m='',t=0;
 if(ch==='đ'||ch==='Đ'){b=ch==='đ'?'d':'D';m='-'}
 else{const n=ch.normalize('NFD');b=n[0];for(const x of n.slice(1)){if(TONES[x])t=TONES[x];else if(MODS[x])m+=MODS[x]}}
 return DC[ch]={b,m,t};
}
const unTone=ch=>ch.normalize('NFD').replace(/[\u0300\u0301\u0309\u0303\u0323]/g,'').normalize('NFC');
// "khoá" == "khóa": bỏ dấu thanh khỏi từng nguyên âm, so riêng dấu thanh của cả từ
function canon(s){let t=0,o='';for(const ch of s){const d=dec(ch);if(d.t)t=d.t;o+=unTone(ch)}return o+'|'+t}
// 2 = đúng, 1 = chưa chắc (đang gõ dở dấu), 0 = sai
function cmp(t,c){
 if(t===c)return 2;
 if(lang!=='vi')return 0;
 const a=dec(t),b=dec(c);
 if(a.b!==b.b)return 0;
 if(a.m===b.m)return 1;                       // chỉ khác dấu thanh
 return a.m===''&&b.m!==''?1:0;               // chưa thêm mũ/móc/ngang
}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function genWords(n){
 let out=[];
 while(out.length<n){const b=shuffle(WORDS[lang]);if(out.length&&b[0]===out[out.length-1])b.push(b.shift());out=out.concat(b)}
 return out.slice(0,n);
}
function addWords(list){
 list.forEach(raw=>{
  const chars=[...raw.toLowerCase().normalize('NFC')];
  const el=document.createElement('span');el.className='w';
  const spans=chars.map(ch=>{const sp=document.createElement('span');sp.className='c';sp.textContent=ch;el.appendChild(sp);return sp});
  const sp=document.createElement('span');sp.className='c sp';sp.textContent=' ';el.appendChild(sp);
  words.appendChild(el);
  W.push({chars,len:chars.length,el,spans,sp,ex:[]});
 });
}
function build(){
 W=[];rendered=0;words.innerHTML='';words.style.transform='';
 addWords(genWords(endless?100:300));
 render([],{st:[],miss:[]});
}
function reset(){
 clearInterval(timer);started=ended=false;prevLen=keys=errN=okNow=0;prevSt=[];prevTW=new Set();prevMW=new Set();ebt={};errs={};kinds={dau:0,chu:0};cum=[];lastV=[];composing=false;
 hid.lang=lang;dur=+$('dur').value;endless=dur===0;$('t').textContent=endless?0:dur;$('tl').textContent=endless?'từ':'giây';
 $('wpm').textContent=0;$('cpm').textContent=0;$('acc').textContent='100%';
 $('res').classList.remove('show');hid.value='';hid.disabled=false;build();if(mode==='type')hid.focus();
}
/* ---- chấm điểm: mỗi từ được chấm riêng, từ gõ lố / thiếu chỉ làm sai chính từ đó ---- */
function parse(v){const tw=[[]];for(const ch of v){if(ch===' ')tw.push([]);else tw[tw.length-1].push(ch)}return tw}
// chuẩn hoá ô nhập: bỏ dấu cách thừa, giới hạn độ dài gõ lố, không cho vượt quá từ cuối
function norm(v){
 const out=[];let wi=0,cnt=0;
 for(const ch of v){
  if(ch===' '){if(!cnt||wi>=W.length-1)continue;out.push(ch);wi++;cnt=0}
  else{if(cnt>=W[wi].len+EXTRA)continue;out.push(ch);cnt++}
 }
 return out;
}
function judge(tw,fin){
 const st=[],miss=[];
 tw.forEach((t,wi)=>{
  const w=W[wi],cur=wi===tw.length-1,s=[];
  for(let i=0;i<t.length;i++)s[i]=i<w.len?cmp(t[i],w.chars[i]):0;      // ký tự gõ lố luôn là sai
  if(composing&&cur)for(let i=0;i<Math.min(t.length,w.len);i++)if(s[i]<2)s[i]=1;   // đang ghép chữ: chưa phán xét
  // chỉ phán các chữ "chưa chắc" khi từ đã xong (đã gõ dấu cách, hoặc hết giờ khi đã gõ đủ chữ)
  if(s.includes(1)&&(!cur||(fin&&t.length>=w.len))){
   const e=Math.min(w.len,t.length),same=canon(t.slice(0,e).join(''))===canon(w.chars.slice(0,e).join(''));
   for(let j=0;j<e;j++)if(s[j]===1)s[j]=same?2:0;
  }
  st[wi]=s;miss[wi]=!cur&&t.length<w.len?w.len-t.length:0;   // bấm cách khi chưa gõ hết từ
 });
 return{st,miss};
}
function account(r,tw,now){
 // Lỗi chỉ được ghi khi ký tự đã CHẮC CHẮN sai (st=0). Chữ chưa có dấu mà từ chưa xong thì st=1, không bị tính.
 // Sai dấu thanh trong cùng 1 từ chỉ tính 1 lỗi. Mỗi ký tự gõ lố tính 1 lỗi nhưng chỉ của từ đó.
 let n=0;const ntw=new Set(),nmw=new Set();let ok=0;
 tw.forEach((t,wi)=>{
  const w=W[wi],s=r.st[wi],ps=prevSt[wi]||[];
  for(let i=0;i<s.length;i++){
   if(s[i]>0){if(i<w.len)ok++;continue}
   if(i>=w.len){
    const k=wi+':'+i;
    if(ps[i]===0||now-(ebt[k]||-1e9)<=80)continue;
    ebt[k]=now;errN++;n++;kinds.chu++;continue;
   }
   const a=dec(t[i]),b=dec(w.chars[i]),tone=lang==='vi'&&a.b===b.b&&a.m===b.m,k=tone?'t'+wi:wi+':'+i;
   if(tone){if(ntw.has(wi))continue;ntw.add(wi);if(prevTW.has(wi))continue}
   else if(ps[i]===0)continue;
   if(now-(ebt[k]||-1e9)<=80)continue;
   ebt[k]=now;errN++;n++;
   if(lang==='vi'&&a.b===b.b)kinds.dau++;else kinds.chu++;
   errs[w.chars[i]]=(errs[w.chars[i]]||0)+1;
  }
  if(r.miss[wi]){
   nmw.add(wi);
   if(!prevMW.has(wi)){errN++;n++;kinds.chu++;const c=w.chars[t.length];errs[c]=(errs[c]||0)+1}
  }
  if(wi<tw.length-1&&t.length===w.len&&s.every(x=>x>0))ok++;   // dấu cách sau từ đúng
 });
 prevTW=ntw;prevMW=nmw;prevSt=r.st.map(a=>a.slice());okNow=ok;return n;
}
function render(tw,r){
 const cw=Math.max(0,tw.length-1),upto=Math.min(W.length,Math.max(rendered,tw.length));
 for(let wi=0;wi<upto;wi++){
  const w=W[wi],t=tw[wi]||[],s=(r.st[wi])||[],fin=wi<tw.length-1,exN=Math.max(0,t.length-w.len);
  while(w.ex.length<exN){const x=document.createElement('span');x.className='c ex';w.el.insertBefore(x,w.sp);w.ex.push(x)}
  while(w.ex.length>exN)w.ex.pop().remove();
  const cls=i=>i<t.length?(s[i]===2?'c ok':s[i]===1?'c pend':'c bad'):(fin?'c miss':'c');
  w.spans.forEach((x,i)=>{x.className=cls(i)});w.sp.className='c sp';
  w.ex.forEach((x,k)=>{x.textContent=t[w.len+k];x.className='c ex bad'});
 }
 rendered=Math.max(0,tw.length);
 const w=W[Math.min(cw,W.length-1)],kids=w.el.children,cur=kids[Math.min((tw[cw]||[]).length,kids.length-1)];
 cur.classList.add('cur');
 const lh=parseFloat(getComputedStyle(words).lineHeight)||35;
 const row=Math.max(0,Math.round(cur.offsetTop/lh)-1);
 words.style.transform='translateY('+(-row*lh)+'px)';
}
const elapsed=()=>started?performance.now()-t0:0;
function stats(){
 const ms=endless?elapsed():Math.min(elapsed(),dur*1000),el=started?Math.max(ms/60000,1/600):0;
 const wpm=el?Math.round(okNow/5/el):0,raw=el?Math.round(prevLen/5/el):0,cpm=el?Math.round(okNow/el):0;
 const acc=keys?Math.max(0,Math.round((keys-Math.min(errN,keys))/keys*100)):100;
 $('wpm').textContent=wpm;$('cpm').textContent=cpm;$('acc').textContent=acc+'%';
 if(endless)$('t').textContent=lastV.filter(c=>c===' ').length;
 return{wpm,raw,cpm,acc};
}
function tick(){
 const s=Math.floor(elapsed()/1000);while(cum.length<s)cum.push(okNow);
 if(!endless){const left=Math.max(0,dur-elapsed()/1000);$('t').textContent=Math.ceil(left);stats();if(left<=0)finish()}else stats();
}
/* ---- kết quả thông minh ---- */
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const RANKS=['Tập sự','Người mới','Khá','Tốt','Giỏi','Cao thủ','Huyền thoại'],CUT=[0,15,30,45,60,80,100];
function consistency(){
 const d=[];for(let i=0;i<cum.length;i++)d.push((cum[i]-(cum[i-1]||0))*12);
 const s=d.map((_,i)=>{const w=d.slice(Math.max(0,i-2),i+1);return w.reduce((a,b)=>a+b,0)/w.length});
 if(s.length<4)return{c:null,s};
 const u=s.slice(1),m=u.reduce((a,b)=>a+b,0)/u.length;
 if(!m)return{c:0,s};
 const sd=Math.sqrt(u.reduce((a,b)=>a+(b-m)**2,0)/u.length);
 return{c:Math.round(Math.max(0,Math.min(100,100-sd/m*90))),s};
}
function chart(s){
 if(s.length<2)return'';
 const mx=Math.max(...s,10),p=s.map((v,i)=>(i/(s.length-1)*290+5).toFixed(1)+','+(70-v/mx*60).toFixed(1)).join(' ');
 return'<svg viewBox="0 0 300 76" preserveAspectRatio="none" style="width:100%;height:76px"><polyline points="'+p+'" fill="none" stroke="var(--acc)" stroke-width="2.5" stroke-linejoin="round"/></svg><div class="rm">WPM theo từng giây (cao nhất '+Math.round(mx)+')</div>';
}
function report(r){
 const cs=consistency();
 let lv=0;CUT.forEach((c,i)=>{if(r.wpm>=c)lv=i});
 if(r.acc<80)lv=Math.max(0,lv-2);else if(r.acc<90)lv=Math.max(0,lv-1);
 const top=Object.entries(errs).sort((a,b)=>b[1]-a[1]).slice(0,5);
 const tips=[];
 if(prevLen<10)tips.push('Chưa đủ dữ liệu để đánh giá chính xác. Hãy gõ ít nhất vài từ.');
 else{
  if(r.acc<90&&r.wpm>=25)tips.push('Bạn gõ nhanh nhưng sai nhiều. Giảm tốc khoảng 10–15%, độ chính xác tăng sẽ kéo WPM thực lên.');
  else if(r.acc>=97&&r.wpm<45)tips.push('Rất chính xác. Bạn có thể tự tin gõ nhanh hơn một chút.');
  else if(r.acc>=97)tips.push('Vừa nhanh vừa chuẩn, rất tốt.');
  if(lang==='vi'&&kinds.dau+kinds.chu>2&&kinds.dau>kinds.chu)tips.push('Phần lớn lỗi là sai dấu (thanh, mũ, móc, đ). Nên luyện chậm các từ có dấu.');
  else if(kinds.chu>kinds.dau*2&&kinds.chu>2)tips.push('Phần lớn lỗi là gõ nhầm phím, kiểm tra tư thế đặt tay.');
  if(cs.c!==null&&cs.c<65)tips.push('Nhịp gõ chưa đều (khựng ở một số từ). Thử gõ đều tay thay vì dồn tốc độ.');
  if(top.length&&top[0][1]>=2)tips.push('Hay sai nhất: '+top.map(([k,n])=>'<kbd>'+esc(k)+'</kbd>×'+n).join(' '));
 }
 $('rk').innerHTML='<div class="rank">'+RANKS[lv]+'</div>';
 $('rg').innerHTML=chart(cs.s);
 $('rx').innerHTML='<div class="grid"><div><b>'+r.raw+'</b>WPM thô</div><div><b>'+(cs.c===null?'—':cs.c+'%')+'</b>đều tay</div><div><b>'+errN+'</b>lỗi'+(lang==='vi'?' ('+kinds.dau+' dấu / '+kinds.chu+' chữ)':'')+'</div></div>'+tips.map(t=>'<p>'+t+'</p>').join('');
}
function finish(){
 if(ended)return;
 const ms=elapsed();ended=true;clearInterval(timer);hid.disabled=true;sfx('end');
 composing=false;
 const tw=parse(lastV),r0=judge(tw,true);account(r0,tw,performance.now()+1e4);render(tw,r0);
 while(cum.length<Math.floor(Math.min(ms,dur*1000||ms)/1000))cum.push(okNow);
 const r=stats();
 $('rw').textContent=r.wpm+' WPM';
 $('rd').textContent=r.cpm+' CPM · chính xác '+r.acc+'%';
 report(r);$('res').classList.add('show');
}
/* ---- nhập liệu (Unikey, Telex/VNI, IME macOS, bàn phím điện thoại) ---- */
hid.addEventListener('compositionstart',()=>{composing=true});
hid.addEventListener('compositionend',()=>{composing=false;onInput(true)});
function onInput(fc){
 if(ended)return;
 let v=[...hid.value.normalize('NFC')];
 if(!composing){const n=norm(v);if(n.length!==v.length||n.some((c,i)=>c!==v[i])){v=n;hid.value=v.join('')}}
 const L=v.length,now=performance.now();
 if(!started&&L>0){started=true;t0=now;timer=setInterval(tick,250)}
 const tw=parse(v),r=judge(tw,false),ne=account(r,tw,now);
 if(L>prevLen){
  if(fc)keys+=L-prevLen;else if(now-lastGrow>30)keys++;   // bộ gõ xoá+chèn lại trong 1 lần bấm chỉ tính 1 phím
  lastGrow=now;sfx(ne?'err':'key');
 }
 prevLen=L;lastV=v;
 if(endless&&tw.length>W.length-30)addWords(genWords(60));
 render(tw,r);stats();
 const last=tw.length-1;
 if(!endless&&last===W.length-1&&tw[last].length>=W[last].len&&!composing)finish();
}
hid.addEventListener('input',e=>{if(e.isComposing)composing=true;onInput(false)});
hid.addEventListener('keydown',e=>{
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='a'))e.preventDefault();
 if(e.key==='Escape'&&endless&&started)finish();
});
let tabbed=false;
window.addEventListener('keydown',e=>{
 if(mode!=='type')return;
 if(e.target.closest&&e.target.closest('.panel'))return;
 if(e.key==='Tab'){e.preventDefault();tabbed=true;return}
 if(e.key==='Enter'&&tabbed){e.preventDefault();reset();return}
 tabbed=false;
 if(!ended&&document.activeElement!==hid&&!e.ctrlKey&&!e.metaKey&&!e.altKey)hid.focus();
});
box.addEventListener('click',()=>hid.focus());
$('reset').addEventListener('click',reset);
$('dur').addEventListener('change',reset);
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{
 document.querySelectorAll('[data-lang]').forEach(x=>x.classList.remove('on'));
 b.classList.add('on');lang=b.dataset.lang;reset();
}));
