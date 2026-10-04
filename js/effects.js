const ICON_X='<svg class="ic" aria-hidden="true"><use href="#i-x"/></svg>';
const PRE={
dark:`:root{--bg:#14161c;--card:#1d2028;--fg:#e6e8ee;--dim:#5d6475;--ok:#4cd68a;--bad:#ff6b6b;--badbg:#3a2226;--acc:#7a9cff;--bd:#2b2f3a}`,
light:`:root{--bg:#f6f7f9;--card:#ffffff;--fg:#1f2430;--dim:#a3a9b8;--ok:#1a9d5a;--bad:#e03e3e;--badbg:#fde8e8;--acc:#3b6cf6;--bd:#e3e6ed}`,
pixel:`:root{--bg:#1a1c2c;--card:#292b45;--fg:#f4f4f4;--dim:#566c86;--ok:#38b764;--bad:#ef4d5a;--badbg:#5d275d;--acc:#ffcd75;--bd:#f4f4f4}
body{font-family:"Courier New",monospace;font-weight:700;background-image:linear-gradient(#0000003a 50%,transparent 50%);background-size:100% 4px}
*{border-radius:0}
h1{text-transform:uppercase;letter-spacing:.12em;text-shadow:3px 3px 0 #000}
h1::after{content:"";display:inline-block;width:.5em;height:1em;margin-left:.3em;vertical-align:-.12em;background:currentColor;animation:px 1s steps(1) infinite}
.box,.stat,.res{border:4px solid var(--bd);box-shadow:6px 6px 0 #000}
.stat b{color:var(--acc);text-shadow:2px 2px 0 #000}
.bar button,.bar select{border:3px solid var(--bd);background:var(--card);color:var(--fg);font-family:inherit;box-shadow:3px 3px 0 #000}
.bar button:hover{transform:translate(2px,2px);box-shadow:1px 1px 0 #000}
.bar button.on{background:var(--acc);color:#000}
#words{font-size:1.5rem;letter-spacing:.06em}
.c.cur{box-shadow:none;background:var(--acc);color:#000;animation:px .8s steps(1) infinite}
.c.bad{background:var(--bad);color:#fff;text-decoration:none}
@keyframes px{50%{background:transparent;color:var(--fg)}}`,
rebel:`:root{--bg:#0a0a0a;--card:#08080c;--fg:#f2f2f2;--dim:#6b6b6b;--ok:#39ff14;--bad:#ff2a55;--badbg:#3a0010;--acc:#fff200;--bd:#ff2a55}
body{background:linear-gradient(120deg,#1a0612,#14082e,#06202c,#0a2214,#1a0612);background-size:300% 300%;animation:bg 40s ease-in-out infinite alternate}
@keyframes bg{to{background-position:100% 50%}}
.app{transform:rotate(-.6deg)}
h1{font-size:2rem;text-transform:uppercase;animation:hue 16s linear infinite}
@keyframes hue{to{filter:hue-rotate(360deg)}}
.box{border:3px solid var(--bd);box-shadow:0 0 18px #ff2a5566,inset 0 0 12px #ff2a5533;animation:wob 4s ease-in-out infinite}
@keyframes wob{0%,100%{transform:rotate(.5deg) skewX(-1deg)}50%{transform:rotate(-.5deg) skewX(1deg) translateY(-4px)}}
.stat{transition:transform .2s}
.stat:nth-child(odd){transform:rotate(-2deg)}
.stat:nth-child(even){transform:rotate(2deg)}
.stat:hover{transform:scale(1.1)}
.c{display:inline-block}
.c.ok{text-shadow:0 0 8px var(--ok);animation:pop .2s}
@keyframes pop{from{transform:scale(1.5) translateY(-4px)}}
.c.bad{animation:shake .15s infinite}
@keyframes shake{25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}
.bar button:hover{transform:rotate(-4deg) scale(1.1)}`,
classic:`:root{--bg:#cfc9a4;--card:#e4dfc2;--fg:#3a3a2c;--dim:#a3a07f;--ok:#4f6b3c;--bad:#a8402f;--badbg:#e3c3b0;--acc:#5b7a78;--bd:#9a966f}
body{font-family:"Courier New",Courier,monospace;background-attachment:fixed;background-image:radial-gradient(ellipse at 50% 0%,#fffbd655 0%,#0000 60%),repeating-linear-gradient(90deg,#0000001a 0 1px,#0000 1px 140px),repeating-linear-gradient(0deg,#0000001a 0 1px,#0000 1px 140px),repeating-linear-gradient(0deg,#00000010 0 1px,#0000 1px 3px),linear-gradient(#d8d2aa,#c2bc94)}
h1{display:flex;align-items:center;gap:10px;font-size:1rem;font-weight:400;letter-spacing:.3em;text-transform:uppercase}
h1::after{content:"VHS  SP  0:00:00";margin-left:auto;font-size:.7rem;letter-spacing:.12em;opacity:.55}
.app{animation:flick 9s steps(1) infinite}
@keyframes flick{0%,100%{opacity:1}91%{opacity:.95}92%{opacity:1}96%{opacity:.9}97%{opacity:1}}
.box{border:2px solid var(--bd);border-radius:0;background:linear-gradient(#e9e4c8,#ddd8b8);box-shadow:inset 0 0 40px #5b7a7826,6px 6px 0 #9a966f66}
.stat,.res{border:2px solid var(--bd);border-radius:0;background:var(--card);box-shadow:inset 2px 2px 0 #ffffff99,inset -2px -2px 0 #0000001f}
.stat b{font-weight:400;letter-spacing:.05em}
.stat span{letter-spacing:.2em}
#words{font-size:1.35rem;letter-spacing:.04em;text-shadow:1px 0 #ff000030,-1px 0 #00c8c830}
.c.bad{background:var(--badbg);color:var(--bad);text-decoration:none}
.bar button,.bar select{font-family:inherit;border:2px outset #f2eed6;border-radius:0;background:#d8d3b4;color:var(--fg)}
.bar button:active{border-style:inset}
.bar button.on{background:#b9c9c0;border-style:inset}
.hint{font-size:.75rem;letter-spacing:.08em;text-transform:uppercase}
@media (prefers-reduced-motion:reduce){.app{animation:none}}`};
const BUILT=[['dark','Tối'],['light','Sáng'],['pixel','Pixel'],['rebel','Nổi loạn'],['classic','Cổ điển']];
let MINE=[];
try{const v=JSON.parse(localStorage.getItem('tt_fx')||'[]');if(Array.isArray(v))MINE=v.filter(x=>x&&typeof x.name==='string'&&typeof x.css==='string').slice(0,20)}catch(e){}
function fxSave(){try{localStorage.setItem('tt_fx',JSON.stringify(MINE))}catch(e){}}
function useCss(t){$('cssIn').value=t;applyCss(t)}
function fxRender(){
 const bt=$('fxBuilt'),mt=$('fxMine');bt.replaceChildren();mt.replaceChildren();
 BUILT.forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.onclick=()=>useCss(PRE[k]);bt.appendChild(b)});
 if(!MINE.length){const m=document.createElement('div');m.className='m';m.textContent='Chưa có. Viết CSS rồi đặt tên và bấm Lưu.';mt.appendChild(m)}
 MINE.forEach((x,i)=>{
  const w=document.createElement('span');w.className='fx';
  const b=document.createElement('button');b.textContent=x.name;b.onclick=()=>useCss(x.css);
  const d=document.createElement('button');d.innerHTML=ICON_X;d.title='Xóa';d.onclick=()=>{MINE.splice(i,1);fxSave();fxRender()};
  w.append(b,d);mt.appendChild(w);
 });
}
$('fxSave').onclick=()=>{
 const n=$('fxName').value.trim().slice(0,30),st=$('cssStat'),css=$('cssIn').value;
 if(!n){st.textContent='Hãy đặt tên cho hiệu ứng.';return}
 if(!css.trim()){st.textContent='Ô CSS đang trống.';return}
 if(BUILT.some(([,l])=>l.toLowerCase()===n.toLowerCase())){st.textContent='Tên này trùng hiệu ứng mặc định, hãy chọn tên khác.';return}
 const i=MINE.findIndex(x=>x.name.toLowerCase()===n.toLowerCase());
 if(i>=0)MINE[i]={name:n,css};
 else{if(MINE.length>=20){st.textContent='Tối đa 20 hiệu ứng, hãy xóa bớt.';return}MINE.push({name:n,css})}
 fxSave();fxRender();$('fxName').value='';st.textContent='Đã lưu hiệu ứng "'+n+'".';
};
fxRender();
const cssIn=$('cssIn');let cssT;
cssIn.addEventListener('input',()=>{clearTimeout(cssT);cssT=setTimeout(()=>applyCss(cssIn.value),300)});
$('cssReset').onclick=()=>{cssIn.value='';applyCss('')};
try{const v=localStorage.getItem('tt_css');if(v){cssIn.value=v;applyCss(v)}}catch(e){}
