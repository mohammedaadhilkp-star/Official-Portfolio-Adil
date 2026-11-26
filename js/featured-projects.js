/* Reference-inspired expanding project panels: mouse, touch and keyboard. */
(() => {
  'use strict';
  document.querySelectorAll('.featured-panels').forEach(strip => {
    const panels = [...strip.querySelectorAll('.featured-panel')];
    const buttons = panels.map(panel => panel.querySelector('.featured-panel-select'));
    function select(index) {
      panels.forEach((panel, i) => {
        const active = i === index;
        panel.dataset.active = String(active);
        buttons[i].setAttribute('aria-expanded', String(active));
        const detail = panel.querySelector('.featured-panel-detail');
        detail.inert = !active;
        detail.setAttribute('aria-hidden', String(!active));
      });
    }
    panels.forEach((panel, index) => {
      panel.addEventListener('pointerenter', event => {
        // Preserve a keyboard user's focused link when the mouse crosses a panel.
        if (event.pointerType === 'mouse' && !strip.contains(document.activeElement)) select(index);
      });
      buttons[index].addEventListener('click', () => select(index));
      buttons[index].addEventListener('focus', () => select(index));
      buttons[index].addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % panels.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + panels.length) % panels.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = panels.length - 1;
        if (next === undefined) return;
        event.preventDefault(); select(next); buttons[next].focus();
      });
    });
    strip.classList.add('is-interactive'); select(0);
  });
})();
