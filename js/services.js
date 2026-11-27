/* Native document scrolling drives the pinned showcase; no scroll interception. */
(() => {
  'use strict';
  const section = document.querySelector('.service-scroll');
  if (!section) return;
  const buttons = [...section.querySelectorAll('.service-select')];
  const panels = [...section.querySelectorAll('.service-panel')];
  const desktop = matchMedia('(min-width: 960px) and (min-height: 720px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = -1;
  let pending = false;
  const enabled = () => desktop.matches && !reducedMotion.matches;
  function select(index) {
    if (active === index) return;
    active = index;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    panels.forEach((panel, i) => {
      panel.setAttribute('aria-hidden', String(i !== index));
      panel.inert = i !== index;
    });
  }
  function update() {
    pending = false;
    if (!enabled()) return;
    const travel = section.offsetHeight - innerHeight;
    const progress = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / travel));
    select(Math.min(panels.length - 1, Math.floor(progress * panels.length)));
  }
  function configure() {
    section.classList.toggle('is-scroll-ready', enabled());
    active = -1;
    if (enabled()) update();
    else panels.forEach(panel => { panel.removeAttribute('aria-hidden'); panel.inert = false; });
  }
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      if (!enabled()) return;
      const top = scrollY + section.getBoundingClientRect().top;
      const travel = section.offsetHeight - innerHeight;
      // Land in the middle of the selected service's scroll interval.
      scrollTo({ top: top + travel * ((index + .5) / panels.length), behavior: 'instant' });
      select(index);
    });
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown') next = (index + 1) % buttons.length;
      if (event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next === undefined) return;
      event.preventDefault(); buttons[next].focus({ preventScroll: true }); buttons[next].click();
    });
  });
  addEventListener('scroll', () => {
    if (!pending && enabled()) { pending = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', configure);
  desktop.addEventListener('change', configure);
  reducedMotion.addEventListener('change', configure);
  configure();
})();
