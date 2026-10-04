/* ===== Âm thanh (mặc định tắt) ===== */
let AC=null;
const SND={on:{key:false,err:false,end:false},type:'click',vol:.4};
function tone(f,d,type,g,t0){
 AC=AC||new(window.AudioContext||window.webkitAudioContext)();
 if(AC.state==='suspended')AC.resume();
 const o=AC.createOscillator(),gn=AC.createGain(),t=AC.currentTime+(t0||0);
 o.type=type;o.frequency.value=f;
 gn.gain.setValueAtTime(Math.max(.0002,g*SND.vol),t);
 gn.gain.exponentialRampToValueAtTime(.0001,t+d);
 o.connect(gn);gn.connect(AC.destination);o.start(t);o.stop(t+d);
}
function sfx(k){
 if(!SND.on[k])return;
 try{
  if(k==='err')tone(140,.12,'sawtooth',.5);
  else if(k==='end')[523,659,784].forEach((f,i)=>tone(f,.25,'sine',.6,i*.12));
  else{const p={click:[1800,.03,'square',.25],mech:[260,.05,'triangle',.7],pop:[600,.06,'sine',.6],bell:[1320,.18,'sine',.4]}[SND.type];
   tone(p[0]*(.96+Math.random()*.08),p[1],p[2],p[3]);}
 }catch(e){}
}
function sndSave(){try{localStorage.setItem('tt_snd',JSON.stringify(SND))}catch(e){}}
function sndSync(){$('sKey').checked=SND.on.key;$('sErr').checked=SND.on.err;$('sEnd').checked=SND.on.end;$('sType').value=SND.type;$('sVol').value=Math.round(SND.vol*100)}
try{const v=JSON.parse(localStorage.getItem('tt_snd')||'null');if(v){Object.assign(SND.on,v.on);SND.type=v.type||'click';SND.vol=v.vol??.4}}catch(e){}
sndSync();
[['sKey','key'],['sErr','err'],['sEnd','end']].forEach(([id,k])=>$(id).onchange=e=>{SND.on[k]=e.target.checked;sndSave()});
$('sType').onchange=e=>{SND.type=e.target.value;sndSave()};
$('sVol').oninput=e=>{SND.vol=e.target.value/100;sndSave()};
$('sTest').onclick=()=>{const o={...SND.on};SND.on.key=true;sfx('key');SND.on.key=o.key};
