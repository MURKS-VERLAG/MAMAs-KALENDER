'use strict';
const screens=[...document.querySelectorAll('.screen')];
const pagesEl=document.getElementById('calendarPages');
const dotsEl=document.getElementById('pageDots');
const curtain=document.getElementById('heartCurtain');
const STORAGE='mama-kalender-2026-2027-v1';
let entries={};
try{entries=JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{entries={}}
const save=()=>localStorage.setItem(STORAGE,JSON.stringify(entries));
const months=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const weekdays=['So','Mo','Di','Mi','Do','Fr','Sa'];
const romans=['I','II','III'];
const pad=n=>String(n).padStart(2,'0');
const key=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
function show(id){screens.forEach(s=>s.classList.toggle('active',s.id===id))}
function heartTransition(target){
  curtain.innerHTML='';
  const count=36;
  for(let i=0;i<count;i++){
    const h=document.createElement('span'); h.className='fall-heart'; h.textContent='♥';
    h.style.left=`${(i%9)*12-2}%`; h.style.fontSize=`${55+(i%5)*18}px`; h.style.animationDelay=`${Math.floor(i/9)*.08+(i%3)*.025}s`; curtain.appendChild(h);
  }
  setTimeout(()=>show(target),420); setTimeout(()=>curtain.innerHTML='',1450);
}
function buildCalendar(){
  const start=new Date(2026,8,21), end=new Date(2027,8,21);
  let cursor=new Date(start.getFullYear(),start.getMonth(),1), pageIndex=0;
  while(cursor<=end){
    const y=cursor.getFullYear(), m=cursor.getMonth();
    const monthStart=(y===2026&&m===8)?21:1;
    const last=new Date(y,m+1,0).getDate();
    const monthEnd=(y===2027&&m===8)?21:last;
    const ranges=[];
    for(let s=monthStart;s<=monthEnd;s+=10) ranges.push([s,Math.min(s+9,monthEnd)]);
    // Full months always fit into 3 pages: 1-10, 11-20, 21-end. Partial Sep 2026 naturally has 21-30 only.
    ranges.forEach((r,ri)=>{
      const page=document.createElement('article'); page.className='month-page'; page.dataset.index=pageIndex++;
      const title=document.createElement('h2'); title.className='month-title'; title.textContent=`${months[m]} ${y}`;
      const roman=document.createElement('div'); roman.className='roman'; roman.textContent=romans[ri]||String(ri+1);
      const days=document.createElement('div'); days.className='days';
      for(let day=r[0];day<=r[1];day++){
        const d=new Date(y,m,day), k=key(d); const row=document.createElement('div'); row.className='day-row';
        const lab=document.createElement('div'); lab.className='day-label'+([0,6].includes(d.getDay())?' weekend':'');
        lab.innerHTML=`${weekdays[d.getDay()]}, ${pad(day)}.${pad(m+1)}.${day===21&&m===8?' <span class="cake">🎂</span>':''}`;
        const input=document.createElement('input'); input.className='day-input'; input.type='text'; input.inputMode='text'; input.autocomplete='off'; input.placeholder=''; input.value=entries[k]||''; input.setAttribute('aria-label',`Eintrag ${day}. ${months[m]} ${y}`);
        input.addEventListener('input',()=>{entries[k]=input.value;save()});
        row.append(lab,input); days.appendChild(row);
      }
      page.append(title,roman,days); pagesEl.appendChild(page);
      const dot=document.createElement('span');dot.className='dot';dotsEl.appendChild(dot);
    });
    cursor=new Date(y,m+1,1);
  }
  updateDots();
}
function updateDots(){const idx=Math.round(pagesEl.scrollLeft/Math.max(1,pagesEl.clientWidth));[...dotsEl.children].forEach((d,i)=>d.classList.toggle('on',i===idx))}
buildCalendar();
pagesEl.addEventListener('scroll',()=>requestAnimationFrame(updateDots),{passive:true});
window.addEventListener('resize',updateDots);
document.getElementById('calendarBtn').addEventListener('click',()=>heartTransition('calendar'));
document.getElementById('giftBtn').addEventListener('click',()=>heartTransition('gift'));
document.querySelectorAll('[data-home]').forEach(b=>b.addEventListener('click',()=>heartTransition('home')));
setTimeout(()=>{document.querySelector('.heart-draw').classList.add('done');heartTransition('home')},2350);
