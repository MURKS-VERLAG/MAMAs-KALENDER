'use strict';

/* FAIL-SAFE: Das Intro darf niemals die komplette App blockieren.
   Dieser Timer wird registriert, BEVOR Preloading, Kalender, Pager oder Audio initialisiert werden. */
setTimeout(function(){
  var intro=document.getElementById('intro');
  var home=document.getElementById('home');
  var heart=document.querySelector('.heart-draw');
  var sound=document.getElementById('soundBtn');
  if(heart) heart.classList.add('done');
  if(intro) intro.classList.remove('active');
  if(home) home.classList.add('active');
  if(sound) sound.classList.remove('hidden');
},4400);


const screens=[...document.querySelectorAll('.screen')],
pagesEl=document.getElementById('calendarPages'),
dotsEl=document.getElementById('pageDots'),
giftPagesEl=document.getElementById('giftPages'),
giftDotsEl=document.getElementById('giftDots'),
curtain=document.getElementById('heartCurtain'),
music=document.getElementById('music'),
soundBtn=document.getElementById('soundBtn'),
storyStage=document.getElementById('storyStage');

/* Bilder sofort laden. Kein Promise.allSettled: unnötig und auf älteren Safaris problematisch. */
const STORY_ASSETS=[
  'assets/a1.png','assets/a2.png','assets/a3.png','assets/a4.png',
  'assets/a5.png','assets/a6.png','assets/a7.png','assets/a8.png'
];
const STORY_PRELOADERS=STORY_ASSETS.map(src=>{
  const img=new Image();
  img.src=src;
  if('decoding' in img) img.decoding='async';
  if('fetchPriority' in img) img.fetchPriority='high';
  if(typeof img.decode==='function'){
    try{img.decode().catch(()=>{});}catch(e){}
  }
  return img;
});

const STORAGE='mama-kalender-2026-2027-v1';
let entries={};
try{entries=JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{entries={}}
const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(entries))}catch(e){}};

const months=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
weekdays=['So','Mo','Di','Mi','Do','Fr','Sa'],
romans=['I','II','III'],
pad=n=>String(n).padStart(2,'0'),
key=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

let storyTimers=[];
function clearStory(){
  storyTimers.forEach(clearTimeout);
  storyTimers=[];
  storyStage.innerHTML='';
}
const later=(fn,ms)=>storyTimers.push(setTimeout(fn,ms));

function show(id){
  screens.forEach(s=>s.classList.toggle('active',s.id===id));
  if(id==='album')startTypewriter();
  if(id!=='giftStory')clearStory();
}

function heartTransition(target){
  curtain.innerHTML='';
  curtain.classList.add('running');
  for(let i=0;i<45;i++){
    const h=document.createElement('span');
    h.className='fall-heart';
    h.textContent='♥';
    h.style.left=`${(i%9)*12-2}%`;
    h.style.fontSize=`${48+(i%5)*17}px`;
    h.style.animationDelay=`${Math.floor(i/9)*.15+(i%3)*.05}s`;
    curtain.appendChild(h);
  }
  setTimeout(()=>show(target),850);
  setTimeout(()=>{
    curtain.innerHTML='';
    curtain.classList.remove('running');
  },2850);
}

function addDot(t){
  const d=document.createElement('span');
  d.className='dot';
  t.appendChild(d);
}

function createPager(track,dots){
  let index=0,startX=0,startY=0,tracking=false;
  const viewport=track.parentElement;

  function pageWidth(){
    return viewport.getBoundingClientRect().width||window.innerWidth;
  }

  function apply(animate){
    const w=pageWidth();
    const transition=animate?'transform .42s cubic-bezier(.22,.61,.36,1)':'none';
    const transform=`translate3d(${-index*w}px,0,0)`;
    track.style.transition=transition;
    track.style.webkitTransition=animate?'-webkit-transform .42s cubic-bezier(.22,.61,.36,1)':'none';
    track.style.transform=transform;
    track.style.webkitTransform=transform;
    [...dots.children].forEach((d,i)=>d.classList.toggle('on',i===index));
  }

  function begin(x,y){
    tracking=true;
    startX=x;
    startY=y;
  }

  function end(x,y){
    if(!tracking)return;
    tracking=false;
    const dx=x-startX,dy=y-startY;
    if(Math.abs(dx)>=50&&Math.abs(dx)>Math.abs(dy)*1.15){
      index=Math.max(0,Math.min(track.children.length-1,index+(dx<0?1:-1)));
      apply(true);
    }
  }

  viewport.addEventListener('touchstart',e=>{
    if(e.touches.length===1)begin(e.touches[0].clientX,e.touches[0].clientY);
  },{passive:true});

  viewport.addEventListener('touchend',e=>{
    if(e.changedTouches.length)end(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
  },{passive:true});

  viewport.addEventListener('touchcancel',()=>tracking=false,{passive:true});

  /* Desktop-Maus bleibt erhalten; iPhone/Safari benutzt ausschließlich Touch oben. */
  viewport.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse')begin(e.clientX,e.clientY);
  });
  viewport.addEventListener('pointerup',e=>{
    if(e.pointerType==='mouse')end(e.clientX,e.clientY);
  });

  window.addEventListener('resize',()=>apply(false),{passive:true});
  apply(false);

  return{
    reset(){
      index=0;
      requestAnimationFrame(()=>apply(false));
    },
    refresh(){
      requestAnimationFrame(()=>apply(false));
    }
  };
}

function buildCalendar(){
  const end=new Date(2027,8,21);
  let cursor=new Date(2026,8,1);

  while(cursor<=end){
    const y=cursor.getFullYear(),m=cursor.getMonth(),last=new Date(y,m+1,0).getDate();
    let ranges;

    if(y===2026&&m===8)ranges=[[21,30,2]];
    else if(y===2027&&m===8)ranges=[[1,10,0],[11,20,1],[21,21,2]];
    else ranges=[[1,10,0],[11,20,1],[21,last,2]];

    ranges.forEach(([from,to,ri])=>{
      const p=document.createElement('article');
      p.className='month-page';
      p.innerHTML=`<h2 class="month-title">${months[m]} ${y}</h2><div class="roman">${romans[ri]}</div><div class="days"></div>`;

      const days=p.querySelector('.days');

      for(let day=from;day<=to;day++){
        const d=new Date(y,m,day),k=key(d),row=document.createElement('div');
        row.className='day-row';

        const lab=document.createElement('div');
        lab.className='day-label'+([0,6].includes(d.getDay())?' weekend':'');
        lab.innerHTML=`${weekdays[d.getDay()]}, ${pad(day)}.${pad(m+1)}.${day===21&&m===8?' <span class="cake">🎂</span>':''}`;

        const input=document.createElement('input');
        input.className='day-input';
        input.type='text';
        input.inputMode='text';
        input.autocomplete='off';
        input.value=entries[k]||'';
        input.addEventListener('input',()=>{
          entries[k]=input.value;
          save();
        });

        row.append(lab,input);
        days.appendChild(row);
      }

      pagesEl.appendChild(p);
      addDot(dotsEl);
    });

    cursor=new Date(y,m+1,1);
  }
}

function buildGifts(){
  let cursor=new Date(2026,8,1),end=new Date(2027,8,1);

  while(cursor<=end){
    const y=cursor.getFullYear(),m=cursor.getMonth(),unlocked=y===2026&&m===8;
    const p=document.createElement('article');
    p.className='gift-page'+(unlocked?'':' locked');
    p.innerHTML=`<h2 class="gift-month">${months[m]} ${y}</h2><div class="gift-choice"><button type="button" class="choice choice-a">A</button><button type="button" class="choice choice-b">B</button>${unlocked?'':'<div class="lock-overlay">🔒</div>'}</div>`;

    if(unlocked){
      p.querySelector('.choice-a').addEventListener('click',e=>{
        e.preventDefault();
        e.stopPropagation();
        playOptionA();
      });
      p.querySelector('.choice-b').addEventListener('click',e=>{
        e.preventDefault();
        e.stopPropagation();
        playOptionB();
      });
    }else{
      p.querySelectorAll('.choice').forEach(b=>b.disabled=true);
    }

    giftPagesEl.appendChild(p);
    addDot(giftDotsEl);
    cursor=new Date(y,m+1,1);
  }
}

let typingTimer;
function startTypewriter(){
  clearInterval(typingTimer);
  const t=document.getElementById('typewriterText'),
        h=document.querySelector('.album-heart'),
        text='Hier werden zukünftig Bilder, die wir auf den Ausflügen schießen, hinterlegt.';
  let i=0;

  t.textContent='';
  t.classList.add('typing-caret');
  h.classList.remove('show');

  typingTimer=setInterval(()=>{
    t.textContent+=text[i++]||'';
    if(i>=text.length){
      clearInterval(typingTimer);
      t.classList.remove('typing-caret');
      setTimeout(()=>h.classList.add('show'),350);
    }
  },110);
}

function frame(src,klass=''){
  const im=document.createElement('img');
  im.className='story-image '+klass;
  im.loading='eager';
  if('decoding' in im)im.decoding='async';
  if('fetchPriority' in im)im.fetchPriority='high';
  im.src=src;
  return im;
}

function caption(txt,klass=''){
  const d=document.createElement('div');
  d.className='story-caption '+klass;
  d.textContent=txt;
  return d;
}

function setFrame(src){
  const old=storyStage.querySelector('.story-image.current');
  const im=frame(src,'current');
  storyStage.appendChild(im);

  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>im.classList.add('visible'));
  });

  if(old){
    old.classList.remove('visible');
    later(()=>old.remove(),900);
  }
}

function typeCaption(text){
  const d=caption('','type-story');
  storyStage.appendChild(d);
  let i=0;
  const tick=()=>{
    if(i<text.length){
      d.textContent+=text[i++];
      later(tick,42);
    }
  };
  tick();
  return d;
}

/* KORREKTE OPTION-A-REIHENFOLGE: bisher letztes Bild zuerst. */
function playOptionA(){
  clearStory();
  show('giftStory');

  setFrame('assets/a3.png');
  const c=typeCaption('OPTION A: Wanderung mit Start am Teufelsschuppen und dortigem Picknick.');

  later(()=>{
    setFrame('assets/a1.png');
    c.remove();
    typeCaption('Ziel 1: Bärenburg - Ramsbach.');
  },5000);

  later(()=>{
    setFrame('assets/a2.png');
    storyStage.querySelectorAll('.story-caption').forEach(x=>x.remove());
    typeCaption('Ziel 2: Ruine Neuenstein - Hubacker');
  },10000);
}

function playOptionB(){
  clearStory();
  show('giftStory');
  setFrame('assets/a4.png');

  const film=caption('FILMABEND!','film-title');
  storyStage.appendChild(film);
  requestAnimationFrame(()=>film.classList.add('visible'));

  later(()=>setFrame('assets/a5.png'),2000);
  later(()=>setFrame('assets/a6.png'),4000);

  later(()=>{
    film.classList.remove('visible');
    later(()=>film.remove(),650);

    const c=caption('Für Pasta und Snacks wird gesorgt.','food-copy');
    storyStage.appendChild(c);
    requestAnimationFrame(()=>c.classList.add('visible'));

    later(()=>{
      c.classList.remove('visible');
      later(()=>{
        c.remove();
        const food=document.createElement('div');
        food.className='food-pair';
        food.append(frame('assets/a7.png'),frame('assets/a8.png'));
        storyStage.appendChild(food);
        requestAnimationFrame(()=>food.classList.add('visible'));
      },700);
    },3000);
  },6000);
}

function tryPlay(){
  if(!music.muted){
    const p=music.play();
    if(p&&typeof p.catch==='function')p.catch(()=>{});
  }
}

buildCalendar();
buildGifts();

const calendarPager=createPager(pagesEl,dotsEl),
      giftPager=createPager(giftPagesEl,giftDotsEl);

document.getElementById('calendarBtn').onclick=()=>{
  calendarPager.reset();
  heartTransition('calendar');
  tryPlay();
};

document.getElementById('albumBtn').onclick=()=>{
  heartTransition('album');
  tryPlay();
};

document.getElementById('giftBtn').onclick=()=>{
  giftPager.reset();
  heartTransition('gift');
  tryPlay();
};

document.querySelectorAll('[data-home]').forEach(b=>{
  b.onclick=()=>heartTransition('home');
});

soundBtn.onclick=()=>{
  music.muted=!music.muted;
  soundBtn.textContent=music.muted?'🔇':'🔊';
  if(!music.muted)tryPlay();
};

/* iOS/Safari darf Audio erst nach echter Benutzerinteraktion starten. */
function unlockAudio(){
  tryPlay();
  document.removeEventListener('touchstart',unlockAudio);
  document.removeEventListener('click',unlockAudio);
}
document.addEventListener('touchstart',unlockAudio,{passive:true});
document.addEventListener('click',unlockAudio);

setTimeout(()=>{
  document.querySelector('.heart-draw').classList.add('done');
  soundBtn.classList.remove('hidden');
  show('home');
},4400);