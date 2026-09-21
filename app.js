'use strict';

var screens=[].slice.call(document.querySelectorAll('.screen'));
var pagesEl=document.getElementById('calendarPages');
var dotsEl=document.getElementById('pageDots');
var giftPagesEl=document.getElementById('giftPages');
var giftDotsEl=document.getElementById('giftDots');
var curtain=document.getElementById('heartCurtain');
var music=document.getElementById('music');
var soundBtn=document.getElementById('soundBtn');
var storyStage=document.getElementById('storyStage');

var STORY_ASSETS=['assets/a1.png','assets/a2.png','assets/a3.png','assets/a4.png','assets/a5.png','assets/a6.png','assets/a7.png','assets/a8.png'];
var STORY_PRELOADERS=[];
function preloadStoryAssets(){
  for(var i=0;i<STORY_ASSETS.length;i++){
    var img=new Image();
    img.src=STORY_ASSETS[i];
    if('decoding' in img) img.decoding='async';
    if('fetchPriority' in img) img.fetchPriority='high';
    if(img.decode){try{img.decode().catch(function(){});}catch(e){}}
    STORY_PRELOADERS.push(img);
  }
}
preloadStoryAssets();

var STORAGE='mama-kalender-2026-2027-v1';
var entries={};
try{entries=JSON.parse(localStorage.getItem(STORAGE)||'{}')||{};}catch(e){entries={};}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(entries));}catch(e){}}

var months=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
var weekdays=['So','Mo','Di','Mi','Do','Fr','Sa'];
var romans=['I','II','III'];
function pad(n){return String(n).padStart?String(n).padStart(2,'0'):('0'+n).slice(-2);}
function key(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}

var storyTimers=[];
function clearStory(){
  for(var i=0;i<storyTimers.length;i++) clearTimeout(storyTimers[i]);
  storyTimers=[];
  if(storyStage) storyStage.innerHTML='';
}
function later(fn,ms){var id=setTimeout(fn,ms);storyTimers.push(id);return id;}

function show(id){
  for(var i=0;i<screens.length;i++) screens[i].classList.toggle('active',screens[i].id===id);
  if(id==='album') startTypewriter();
  if(id!=='giftStory') clearStory();
}
function heartTransition(target){
  curtain.innerHTML='';
  curtain.classList.add('running');
  for(var i=0;i<45;i++){
    var h=document.createElement('span');
    h.className='fall-heart';h.textContent='♥';
    h.style.left=((i%9)*12-2)+'%';
    h.style.fontSize=(48+(i%5)*17)+'px';
    h.style.animationDelay=(Math.floor(i/9)*.15+(i%3)*.05)+'s';
    curtain.appendChild(h);
  }
  setTimeout(function(){show(target);},850);
  setTimeout(function(){curtain.innerHTML='';curtain.classList.remove('running');},2850);
}
function addDot(t){var d=document.createElement('span');d.className='dot';t.appendChild(d);}

function createPager(track,dots){
  var index=0,startX=0,startY=0,tracking=false;
  var viewport=track.parentElement;
  function pageWidth(){var r=viewport.getBoundingClientRect();return r.width||window.innerWidth||1;}
  function apply(animate){
    var w=pageWidth();
    track.style.webkitTransition=animate?'-webkit-transform .42s cubic-bezier(.22,.61,.36,1)':'none';
    track.style.transition=animate?'transform .42s cubic-bezier(.22,.61,.36,1)':'none';
    var tr='translate3d('+(-index*w)+'px,0,0)';
    track.style.webkitTransform=tr;
    track.style.transform=tr;
    var ds=dots.children;
    for(var i=0;i<ds.length;i++) ds[i].classList.toggle('on',i===index);
  }
  function begin(x,y){tracking=true;startX=x;startY=y;}
  function end(x,y){
    if(!tracking)return;
    tracking=false;
    var dx=x-startX,dy=y-startY;
    if(Math.abs(dx)>=50&&Math.abs(dx)>Math.abs(dy)*1.15){
      index=Math.max(0,Math.min(track.children.length-1,index+(dx<0?1:-1)));
      apply(true);
    }
  }
  viewport.addEventListener('touchstart',function(e){
    if(e.touches&&e.touches.length===1) begin(e.touches[0].clientX,e.touches[0].clientY);
  },{passive:true});
  viewport.addEventListener('touchend',function(e){
    if(e.changedTouches&&e.changedTouches.length) end(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
  },{passive:true});
  viewport.addEventListener('touchcancel',function(){tracking=false;},{passive:true});
  window.addEventListener('resize',function(){apply(false);},{passive:true});
  apply(false);
  return {
    reset:function(){index=0;requestAnimationFrame(function(){apply(false);});},
    refresh:function(){requestAnimationFrame(function(){apply(false);});}
  };
}

function buildCalendar(){
  var end=new Date(2027,8,21),cursor=new Date(2026,8,1);
  while(cursor<=end){
    var y=cursor.getFullYear(),m=cursor.getMonth(),last=new Date(y,m+1,0).getDate(),ranges;
    if(y===2026&&m===8) ranges=[[21,30,2]];
    else if(y===2027&&m===8) ranges=[[1,10,0],[11,20,1],[21,21,2]];
    else ranges=[[1,10,0],[11,20,1],[21,last,2]];
    for(var r=0;r<ranges.length;r++){
      (function(from,to,ri,year,month){
        var p=document.createElement('article');p.className='month-page';
        p.innerHTML='<h2 class="month-title">'+months[month]+' '+year+'</h2><div class="roman">'+romans[ri]+'</div><div class="days"></div>';
        var days=p.querySelector('.days');
        for(var day=from;day<=to;day++){
          (function(dayNum){
            var d=new Date(year,month,dayNum),k=key(d),row=document.createElement('div');
            row.className='day-row';
            var lab=document.createElement('div');
            lab.className='day-label'+(([0,6].indexOf(d.getDay())!==-1)?' weekend':'');
            lab.innerHTML=weekdays[d.getDay()]+', '+pad(dayNum)+'.'+pad(month+1)+'.'+(dayNum===21&&month===8?' <span class="cake">🎂</span>':'');
            var input=document.createElement('input');
            input.className='day-input';input.type='text';input.setAttribute('inputmode','text');input.autocomplete='off';input.value=entries[k]||'';
            input.addEventListener('input',function(){entries[k]=input.value;save();});
            row.appendChild(lab);row.appendChild(input);days.appendChild(row);
          })(day);
        }
        pagesEl.appendChild(p);addDot(dotsEl);
      })(ranges[r][0],ranges[r][1],ranges[r][2],y,m);
    }
    cursor=new Date(y,m+1,1);
  }
}

function buildGifts(){
  var cursor=new Date(2026,8,1),end=new Date(2027,8,1);
  while(cursor<=end){
    var y=cursor.getFullYear(),m=cursor.getMonth(),unlocked=(y===2026&&m===8);
    var p=document.createElement('article');
    p.className='gift-page'+(unlocked?'':' locked');
    p.innerHTML='<h2 class="gift-month">'+months[m]+' '+y+'</h2><div class="gift-choice"><button type="button" class="choice choice-a">A</button><button type="button" class="choice choice-b">B</button>'+(unlocked?'':'<div class="lock-overlay">🔒</div>')+'</div>';
    var a=p.querySelector('.choice-a'),b=p.querySelector('.choice-b');
    if(unlocked){
      a.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();playOptionA();});
      b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();playOptionB();});
    }else{a.disabled=true;b.disabled=true;}
    giftPagesEl.appendChild(p);addDot(giftDotsEl);
    cursor=new Date(y,m+1,1);
  }
}

var typingTimer=null;
function startTypewriter(){
  clearInterval(typingTimer);
  var t=document.getElementById('typewriterText'),h=document.querySelector('.album-heart');
  var text='Hier werden zukünftig Bilder, die wir auf den Ausflügen schießen, hinterlegt.',i=0;
  t.textContent='';t.classList.add('typing-caret');h.classList.remove('show');
  typingTimer=setInterval(function(){
    t.textContent+=text.charAt(i);i++;
    if(i>=text.length){clearInterval(typingTimer);t.classList.remove('typing-caret');setTimeout(function(){h.classList.add('show');},350);}
  },110);
}
function frame(src,klass){
  var im=document.createElement('img');im.className='story-image '+(klass||'');
  im.setAttribute('loading','eager');im.src=src;
  if('decoding' in im) im.decoding='async';
  if('fetchPriority' in im) im.fetchPriority='high';
  return im;
}
function caption(txt,klass){var d=document.createElement('div');d.className='story-caption '+(klass||'');d.textContent=txt;return d;}
function setFrame(src){
  var old=storyStage.querySelector('.story-image.current'),im=frame(src,'current');
  storyStage.appendChild(im);
  requestAnimationFrame(function(){requestAnimationFrame(function(){im.classList.add('visible');});});
  if(old){old.classList.remove('visible');later(function(){if(old.parentNode)old.parentNode.removeChild(old);},900);}
}
function typeCaption(text){
  var d=caption('','type-story');storyStage.appendChild(d);var i=0;
  function tick(){if(i<text.length){d.textContent+=text.charAt(i++);later(tick,42);}}
  tick();return d;
}

/* Option A: requested order a3 -> a1 -> a2. */
function playOptionA(){
  clearStory();show('giftStory');
  setFrame('assets/a3.png');
  var c=typeCaption('OPTION A: Wanderung mit Start am Teufelsschuppen und dortigem Picknick.');
  later(function(){
    setFrame('assets/a1.png');
    if(c&&c.parentNode)c.parentNode.removeChild(c);
    typeCaption('Ziel 1: Bärenburg - Ramsbach.');
  },5000);
  later(function(){
    setFrame('assets/a2.png');
    var caps=storyStage.querySelectorAll('.story-caption');
    for(var i=0;i<caps.length;i++) if(caps[i].parentNode)caps[i].parentNode.removeChild(caps[i]);
    typeCaption('Ziel 2: Ruine Neuenstein - Hubacker');
  },10000);
}
function playOptionB(){
  clearStory();show('giftStory');setFrame('assets/a4.png');
  var film=caption('FILMABEND!','film-title');storyStage.appendChild(film);
  requestAnimationFrame(function(){film.classList.add('visible');});
  later(function(){setFrame('assets/a5.png');},2000);
  later(function(){setFrame('assets/a6.png');},4000);
  later(function(){
    film.classList.remove('visible');
    later(function(){if(film.parentNode)film.parentNode.removeChild(film);},650);
    var c=caption('Für Pasta und Snacks wird gesorgt.','food-copy');storyStage.appendChild(c);
    requestAnimationFrame(function(){c.classList.add('visible');});
    later(function(){
      c.classList.remove('visible');
      later(function(){
        if(c.parentNode)c.parentNode.removeChild(c);
        var food=document.createElement('div');food.className='food-pair';
        food.appendChild(frame('assets/a7.png',''));food.appendChild(frame('assets/a8.png',''));
        storyStage.appendChild(food);requestAnimationFrame(function(){food.classList.add('visible');});
      },700);
    },3000);
  },6000);
}
function tryPlay(){if(!music.muted){var p=music.play();if(p&&p.catch)p.catch(function(){});}}

buildCalendar();buildGifts();
var calendarPager=createPager(pagesEl,dotsEl),giftPager=createPager(giftPagesEl,giftDotsEl);
document.getElementById('calendarBtn').onclick=function(){calendarPager.reset();heartTransition('calendar');tryPlay();};
document.getElementById('albumBtn').onclick=function(){heartTransition('album');tryPlay();};
document.getElementById('giftBtn').onclick=function(){giftPager.reset();heartTransition('gift');tryPlay();};
var homeBtns=document.querySelectorAll('[data-home]');
for(var hb=0;hb<homeBtns.length;hb++)homeBtns[hb].onclick=function(){heartTransition('home');};
soundBtn.onclick=function(){music.muted=!music.muted;soundBtn.textContent=music.muted?'🔇':'🔊';if(!music.muted)tryPlay();};

/* iOS Safari: audio playback must be unlocked by a real user gesture. */
var unlockAudio=function(){
  tryPlay();
  document.removeEventListener('touchstart',unlockAudio,false);
  document.removeEventListener('click',unlockAudio,false);
};
document.addEventListener('touchstart',unlockAudio,false);
document.addEventListener('click',unlockAudio,false);

setTimeout(function(){
  var hd=document.querySelector('.heart-draw');if(hd)hd.classList.add('done');
  soundBtn.classList.remove('hidden');heartTransition('home');
},4400);
