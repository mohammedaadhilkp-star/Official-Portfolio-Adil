'use strict';
document.documentElement.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
const header = document.querySelector('.header');
function updateHeaderScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 20); }
window.addEventListener('scroll', updateHeaderScroll, { passive: true });
updateHeaderScroll();

// Legacy header support (the home page uses the floating navigation below).
if (menu && nav) {
  const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}
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
 document.querySelectorAll('.journey-card,.growth-profile-card,.growth-strategy-card,.growth-intro-stack,.growth-services-header,.growth-service-row,.intro-layout,.section-heading,.accordion details,.milestone,.project,.about-section>div,.contact-section,.service-grid article,.service-detail-card,.page-intro,.footer,.numbers-strip,.tools-section,.faq-section,.process-card,.focus-card,.skills-block,.cred-card,.contact-info-card,.contact-form-card').forEach(el=>observer.observe(el));
 reduced.addEventListener('change',()=>{if(reduced.matches){animations.forEach(a=>a.cancel());animations.clear();}});
}

// Project category filtering on projects.html
const filterChips = [...document.querySelectorAll('.filter-chip')];
const projectCards = [...document.querySelectorAll('.projects-section .project')];
if (filterChips.length && projectCards.length) {
 filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
   filterChips.forEach(c => c.classList.remove('active'));
   chip.classList.add('active');
   const filter = chip.dataset.filter;
   projectCards.forEach(card => {
    const cat = card.dataset.category || '';
    const match = filter === 'all' || cat.toLowerCase().includes(filter.toLowerCase());
    card.style.display = match ? '' : 'none';
   });
  });
 });
}

// Contact form AJAX submission on contact.html
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
 contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const honeypot = contactForm.querySelector('input[name="_gotcha"]');
  if (honeypot && honeypot.value) return;
  const statusSuccess = contactForm.querySelector('.form-status.success');
  const statusError = contactForm.querySelector('.form-status.error');
  const submitBtn = contactForm.querySelector('.form-submit-btn');
  if (statusSuccess) statusSuccess.style.display = 'none';
  if (statusError) statusError.style.display = 'none';
  const origBtnText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
   submitBtn.disabled = true;
   submitBtn.textContent = 'Sending message...';
  }
  try {
   const formData = new FormData(contactForm);
   const res = await fetch(contactForm.action, {
    method: 'POST',
    body: formData,
    headers: { 'Accept': 'application/json' }
   });
   if (res.ok) {
    contactForm.reset();
    if (statusSuccess) statusSuccess.style.display = 'block';
   } else {
    if (statusError) statusError.style.display = 'block';
   }
  } catch (err) {
   if (statusError) statusError.style.display = 'block';
  } finally {
   if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = origBtnText;
   }
  }
 });
}



// ==========================================================================
// FLOATING PILL STICKY HEADER & CURSOR BOX ANIMATION & SCROLL SPY
// ==========================================================================
(function() {
  const floatingHeader = document.querySelector('.floating-header');
  if (floatingHeader) {
    function handleFloatingHeaderScroll() {
      floatingHeader.classList.toggle('is-scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', handleFloatingHeaderScroll, { passive: true });
    handleFloatingHeaderScroll();
  }

  const navTrack = document.querySelector('.nav-pill-track');
  const mobileToggle = document.querySelector('.mobile-toggle');

  if (navTrack) {
    const hoverBox = navTrack.querySelector('.nav-hover-box');
    const links = [...navTrack.querySelectorAll('.nav-link')];
    let activeLink = null;
    let isUserHovering = false;

    function positionBox(targetEl) {
      if (!hoverBox || !targetEl) {
        if (hoverBox && !targetEl) hoverBox.classList.remove('is-visible');
        return;
      }
      const trackRect = navTrack.getBoundingClientRect();
      const linkRect = targetEl.getBoundingClientRect();
      const x = linkRect.left - trackRect.left;
      const y = linkRect.top - trackRect.top;

      hoverBox.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
      hoverBox.style.width = linkRect.width + 'px';
      hoverBox.style.height = linkRect.height + 'px';
      hoverBox.classList.add('is-visible');
    }

    // Smooth scroll and active state on click
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerHeight = floatingHeader ? 80 : 0;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Update active link if this anchor is in nav
          const navMatch = links.find(l => l.getAttribute('href') === href);
          if (navMatch) {
            activeLink = navMatch;
            positionBox(activeLink);
          }

          // Close mobile menu if open
          if (navTrack.classList.contains('is-open')) {
            navTrack.classList.remove('is-open');
            if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });

    // Hover box cursor animations
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        isUserHovering = true;
        positionBox(link);
      });
      link.addEventListener('focus', () => {
        isUserHovering = true;
        positionBox(link);
      });
    });

    navTrack.addEventListener('mouseleave', () => {
      isUserHovering = false;
      if (activeLink) {
        positionBox(activeLink);
      } else if (hoverBox) {
        hoverBox.classList.remove('is-visible');
      }
    });

    // Scroll spy for single-page portfolio
    const sectionIds = ['work', 'services', 'journey', 'about', 'contact'];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    function updateScrollSpy() {
      if (isUserHovering) return;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const triggerPoint = scrollY + 160;

      let currentId = null;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec.offsetTop <= triggerPoint) {
          currentId = sec.id;
          break;
        }
      }

      if (currentId) {
        const matchingLink = links.find(l => l.getAttribute('href') === '#' + currentId);
        if (matchingLink && matchingLink !== activeLink) {
          activeLink = matchingLink;
          positionBox(activeLink);
        }
      } else {
        // At hero / top of page
        if (activeLink) {
          activeLink = null;
          if (hoverBox) hoverBox.classList.remove('is-visible');
        }
      }
    }

    let spyTimer = null;
    window.addEventListener('scroll', () => {
      if (spyTimer) cancelAnimationFrame(spyTimer);
      spyTimer = requestAnimationFrame(updateScrollSpy);
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (activeLink) positionBox(activeLink);
    });

    // Initial check after load
    setTimeout(updateScrollSpy, 200);
  }

  if (mobileToggle && navTrack) {
    function closeMobileMenu(returnFocus = false) {
      navTrack.classList.remove('is-open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.setAttribute('aria-label', 'Open navigation');
      if (returnFocus) mobileToggle.focus();
    }
    mobileToggle.setAttribute('aria-label', 'Open navigation');
    mobileToggle.addEventListener('click', () => {
      const isOpen = navTrack.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      mobileToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
    navTrack.addEventListener('click', e => { if (e.target.closest('a')) closeMobileMenu(); });
    document.addEventListener('click', e => {
      if (!floatingHeader.contains(e.target)) closeMobileMenu();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navTrack.classList.contains('is-open')) closeMobileMenu(true);
    });
    floatingHeader.addEventListener('focusout', () => {
      requestAnimationFrame(() => {
        if (!floatingHeader.contains(document.activeElement)) closeMobileMenu();
      });
    });
    matchMedia('(min-width: 901px)').addEventListener('change', () => closeMobileMenu());
  }
})();

// ==========================================================================
// GSAP SPLITTEXT STAGGER BLUR REVEAL
// ==========================================================================
function initSplitTextBlur() {
  const splitElements = document.querySelectorAll('.split-blur');
  if (!splitElements.length) return;

  splitElements.forEach(el => {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = 'true';

    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text.trim()) return document.createTextNode(text);
        const fragment = document.createDocumentFragment();
        const parts = text.split(/(\s+)/);
        parts.forEach(part => {
          if (!part.trim()) {
            fragment.appendChild(document.createTextNode(part));
          } else {
            const span = document.createElement('span');
            span.className = 'split-word';
            span.textContent = part;
            fragment.appendChild(span);
          }
        });
        return fragment;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        node.childNodes.forEach(child => {
          const res = processNode(child);
          if (res) clone.appendChild(res);
        });
        return clone;
      }
      return node.cloneNode(true);
    }

    const fragment = document.createDocumentFragment();
    el.childNodes.forEach(child => {
      const res = processNode(child);
      if (res) fragment.appendChild(res);
    });
    el.innerHTML = '';
    el.appendChild(fragment);

    const words = el.querySelectorAll('.split-word');
    words.forEach((w, idx) => {
      w.style.setProperty('--w-idx', idx);
    });
  });

  if ('IntersectionObserver' in window && !reduced.matches) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px'
    });

    splitElements.forEach(el => revealObserver.observe(el));
  } else {
    splitElements.forEach(el => el.classList.add('is-revealed'));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSplitTextBlur);
} else {
  initSplitTextBlur();
}

// Reels filter pills
const reelFilterBtns = document.querySelectorAll('.reel-filter-btn');
if (reelFilterBtns.length) {
  reelFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      reelFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// Animate the proof statistics once as each card enters the viewport.
(function initStatisticCounters() {
  const statistics = document.querySelectorAll('.bento-stat-giant, .card-stat');
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  const formatter = new Intl.NumberFormat('en-IN');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const element = entry.target;
      const original = element.textContent.trim();
      const parts = original.match(/^([^\d]*)([\d,]+)(.*)$/);
      if (!parts) return;
      const target = Number(parts[2].replace(/,/g, ''));
      const start = performance.now();
      const duration = 1600;
      // Keep the final value available to assistive technology during animation.
      element.setAttribute('aria-label', original);
      const display = document.createElement('span');
      display.setAttribute('aria-hidden', 'true');
      element.replaceChildren(display);
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        display.textContent = parts[1] + formatter.format(value) + parts[3];
        if (progress < 1) requestAnimationFrame(tick);
        else element.textContent = original;
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: .35 });
  statistics.forEach(element => observer.observe(element));
})();

// Clean menu URLs open the corresponding section, including direct visits.
(function initMenuRoutes() {
  const routeTargets = { '/': 'hero', '/services': 'services', '/work': 'work', '/about': 'about', '/blog': 'blog', '/contact': 'contact' };
  const path = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-pill-track .nav-link').forEach(link => {
    if (link.getAttribute('href') === path) link.setAttribute('aria-current', 'page');
  });
  const target = document.getElementById(routeTargets[path]);
  if (target && path !== '/' && !location.hash) {
    const showSection = () => target.scrollIntoView({ behavior: 'instant', block: 'start' });
    if (document.readyState === 'complete') showSection();
    else window.addEventListener('load', showSection, { once: true });
  }
})();

// Keep the moving video ribbon curved relative to the viewport center.
(function initCurvedVideoRibbon() {
  const section = document.querySelector('#videos');
  if (!section || reduced.matches) return;
  const cards = [...section.querySelectorAll('.reel-card')];
  let frame = 0;
  let visible = false;
  function draw() {
    frame = 0;
    if (!visible || reduced.matches) return;
    const width = section.clientWidth;
    const bounds = section.getBoundingClientRect();
    const depth = width < 600 ? 30 : 38;
    const rectangles = cards.map(card => card.getBoundingClientRect());
    cards.forEach((card, index) => {
      // Keep the curve fixed to the viewport as the track slides through it.
      const rect = rectangles[index];
      const x = Math.max(-1, Math.min(1, (rect.left + rect.width / 2 - bounds.left - width / 2) / (width / 2)));
      card.style.setProperty('--arc-offset', `${depth * (1 - 2 * x * x)}px`);
      card.style.setProperty('--arc-turn', `${-x * 24}deg`);
    });
    frame = requestAnimationFrame(draw);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(draw);
      else if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; }
    }).observe(section);
  } else { visible = true; frame = requestAnimationFrame(draw); }
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      cancelAnimationFrame(frame); frame = 0;
      cards.forEach(card => { card.style.removeProperty('--arc-offset'); card.style.removeProperty('--arc-turn'); });
    } else if (visible && !frame) frame = requestAnimationFrame(draw);
  });
})();

// Reveal every available FAQ using the reference's overview action.
document.querySelector('.faq-expand-all')?.addEventListener('click', () => {
  document.querySelectorAll('#faq details').forEach(item => { item.open = true; });
  document.querySelector('.faq-v2-accordion')?.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
});

(function(){const map=document.querySelector('.journey-map');if(!map)return;let pending=false;function update(){pending=false;const r=map.getBoundingClientRect();map.style.setProperty('--journey-progress',reduced.matches?1:Math.max(0,Math.min(1,(innerHeight*.7-r.top)/r.height)));}addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);update();})();
