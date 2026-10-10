/* Scroll ribbons and tap ripples: decorative, bounded, native-scroll effects. */
(() => {
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const ribbons=document.createElement('canvas'),water=document.createElement('canvas');
 ribbons.className='flow-ribbons';water.className='water-ripples';
 for(const canvas of [ribbons,water]){canvas.setAttribute('aria-hidden','true');document.body.append(canvas);}
 const ink=ribbons.getContext('2d'),ripple=water.getContext('2d');
 if(!ink||!ripple){ribbons.remove();water.remove();return;}
 let width=0,height=0,lastY=scrollY,smoothY=scrollY,speed=0,raf=0,previous=0;
 const waves=[];
 function resize(){width=innerWidth;height=innerHeight;const ratio=Math.min(devicePixelRatio||1,2);for(const canvas of [ribbons,water]){canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);canvas.getContext('2d').setTransform(ratio,0,0,ratio,0,0);}schedule();}
 function draw(time){raf=0;const dt=Math.min(40,time-(previous||time));previous=time;
  ink.clearRect(0,0,width,height);ripple.clearRect(0,0,width,height);
  if(reduced.matches)return;
  const delta=scrollY-lastY;lastY=scrollY;speed=speed*.85+delta*.15;
  smoothY+=(scrollY-smoothY)*Math.min(1,dt/100);
  const hero=document.querySelector('.photo-hero');const onset=hero?hero.offsetHeight*.6:0;
  const visibility=Math.max(0,Math.min(1,(smoothY-onset)/250));
  ink.globalAlpha=visibility*.72;ink.lineCap='round';
  for(let i=0;i<3;i++){
   const phase=smoothY*.0015+i*2.2;
   const x=width*(.5+Math.sin(phase)*.55),y=height*(.45+Math.cos(phase*.7)*.48);
   ink.strokeStyle=['#2638ff','#35dfd1','#9e77ff'][i];ink.lineWidth=Math.min(50,Math.max(22,width*.035))*(i===2?.45:1);
   ink.beginPath();ink.moveTo(x-width*.65,y-height*.45);
   ink.bezierCurveTo(x+width*.55,y-height*.65,x+width*.7,y+height*.55+speed*2,x-width*.12,y+height*.2);
   ink.stroke();
  }
  for(let i=waves.length-1;i>=0;i--){const w=waves[i],age=(time-w.time)/1700;if(age>=1){waves.splice(i,1);continue;}
   const radius=10+Math.pow(age,.7)*Math.min(width,height)*.6;
   for(let band=0;band<4;band++){
    ripple.beginPath();ripple.ellipse(w.x,w.y,radius+band*4,Math.max(1,radius*.76+band*3),Math.sin(age*4)*.08,0,Math.PI*2);
    ripple.strokeStyle=['#ffffff','#a4c9ff','#ffcfea','#74dfde'][band];ripple.globalAlpha=(1-age)*.42;ripple.lineWidth=band===0?5:2;ripple.shadowBlur=9;ripple.shadowColor=ripple.strokeStyle;ripple.stroke();
   }
  }
  ripple.shadowBlur=0;ripple.globalAlpha=1;
  if(waves.length||Math.abs(smoothY-scrollY)>.1||Math.abs(speed)>.1)schedule();
 }
 function schedule(){if(!raf&&!document.hidden)raf=requestAnimationFrame(draw);}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize);
 addEventListener('pointerdown',event=>{if(reduced.matches||event.button>0)return;waves.push({x:event.clientX,y:event.clientY,time:performance.now()});if(waves.length>6)waves.shift();schedule();},{passive:true});
 reduced.addEventListener('change',()=>{waves.length=0;smoothY=scrollY;speed=0;schedule();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;waves.length=0;}else{previous=0;schedule();}});
 resize();
})();
