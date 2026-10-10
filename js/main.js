'use strict';
document.documentElement.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
matchMedia('(min-width: 601px)').addEventListener('change', closeMenu);
const details = [...document.querySelectorAll('.accordion details')];
details.forEach(item => item.addEventListener('toggle', () => { if (item.open) { details.forEach(other => { if (other !== item) other.open = false; }); if (!reduced.matches) item.querySelector('.service-body').animate([{opacity:0, transform:'translateY(-8px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,easing:'ease-out'}); } }));
const config = window.PORTFOLIO_CONFIG || {};
let hasContacts = false;
document.querySelectorAll('[data-contact-links]').forEach(container => {
 container.className = 'contact-links';
 Object.entries(config.contacts || {}).forEach(([name,value]) => {
  if (!value) return;
  let href = name === 'email' ? 'mailto:' + value : value;
  if (name !== 'email' && !/^https:\/\//i.test(href)) return;
  const link = document.createElement('a'); link.className = 'button outline'; link.href = href;
  link.textContent = name === 'email' ? 'Email ↗' : name.charAt(0).toUpperCase() + name.slice(1) + ' ↗';
  container.append(link); hasContacts = true;
 });
});
if (hasContacts) document.querySelectorAll('.contact-empty').forEach(el => el.hidden = true);
const timelines = [...document.querySelectorAll('.timeline')];
function updateTimeline() {
 timelines.forEach(timeline => {
  const rect = timeline.getBoundingClientRect();
  const reached = reduced.matches ? rect.height : Math.max(0, Math.min(rect.height, innerHeight * .65 - rect.top));
  timeline.style.setProperty('--progress', reached / rect.height);
  timeline.querySelectorAll('.milestone').forEach(item => {
   const marker = item.querySelector('.marker');
   item.classList.toggle('active', reduced.matches || marker.getBoundingClientRect().top - rect.top <= reached);
  });
 });
}
let framePending = false;
function scheduleTimeline() { if (!framePending) { framePending = true; requestAnimationFrame(() => { updateTimeline(); framePending = false; }); } }
addEventListener('scroll', scheduleTimeline, {passive:true}); addEventListener('resize', scheduleTimeline); reduced.addEventListener('change', updateTimeline); updateTimeline();
// Reveals progressively enhance HTML that stays visible without JavaScript.
if ('IntersectionObserver' in window) {
 const animations = new Map();
 const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (reduced.matches) return;
  if (entry.isIntersecting && !animations.has(entry.target)) {
   const animation=entry.target.animate([{opacity:.12,transform:'translateY(65px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,easing:'cubic-bezier(.18,.7,.25,1)'});
   animations.set(entry.target,animation);entry.target.dataset.revealed='true';
   const frame=entry.target.querySelector('.project-art');
   if(frame)animations.set(frame,frame.animate([{clipPath:'inset(15% 9% 15% 9% round 32px)'},{clipPath:'inset(0% 0% 0% 0% round 24px)'}],{duration:1100,easing:'cubic-bezier(.18,.7,.25,1)'}));
  } else if(!entry.isIntersecting&&entry.boundingClientRect.top>innerHeight){animations.get(entry.target)?.cancel();animations.delete(entry.target);entry.target.dataset.revealed='false';}
 }),{threshold:.10,rootMargin:'0px 0px -30px 0px'});
 document.querySelectorAll('.intro-layout,.section-heading,.accordion details,.milestone,.project,.about-section>div,.contact-section,.service-grid article,.page-intro,.footer').forEach(el=>observer.observe(el));
 reduced.addEventListener('change',()=>{if(reduced.matches){animations.forEach(a=>a.cancel());animations.clear();}});
}
