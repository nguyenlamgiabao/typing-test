const $=id=>document.getElementById(id);
const hid=$('hid'),words=$('words'),box=$('box');
let mode='type',endless=false,curW=null,lang='vi',target=[],spans=[],wid=[],W=[],started=false,ended=false,t0=0,timer=null,dur=30,
composing=false,compStart=0,prevLen=0,prevSt=[],keys=0,errN=0,lastGrow=0,ebt={},errs={},kinds={dau:0,chu:0},cum=[],okNow=0,lastV=[];
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
function addText(text){
 [...text.toLowerCase().normalize('NFC')].forEach(ch=>{
  if(!curW){curW=document.createElement('span');curW.className='w';words.appendChild(curW);W.push({s:target.length,e:target.length})}
  const sp=document.createElement('span');sp.className='c';sp.textContent=ch;curW.appendChild(sp);
  spans.push(sp);target.push(ch);wid.push(W.length-1);
  if(ch===' ')curW=null;else W[W.length-1].e=target.length;
 });
}
function build(){
 target=[];spans=[];wid=[];W=[];curW=null;words.innerHTML='';words.style.transform='';
 addText(genWords(endless?100:300).join(' '));
 render([],[]);
}
function reset(){
 clearInterval(timer);started=ended=false;prevLen=keys=errN=okNow=0;prevSt=[];ebt={};errs={};kinds={dau:0,chu:0};cum=[];lastV=[];composing=false;
 hid.lang=lang;dur=+$('dur').value;endless=dur===0;$('t').textContent=endless?0:dur;$('tl').textContent=endless?'từ':'giây';
 $('wpm').textContent=0;$('cpm').textContent=0;$('acc').textContent='100%';
 $('res').classList.remove('show');hid.value='';hid.disabled=false;build();if(mode==='type')hid.focus();
}
/* ---- chấm điểm ---- */
function judge(ch,fin){
 const L=ch.length,st=[];
 for(let i=0;i<L;i++)st[i]=cmp(ch[i],target[i]);
 if(composing)for(let i=compStart;i<L;i++)if(st[i]<2)st[i]=1;   // đang ghép chữ: chưa phán xét
 const done=new Set();
 for(let i=0;i<L;i++){
  if(st[i]!==1||done.has(wid[i]))continue;
  const w=W[wid[i]];done.add(wid[i]);
  if(!fin&&(L<=w.e||(composing&&w.e>=compStart)))continue;       // từ chưa kết thúc (chưa gõ dấu cách)
  const e=Math.min(w.e,L),same=canon(ch.slice(w.s,e).join(''))===canon(target.slice(w.s,e).join(''));
  for(let j=w.s;j<e;j++)if(st[j]===1)st[j]=same?2:0;
 }
 return st;
}
function account(st,ch,now){
 let n=0;
 for(let i=0;i<st.length;i++)if(st[i]===0&&prevSt[i]!==0&&now-(ebt[i]||-1e9)>80){
  ebt[i]=now;errN++;n++;
  const a=dec(ch[i]),b=dec(target[i]);
  if(lang==='vi'&&a.b===b.b)kinds.dau++;else kinds.chu++;
  errs[target[i]]=(errs[target[i]]||0)+1;
 }
 prevSt=st.slice();okNow=st.filter(x=>x>0).length;return n;
}
function render(ch,st){
 const L=ch.length;
 spans.forEach((s,i)=>{
  let c='c';
  if(i<L)c+=st[i]===2?' ok':st[i]===1?' pend':' bad';
  if(i===L)c+=' cur';
  s.className=c;
 });
 const cur=spans[Math.min(L,spans.length-1)];
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
 const st=judge(lastV,true);account(st,lastV,performance.now()+1e4);render(lastV,st);
 while(cum.length<Math.floor(Math.min(ms,dur*1000||ms)/1000))cum.push(okNow);
 const r=stats();
 $('rw').textContent=r.wpm+' WPM';
 $('rd').textContent=r.cpm+' CPM · chính xác '+r.acc+'%';
 report(r);$('res').classList.add('show');
}
/* ---- nhập liệu (Unikey, Telex/VNI, IME macOS, bàn phím điện thoại) ---- */
const wStart=i=>{const k=Math.min(i,target.length-1);return W[wid[k]].s};
hid.addEventListener('compositionstart',()=>{composing=true;compStart=wStart([...hid.value.normalize('NFC')].length)});
hid.addEventListener('compositionend',()=>{composing=false;onInput(true)});
function onInput(fc){
 if(ended)return;
 let v=[...hid.value.normalize('NFC')];
 if(v.length>target.length){v=v.slice(0,target.length);if(!composing)hid.value=v.join('')}
 const L=v.length,now=performance.now();
 if(!started&&L>0){started=true;t0=now;timer=setInterval(tick,250)}
 const st=judge(v,false),ne=account(st,v,now);
 if(L>prevLen){
  if(fc)keys+=L-prevLen;else if(now-lastGrow>30)keys++;   // bộ gõ xoá+chèn lại trong 1 lần bấm chỉ tính 1 phím
  lastGrow=now;sfx(ne?'err':'key');
 }
 prevLen=L;lastV=v;
 if(endless&&L>target.length-80)addText(' '+genWords(100).join(' '));
 render(v,st);stats();
 if(!endless&&L>=target.length&&!composing&&st[L-1]!==1)finish();
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
