/* Scroll-linked choreography. One RAF loop, native scrolling, no loading gate. */
(() => {
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const hero=document.querySelector('.photo-hero'), photo=document.querySelector('.hero-photo'), track=document.querySelector('.name-track');
 const stripes=document.querySelector('.scroll-stripes'), stripeItems=stripes?[...stripes.children]:[];
 const projects=[...document.querySelectorAll('.project-art')];
 const projectSections=[...document.querySelectorAll('.projects-section')];
 const contacts=[...document.querySelectorAll('.contact-section')];
 const wordHeadings=[...document.querySelectorAll('.word-reveal')];
 for(const heading of wordHeadings){for(const node of [...heading.childNodes]){if(node.nodeType!==3)continue;const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(word=>{if(!word.trim()){fragment.append(document.createTextNode(word));return;}const span=document.createElement('span');span.className='word';span.textContent=word;fragment.append(span);});node.replaceWith(fragment);}}
 let frame=0,running=false,heroVisible=true,lastTime=0,marquee=0,lastY=scrollY,velocity=0,stripeGlow=0;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function update(time){
  running=false;const dt=Math.min(48,time-(lastTime||time));lastTime=time;
  const y=scrollY;const distance=y-lastY;lastY=y;velocity=velocity*.8+distance*.2;
  const still=reduced.matches;
  if(hero){const rect=hero.getBoundingClientRect();heroVisible=rect.bottom>0&&rect.top<innerHeight;
   if(photo)photo.style.setProperty('--photo-shift',still?'0px':`${clamp(y*.10,0,45).toFixed(2)}px`);
   if(track){if(!still&&heroVisible)marquee+=dt*.025;const period=track.firstElementChild.getBoundingClientRect().width;const offset=still?0:(marquee+y*.25)%Math.max(1,period);track.style.setProperty('--name-x',`${-offset.toFixed(2)}px`);}
  }
  if(stripes){
   const passedHero=hero?clamp((y-hero.offsetHeight*.65)/(hero.offsetHeight*.4),0,1):1;
   const desired=still?0:passedHero*(.14+clamp(Math.abs(velocity)/20,0,.36));
   stripeGlow+=(desired-stripeGlow)*.13;stripes.style.opacity=stripeGlow.toFixed(3);
   stripeItems.forEach((stripe,i)=>{stripe.style.setProperty('--stripe-x',still?'0px':`${Math.sin(y*.0012+i)*90}px`);stripe.style.setProperty('--stripe-y',still?'0px':`${Math.sin(y*.0007+i)*110+velocity*(i%2?-.8:.8)}px`);});
  }
  projects.forEach((el,index)=>{const r=el.getBoundingClientRect();if(r.bottom< -100||r.top>innerHeight+100)return;
   const progress=clamp((innerHeight-r.top)/(innerHeight+r.height),0,1);
   el.style.setProperty('--art-tilt',still?'0deg':`${((1-progress)*10).toFixed(2)}deg`);
   el.style.setProperty('--art-roll',still?'0deg':`${((index%2?1:-1)*Math.max(0,.5-progress)*5).toFixed(2)}deg`);
   el.style.setProperty('--art-y',still?'0px':`${((.5-progress)*34).toFixed(2)}px`);
   el.style.setProperty('--art-scale',still?'1':`${(.89+.11*Math.sin(progress*Math.PI)).toFixed(4)}`);
   el.style.setProperty('--orbit-angle',still?'-24deg':`${-28+progress*32+(index%2)*18}deg`);
   el.dataset.scrollProgress=progress.toFixed(3);
  });
  projectSections.forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)el.style.setProperty('--project-bg-y',still?'0px':`${clamp(-r.top*.025,-30,100)}px`);});
  contacts.forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)el.style.setProperty('--contact-y',still?'0px':`${clamp((r.top-innerHeight*.3)*.025,-12,15)}px`);});
  wordHeadings.forEach(el=>{const r=el.getBoundingClientRect(),words=[...el.querySelectorAll('.word')];const p=clamp((innerHeight*.9-r.top)/(innerHeight*.55),0,1);words.forEach((word,i)=>word.style.setProperty('--word-opacity',still?'1':String(.25+.75*clamp(p*words.length-i,0,1))));});
  if(!document.hidden&&!still&&(heroVisible&&track||Math.abs(velocity)>.15||Math.abs(stripeGlow-(hero&&y<hero.offsetHeight*.65?0:.14))>.008))schedule();
 }
 function schedule(){if(!running){running=true;frame=requestAnimationFrame(update);}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
 reduced.addEventListener('change',()=>{velocity=0;schedule();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);running=false;}else{lastTime=0;schedule();}});
 const portrait=document.querySelector('.hero-photo img');if(portrait)portrait.addEventListener('error',()=>hero.classList.add('portrait-unavailable'));
 schedule();
})();
