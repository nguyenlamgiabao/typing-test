/* ===== CSS tuỳ chỉnh ===== */
const BAD_VAL=/url\(|expression|javascript:|image-set|@import|behavior/i;
const ROOT_DENY=/^(transform|translate|rotate|scale|filter|perspective|contain|will-change|pointer-events|visibility|display|backdrop-filter|zoom|all)$/;
const ROOTRE=/^(html|body|:root)(?![\w-])/;
function scopeSel(x){
 x=x.trim().replace(/\s+/g,' ');
 if(!x||/#hid|#dock|\.panel|Panel|#userCss|#spBox/i.test(x))return null;
 const m=x.match(/^(html|body|:root)(?![\w-])(.*)$/);
 if(m){
  const rest=m[2];
  if(/^(:hover|:focus|:active|::selection|::before|::after)*$/.test(rest))return(m[1]===':root'?':root:root:root':m[1])+rest;
  return '.app'+rest;
 }
 if(/^\.app(?![\w-])/.test(x))return x;
 return '.app '+x;
}
function scan(rules,set){
 for(const r of rules){
  if(r.type===1&&r.selectorText.split(',').some(p=>ROOTRE.test(p.trim()))){
   for(const n of['animation','animation-name']){const v=r.style.getPropertyValue(n);if(v)v.split(/[\s,]+/).forEach(t=>set.add(t))}
  }else if(r.cssRules&&r.type!==7)scan(r.cssRules,set);
 }
}
function clean(rules,dropped,anim){
 let out='';
 for(const r of rules){
  if(r.type===1){
   const parts=r.selectorText.split(','),ok=parts.map(scopeSel),good=ok.filter(Boolean);
   parts.forEach((p,i)=>{if(!ok[i])dropped.push(p.trim())});
   if(!good.length)continue;
   const guard=good.some(g=>ROOTRE.test(g));
   let d='';
   for(let i=0;i<r.style.length;i++){
    const n=r.style[i],v=r.style.getPropertyValue(n);
    if(BAD_VAL.test(v)||(guard&&ROOT_DENY.test(n))){dropped.push(n+' (bị chặn)');continue}
    d+=n+':'+v+(r.style.getPropertyPriority(n)?' !important':'')+';';
   }
   out+=good.join(',')+'{'+d+'}\n';
  }else if(r.type===7){
   const strip=anim.has(r.name);let b='';
   for(const k of r.cssRules){
    let d='';
    for(let i=0;i<k.style.length;i++){
     const n=k.style[i],v=k.style.getPropertyValue(n);
     if(BAD_VAL.test(v)||(strip&&ROOT_DENY.test(n)))continue;
     d+=n+':'+v+';';
    }
    b+=k.keyText+'{'+d+'}';
   }
   out+='@keyframes '+r.name+'{'+b+'}\n';
  }else if(r.type===4){
   out+='@media '+r.conditionText+'{'+clean(r.cssRules,dropped,anim)+'}\n';
  }else if(r.type===12){
   out+='@supports '+r.conditionText+'{'+clean(r.cssRules,dropped,anim)+'}\n';
  }else dropped.push('@-rule không hỗ trợ');
 }
 return out;
}
function applyCss(txt){
 const st=$('cssStat'),dropped=[];
 try{
  const sh=new CSSStyleSheet();sh.replaceSync(txt);
  const anim=new Set();scan(sh.cssRules,anim);
  $('userCss').textContent=clean(sh.cssRules,dropped,anim);
  st.textContent=dropped.length?'Đã áp dụng. Bỏ qua: '+[...new Set(dropped)].slice(0,8).join(' · '):'Đã áp dụng.';
 }catch(err){st.textContent='Lỗi CSS: '+err.message}
 try{localStorage.setItem('tt_css',txt)}catch(e){}
}
