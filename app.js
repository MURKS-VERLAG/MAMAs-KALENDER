'use strict';
const screens=[...document.querySelectorAll('.screen')];
const pagesEl=document.getElementById('calendarPages');
const dotsEl=document.getElementById('pageDots');
const giftPagesEl=document.getElementById('giftPages');
const giftDotsEl=document.getElementById('giftDots');
const curtain=document.getElementById('heartCurtain');
const music=document.getElementById('music');
const soundBtn=document.getElementById('soundBtn');
const STORAGE='mama-kalender-2026-2027-v1';
let entries={};
try{entries=JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{entries={}}
const save=()=>localStorage.setItem(STORAGE,JSON.stringify(entries));
const months=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const weekdays=['So','Mo','Di','Mi','Do','Fr','Sa'];
const romans=['I','II','III'];
const pad=n=>String(n).padStart(2,'0');
const key=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
function show(id){screens.forEach(s=>s.classList.toggle('active',s.id===id));if(id==='album')startTypewriter()}
function heartTransition(target){
  curtain.innerHTML='';
  for(let i=0;i<36;i++){
    const h=document.createElement('span');h.className='fall-heart';h.textContent='♥';
    h.style.left=`${(i%9)*12-2}%`;h.style.fontSize=`${55+(i%5)*18}px`;h.style.animationDelay=`${Math.floor(i/9)*.08+(i%3)*.025}s`;curtain.appendChild(h);
  }
  setTimeout(()=>show(target),420);setTimeout(()=>curtain.innerHTML='',1450);
}
function createPager(track,dots){
  let index=0,startX=0,startY=0,tracking=false;
  const count=()=>track.children.length;
  const render=(animate=true)=>{track.style.transition=animate?'transform .38s cubic-bezier(.22,.8,.3,1)':'none';track.style.transform=`translate3d(${-index*100}%,0,0)`;[...dots.children].forEach((d,i)=>d.classList.toggle('on',i===index))};
  track.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;startX=e.touches[0].clientX;startY=e.touches[0].clientY;tracking=true},{passive:true});
  track.addEventListener('touchend',e=>{if(!tracking)return;tracking=false;const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25){index=Math.max(0,Math.min(count()-1,index+(dx<0?1:-1)));render(true)}},{passive:true});
  render(false);return{reset:()=>{index=0;render(false)}};
}
function addDot(target){const dot=document.createElement('span');dot.className='dot';target.appendChild(dot)}
function buildCalendar(){
  const start=new Date(2026,8,21),end=new Date(2027,8,21);let cursor=new Date(2026,8,1);
  while(cursor<=end){
    const y=cursor.getFullYear(),m=cursor.getMonth(),last=new Date(y,m+1,0).getDate();
    let ranges;
    if(y===2026&&m===8)ranges=[[21,30,2]];
    else if(y===2027&&m===8)ranges=[[1,10,0],[11,20,1],[21,21,2]];
    else ranges=[[1,10,0],[11,20,1],[21,last,2]];
    ranges.forEach(([from,to,romanIndex])=>{
      const page=document.createElement('article');page.className='month-page';
      const title=document.createElement('h2');title.className='month-title';title.textContent=`${months[m]} ${y}`;
      const roman=document.createElement('div');roman.className='roman';roman.textContent=romans[romanIndex];
      const days=document.createElement('div');days.className='days';
      for(let day=from;day<=to;day++){
        const d=new Date(y,m,day),k=key(d),row=document.createElement('div');row.className='day-row';
        const lab=document.createElement('div');lab.className='day-label'+([0,6].includes(d.getDay())?' weekend':'');
        lab.innerHTML=`${weekdays[d.getDay()]}, ${pad(day)}.${pad(m+1)}.${day===21&&m===8?' <span class="cake">🎂</span>':''}`;
        const input=document.createElement('input');input.className='day-input';input.type='text';input.inputMode='text';input.autocomplete='off';input.value=entries[k]||'';input.setAttribute('aria-label',`Eintrag ${day}. ${months[m]} ${y}`);
        input.addEventListener('input',()=>{entries[k]=input.value;save()});row.append(lab,input);days.appendChild(row);
      }
      page.append(title,roman,days);pagesEl.appendChild(page);addDot(dotsEl);
    });
    cursor=new Date(y,m+1,1);
  }
}
function buildGifts(){
  let cursor=new Date(2026,8,1);const end=new Date(2027,8,1);
  while(cursor<=end){
    const y=cursor.getFullYear(),m=cursor.getMonth(),unlocked=y===2026&&m===8;
    const page=document.createElement('article');page.className='gift-page'+(unlocked?'':' locked');
    const title=document.createElement('h2');title.className='gift-month';title.textContent=`${months[m]} ${y}`;
    const choices=document.createElement('div');choices.className='gift-choice';
    const a=document.createElement('button');a.className='choice';a.textContent='A';
    const b=document.createElement('button');b.className='choice';b.textContent='B';choices.append(a,b);
    if(!unlocked){const lock=document.createElement('div');lock.className='lock-overlay';lock.textContent='🔒';choices.appendChild(lock);a.disabled=true;b.disabled=true}
    page.append(title,choices);giftPagesEl.appendChild(page);addDot(giftDotsEl);cursor=new Date(y,m+1,1);
  }
}
let typingTimer;
function startTypewriter(){
  clearInterval(typingTimer);const target=document.getElementById('typewriterText');const heart=document.querySelector('.album-heart');
  const text='Hier werden zukünftig Bilder, die wir auf den Ausflügen schießen, hinterlegt.';let i=0;target.textContent='';target.classList.add('typing-caret');heart.classList.remove('show');
  typingTimer=setInterval(()=>{target.textContent+=text[i++]||'';if(i>=text.length){clearInterval(typingTimer);target.classList.remove('typing-caret');heart.classList.add('show')}},52);
}
function tryPlay(){if(!music.muted)music.play().catch(()=>{})}
buildCalendar();buildGifts();
const calendarPager=createPager(pagesEl,dotsEl),giftPager=createPager(giftPagesEl,giftDotsEl);
document.getElementById('calendarBtn').addEventListener('click',()=>{calendarPager.reset();heartTransition('calendar');tryPlay()});
document.getElementById('albumBtn').addEventListener('click',()=>{heartTransition('album');tryPlay()});
document.getElementById('giftBtn').addEventListener('click',()=>{giftPager.reset();heartTransition('gift');tryPlay()});
document.querySelectorAll('[data-home]').forEach(b=>b.addEventListener('click',()=>heartTransition('home')));
soundBtn.addEventListener('click',()=>{music.muted=!music.muted;soundBtn.textContent=music.muted?'🔇':'🔊';if(!music.muted)tryPlay()});
document.addEventListener('pointerdown',tryPlay,{once:true});
setTimeout(()=>{document.querySelector('.heart-draw').classList.add('done');soundBtn.classList.remove('hidden');heartTransition('home');tryPlay()},4400);
