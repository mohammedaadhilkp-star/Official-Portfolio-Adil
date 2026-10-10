/* Full-screen multilingual preloader on every home-page load. */
(() => {
 'use strict';
 const root=document.documentElement;
 root.classList.add('welcome-pending','preloader-active');
 let modal,timer,closed=false;
 const failSafe=setTimeout(finish,5000);
 function finish(){
  if(closed)return;closed=true;clearTimeout(timer);clearTimeout(failSafe);
  root.classList.remove('welcome-pending');
  if(modal){modal.close();modal.remove();}
  root.classList.remove('preloader-active');
 }
 function start(){
  modal=document.createElement('dialog');modal.className='welcome-screen';modal.setAttribute('aria-label','Loading Mohammed Adil’s portfolio');
  const word=document.createElement('span');word.className='welcome-word';word.textContent='Hello';word.lang='en';word.setAttribute('aria-hidden','true');
  const skip=document.createElement('button');skip.className='welcome-skip';skip.textContent='→';skip.setAttribute('aria-label','Continue to website');skip.addEventListener('click',finish);
  modal.append(word,skip);document.body.append(modal);
  if(typeof modal.showModal!=='function'){finish();return;}
  modal.addEventListener('cancel',event=>{event.preventDefault();finish();});
  modal.showModal();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const greetings=[['Hello','en'],['Bonjour','fr'],['Welkom','nl'],['Hola','es'],['Ciao','it'],['Olá','pt'],['Hallo','de'],['नमस्ते','hi'],['നമസ്കാരം','ml'],['こんにちは','ja'],['مرحباً','ar'],['你好','zh'],['Hello','en']];
  let index=0;
  function advance(){
   if(closed)return;
   if(!reduced&&++index<greetings.length){word.textContent=greetings[index][0];word.lang=greetings[index][1];word.dir=word.lang==='ar'?'rtl':'auto';timer=setTimeout(advance,index===greetings.length-1?400:150);return;}
   if(reduced){finish();return;}
   root.classList.remove('welcome-pending');root.classList.add('preloader-reveal');modal.classList.add('welcome-leaving');timer=setTimeout(finish,1000);
  }
  timer=setTimeout(advance,reduced?300:700);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
