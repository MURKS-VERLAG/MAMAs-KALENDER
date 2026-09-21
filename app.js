'use strict';
/*
ESSENTIAL PATCH ONLY.

In your CURRENT app.js, replace ONLY the existing playOptionA() function with this one.
Nothing else changes.

Requested image order:
- the image that was previously last (a3.png) is now first
- the other two follow in their previous order: a1.png, then a2.png
*/
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
