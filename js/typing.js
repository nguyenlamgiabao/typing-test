const $=id=>document.getElementById(id);
const hid=$('hid'),words=$('words'),box=$('box');
let endless=false,curW=null,lang='vi',target=[],spans=[],started=false,ended=false,t0=0,timer=null,dur=30,
total=0,wrong=0,composing=false,prevLen=0;
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function genWords(n){ // Fisher-Yates mỗi lượt, nối nhiều vòng nếu cần, tránh lặp từ liền kề
 let out=[];
 while(out.length<n){
  const b=shuffle(WORDS[lang]);
  if(out.length&&b[0]===out[out.length-1])b.push(b.shift());
  out=out.concat(b);
 }
 return out.slice(0,n);
}
function addText(text){
 [...text.toLowerCase().normalize('NFC')].forEach(ch=>{
  if(!curW){curW=document.createElement('span');curW.className='w';words.appendChild(curW)}
  const sp=document.createElement('span');sp.className='c';sp.textContent=ch;curW.appendChild(sp);
  spans.push(sp);target.push(ch);
  if(ch===' ')curW=null;
 });
}
function build(){
 target=[];spans=[];curW=null;words.innerHTML='';words.style.transform='';
 addText(genWords(endless?100:300).join(' '));
 render('');
}
function reset(){
 clearInterval(timer);started=ended=false;total=wrong=prevLen=0;composing=false;
 dur=+$('dur').value;endless=dur===0;$('t').textContent=endless?0:dur;$('tl').textContent=endless?'từ':'giây';$('wpm').textContent=0;$('cpm').textContent=0;$('acc').textContent='100%';
 $('res').classList.remove('show');hid.value='';hid.disabled=false;build();hid.focus();
}
function correctCount(v){let n=0;for(let i=0;i<v.length;i++)if(v[i]===target[i])n++;return n}
function render(v){
 const chars=[...v];
 spans.forEach((s,i)=>{
  let c='c';
  if(i<chars.length){
   if(composing&&i===chars.length-1)c+=' pend';
   else c+=chars[i]===target[i]?' ok':' bad';
  }
  if(i===chars.length)c+=' cur';
  s.className=c;
 });
 const cur=spans[Math.min(chars.length,spans.length-1)];
 const lh=words.firstChild?parseFloat(getComputedStyle(words).lineHeight):35;
 const row=Math.max(0,Math.round(cur.offsetTop/lh)-1);
 words.style.transform='translateY('+(-row*lh)+'px)';
}
function stats(v){
 const el=started?Math.max((performance.now()-t0)/60000,1/600):0;
 const ok=correctCount([...v].join(''));
 const wpm=el?Math.round(ok/5/el):0,cpm=el?Math.round(ok/el):0;
 const acc=total?Math.max(0,Math.round((total-wrong)/total*100)):100;
 $('wpm').textContent=wpm;$('cpm').textContent=cpm;$('acc').textContent=acc+'%';
 if(endless)$('t').textContent=[...v].filter(c=>c===' ').length;
 return{wpm,cpm,acc};
}
function tick(){
 if(endless){stats(hid.value.normalize('NFC'));return}
 const left=Math.max(0,dur-(performance.now()-t0)/1000);
 $('t').textContent=Math.ceil(left);
 stats(hid.value.normalize('NFC'));
 if(left<=0)finish();
}
function finish(){
 if(ended)return;ended=true;clearInterval(timer);hid.disabled=true;sfx('end');
 const r=stats(hid.value.normalize('NFC'));
 $('rw').textContent=r.wpm+' WPM';
 $('rd').textContent=r.cpm+' CPM · chính xác '+r.acc+'%';
 $('res').classList.add('show');
}
hid.addEventListener('compositionstart',()=>{composing=true});
hid.addEventListener('compositionend',()=>{composing=false;onInput()});
function onInput(){
 if(ended)return;
 let v=hid.value.normalize('NFC');
 if(v.length>target.length){v=v.slice(0,target.length);hid.value=v}
 const len=[...v].length;
 if(!started&&len>0){started=true;t0=performance.now();timer=setInterval(tick,250)}
 // đếm phím: chỉ tính khi tăng độ dài và không đang ghép dấu
 if(len>prevLen&&!composing){
  total+=len-prevLen;
  let bad=false;for(let i=prevLen;i<len;i++)if([...v][i]!==target[i]){wrong++;bad=true}
  sfx(bad?'err':'key');
 }
 prevLen=len;
 if(endless&&len>target.length-80)addText(' '+genWords(100).join(' '));
 render(v);stats(v);
 if(!endless&&len>=target.length)finish();
}
hid.addEventListener('input',e=>{if(e.isComposing){composing=true;render(hid.value.normalize('NFC'));return}onInput()});
// bộ lọc phím: chặn phím điều hướng làm lệch con trỏ
hid.addEventListener('keydown',e=>{
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))e.preventDefault();
});
// Tab + Enter để làm mới
let tabbed=false;
window.addEventListener('keydown',e=>{
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
