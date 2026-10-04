/* ===== Dock ===== */
function tog(id){const el=$(id),on=!el.classList.contains('show');
 document.querySelectorAll('.panel').forEach(p=>p.classList.remove('show'));
 if(on)el.classList.add('show');else hid.focus()}
$('bCss').onclick=()=>tog('cssPanel');
$('bMus').onclick=()=>tog('musicPanel');
$('bSnd').onclick=()=>tog('soundPanel');
