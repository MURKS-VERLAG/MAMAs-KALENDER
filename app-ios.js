'use strict';
(function(){
var screens=Array.prototype.slice.call(document.querySelectorAll('.screen'));
var pagesEl=document.getElementById('calendarPages'),dotsEl=document.getElementById('pageDots');
var giftPagesEl=document.getElementById('giftPages'),giftDotsEl=document.getElementById('giftDots');
var curtain=document.getElementById('heartCurtain'),music=document.getElementById('music');
var soundBtn=document.getElementById('soundBtn'),storyStage=document.getElementById('storyStage');

var STORY_ASSETS=['assets/a1.png','assets/a2.png','assets/a3.png','assets/a4.png','assets/a5.png','assets/a6.png','assets/a7.png','assets/a8.png'];
var STORY_PRELOADERS=[];
for(var pi=0;pi<STORY_ASSETS.length;pi++){
  var pre=new Image();
  pre.src=STORY_ASSETS[pi];
  STORY_PRELOADERS.push(pre);
}

var STORAGE='mama-kalender-2026-2027-v1',entries={};
try{entries=JSON.parse(localStorage.getItem(STORAGE)||'{}')||{};}catch(e){entries={};}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(entries));}catch(e){}}

var months=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
var weekdays=['So','Mo','Di','Mi','Do','Fr','Sa'],romans=['I','II','III'];
function pad(n){return n<10?'0'+n:String(n);}
function key(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}

var storyTimers=[];
function later(fn,ms){var id=setTimeout(fn,ms);storyTimers.push(id);return id;}
function clearStory(){for(var i=0;i<storyTimers.length;i++)clearTimeout(storyTimers[i]);storyTimers=[];storyStage.innerHTML='';}
function show(id){
  for(var i=0;i<screens.length;i++){
    if(screens[i].id===id)screens[i].classList.add('active');else screens[i].classList.remove('active');
  }
  if(id==='album')startTypewriter();
  if(id!=='giftStory')clearStory();
}
function heartTransition(target){
  curtain.innerHTML='';curtain.classList.add('running');
  for(var i=0;i<45;i++){
    var h=document.createElement('span');h.className='fall-heart';h.innerHTML='♥';
    h.style.left=((i%9)*12-2)+'%';h.style.fontSize=(48+(i%5)*17)+'px';
    h.style.animationDelay=(Math.floor(i/9)*.15+(i%3)*.05)+'s';
    h.style.webkitAnimationDelay=h.style.animationDelay;curtain.appendChild(h);
  }
  setTimeout(function(){show(target);},850);
  setTimeout(function(){curtain.innerHTML='';curtain.classList.remove('running');},2850);
}
function addDot(t){var d=document.createElement('span');d.className='dot';t.appendChild(d);}

function createPager(track,dots){
  var index=0,startX=0,startY=0,tracking=false,viewport=track.parentNode;
  function width(){var r=viewport.getBoundingClientRect();return r.width||window.innerWidth||320;}
  function apply(anim){
    var tr='translate3d('+(-index*width())+'px,0,0)';
    var ts=anim?'transform .42s cubic-bezier(.22,.61,.36,1)':'none';
    track.style.transition=ts;track.style.webkitTransition=anim?'-webkit-transform .42s cubic-bezier(.22,.61,.36,1)':'none';
    track.style.transform=tr;track.style.webkitTransform=tr;
    for(var i=0;i<dots.children.length;i++){
      if(i===index)dots.children[i].classList.add('on');else dots.children[i].classList.remove('on');
    }
  }
  function begin(x,y){tracking=true;startX=x;startY=y;}
  function end(x,y){
    if(!tracking)return;tracking=false;
    var dx=x-startX,dy=y-startY;
    if(Math.abs(dx)>=50&&Math.abs(dx)>Math.abs(dy)*1.15){
      index=Math.max(0,Math.min(track.children.length-1,index+(dx<0?1:-1)));apply(true);
    }
  }
  viewport.addEventListener('touchstart',function(e){if(e.touches.length===1)begin(e.touches[0].clientX,e.touches[0].clientY);},false);
  viewport.addEventListener('touchend',function(e){if(e.changedTouches.length)end(e.changedTouches[0].clientX,e.changedTouches[0].clientY);},false);
  viewport.addEventListener('touchcancel',function(){tracking=false;},false);
  window.addEventListener('resize',function(){apply(false);},false);
  apply(false);
  return {reset:function(){index=0;setTimeout(function(){apply(false);},0);},refresh:function(){setTimeout(function(){apply(false);},0);}};
}

function buildCalendar(){
  var end=new Date(2027,8,21),cursor=new Date(2026,8,1);
  while(cursor<=end){
    var y=cursor.getFullYear(),m=cursor.getMonth(),last=new Date(y,m+1,0).getDate(),ranges;
    if(y===2026&&m===8)ranges=[[21,30,2]];
    else if(y===2027&&m===8)ranges=[[1,10,0],[11,20,1],[21,21,2]];
    else ranges=[[1,10,0],[11,20,1],[21,last,2]];
    for(var r=0;r<ranges.length;r++){
      var from=ranges[r][0],to=ranges[r][1],ri=ranges[r][2];
      var p=document.createElement('article');p.className='month-page';
      p.innerHTML='<h2 class="month-title">'+months[m]+' '+y+'</h2><div class="roman">'+romans[ri]+'</div><div class="days"></div>';
      var days=p.querySelector('.days');
      for(var day=from;day<=to;day++){
        (function(dayNum,year,month){
          var d=new Date(year,month,dayNum),k=key(d),row=document.createElement('div');row.className='day-row';
          var lab=document.createElement('div');lab.className='day-label'+((d.getDay()===0||d.getDay()===6)?' weekend':'');
          lab.innerHTML=weekdays[d.getDay()]+', '+pad(dayNum)+'.'+pad(month+1)+'.'+(dayNum===21&&month===8?' <span class="cake">🎂</span>':'');
          var input=document.createElement('input');input.className='day-input';input.type='text';input.value=entries[k]||'';
          input.setAttribute('inputmode','text');input.setAttribute('autocomplete','off');
          input.addEventListener('input',function(){entries[k]=input.value;save();},false);
          row.appendChild(lab);row.appendChild(input);days.appendChild(row);
        })(day,y,m);
      }
      pagesEl.appendChild(p);addDot(dotsEl);
    }
    cursor=new Date(y,m+1,1);
  }
}

function buildGifts(){
  var cursor=new Date(2026,8,1),end=new Date(2027,8,1);
  while(cursor<=end){
    var y=cursor.getFullYear(),m=cursor.getMonth(),unlocked=(y===2026&&m===8);
    var p=document.createElement('article');p.className='gift-page'+(unlocked?'':' locked');
    p.innerHTML='<h2 class="gift-month">'+months[m]+' '+y+'</h2><div class="gift-choice"><button type="button" class="choice choice-a">A</button><button type="button" class="choice choice-b">B</button>'+(unlocked?'':'<div class="lock-overlay">🔒</div>')+'</div>';
    var a=p.querySelector('.choice-a'),b=p.querySelector('.choice-b');
    if(unlocked){
      a.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();playOptionA();},false);
      b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();playOptionB();},false);
    }else{a.disabled=true;b.disabled=true;}
    giftPagesEl.appendChild(p);addDot(giftDotsEl);cursor=new Date(y,m+1,1);
  }
}

var typingTimer=null;
function startTypewriter(){
  clearInterval(typingTimer);
  var t=document.getElementById('typewriterText'),h=document.querySelector('.album-heart');
  var text='Hier werden zukünftig Bilder, die wir auf den Ausflügen schießen, hinterlegt.',i=0;
  t.innerHTML='';t.classList.add('typing-caret');h.classList.remove('show');
  typingTimer=setInterval(function(){
    t.appendChild(document.createTextNode(text.charAt(i)));i++;
    if(i>=text.length){clearInterval(typingTimer);t.classList.remove('typing-caret');setTimeout(function(){h.classList.add('show');},350);}
  },110);
}
function frame(src,klass){
  var im=document.createElement('img');im.className='story-image '+(klass||'');im.src=src;return im;
}
function caption(txt,klass){var d=document.createElement('div');d.className='story-caption '+(klass||'');d.innerHTML=txt;return d;}
function setFrame(src){
  var old=storyStage.querySelector('.story-image.current'),im=frame(src,'current');storyStage.appendChild(im);
  setTimeout(function(){im.classList.add('visible');},20);
  if(old){old.classList.remove('visible');later(function(){if(old.parentNode)old.parentNode.removeChild(old);},900);}
}
function typeCaption(text){
  var d=caption('','type-story');storyStage.appendChild(d);var i=0;
  function tick(){if(i<text.length){d.appendChild(document.createTextNode(text.charAt(i)));i++;later(tick,42);}}
  tick();return d;
}
function playOptionA(){
  clearStory();show('giftStory');setFrame('assets/a3.png');
  var c=typeCaption('OPTION A: Wanderung mit Start am Teufelsschuppen und dortigem Picknick.');
  later(function(){setFrame('assets/a1.png');if(c.parentNode)c.parentNode.removeChild(c);typeCaption('Ziel 1: Bärenburg - Ramsbach.');},5000);
  later(function(){
    setFrame('assets/a2.png');var caps=storyStage.querySelectorAll('.story-caption');
    for(var i=0;i<caps.length;i++)if(caps[i].parentNode)caps[i].parentNode.removeChild(caps[i]);
    typeCaption('Ziel 2: Ruine Neuenstein - Hubacker');
  },10000);
}
function playOptionB(){
  clearStory();show('giftStory');setFrame('assets/a4.png');
  var film=caption('FILMABEND!','film-title');storyStage.appendChild(film);setTimeout(function(){film.classList.add('visible');},20);
  later(function(){setFrame('assets/a5.png');},2000);later(function(){setFrame('assets/a6.png');},4000);
  later(function(){
    film.classList.remove('visible');later(function(){if(film.parentNode)film.parentNode.removeChild(film);},650);
    var c=caption('Für Pasta und Snacks wird gesorgt.','food-copy');storyStage.appendChild(c);setTimeout(function(){c.classList.add('visible');},20);
    later(function(){
      c.classList.remove('visible');
      later(function(){
        if(c.parentNode)c.parentNode.removeChild(c);
        var food=document.createElement('div');food.className='food-pair';
        food.appendChild(frame('assets/a7.png',''));food.appendChild(frame('assets/a8.png',''));
        storyStage.appendChild(food);setTimeout(function(){food.classList.add('visible');},20);
      },700);
    },3000);
  },6000);
}
function tryPlay(){try{var p=music.play();if(p&&p.catch)p.catch(function(){});}catch(e){}}

buildCalendar();buildGifts();
var calendarPager=createPager(pagesEl,dotsEl),giftPager=createPager(giftPagesEl,giftDotsEl);
document.getElementById('calendarBtn').onclick=function(){calendarPager.reset();heartTransition('calendar');tryPlay();};
document.getElementById('albumBtn').onclick=function(){heartTransition('album');tryPlay();};
document.getElementById('giftBtn').onclick=function(){giftPager.reset();heartTransition('gift');tryPlay();};
var homes=document.querySelectorAll('[data-home]');
for(var hi=0;hi<homes.length;hi++)homes[hi].onclick=function(){heartTransition('home');};
soundBtn.onclick=function(){music.muted=!music.muted;soundBtn.innerHTML=music.muted?'🔇':'🔊';if(!music.muted)tryPlay();};
function unlock(){tryPlay();document.removeEventListener('touchstart',unlock,false);document.removeEventListener('click',unlock,false);}
document.addEventListener('touchstart',unlock,false);document.addEventListener('click',unlock,false);
setTimeout(function(){
  var heart=document.querySelector('.heart-draw');if(heart)heart.classList.add('done');
  soundBtn.classList.remove('hidden');heartTransition('home');
},4400);
})();