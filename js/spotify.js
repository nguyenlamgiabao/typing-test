/* ===== Spotify ===== */
const SP=/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/;
function spLoad(){
 const m=$('spIn').value.match(SP);
 if(!m){$('spBox').innerHTML='<div class="m">Link chưa hợp lệ.</div>';return}
 const f=document.createElement('iframe');
 f.src='https://open.spotify.com/embed/'+m[1]+'/'+m[2]+'?theme=0';
 f.allow='autoplay; encrypted-media; clipboard-write';f.loading='lazy';
 $('spBox').replaceChildren(f);
 const a=$('spOpen');a.href='https://open.spotify.com/'+m[1]+'/'+m[2];a.style.display='';
 try{localStorage.setItem('tt_sp',$('spIn').value)}catch(e){}
}
$('spPlay').onclick=spLoad;
$('spStop').onclick=()=>{$('spBox').replaceChildren()};
try{const v=localStorage.getItem('tt_sp');if(v)$('spIn').value=v}catch(e){}
