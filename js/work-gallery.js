/* 3D work dome. The image atlas contains the user's own attached designs. */
(() => {
  'use strict';
  const section = document.querySelector('.work-dome-section');
  if (!section) return;
  const dome = section.querySelector('.work-dome');
  const sphere = section.querySelector('.work-dome-sphere');
  const dialog = section.querySelector('.work-art-dialog');
  const preview = section.querySelector('.work-art-preview');
  const title = section.querySelector('#work-art-title');
  const motionButton = section.querySelector('.work-dome-motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Source rectangles preserve the artwork inside the flattened supplied board.
  const works = [
    ['Coconut water campaign',1220,28,400,355],
    ['Finder app concept',553,111,275,335],
    ['Noir Élan perfume campaign',810,266,320,366],
    ['Brand identity study',423,526,263,356],
    ['Purple app identity',731,725,326,382],
    ['Chickart fried chicken creative',1170,464,383,388],
    ['Chickart launch campaign',1645,218,405,382],
    ['App icon visual',1950,44,397,345],
    ['Academy admissions campaign',1995,477,387,393],
    ['Urbanhub website creative',2819,90,280,330],
    ['Food photography campaign',2440,264,352,363],
    ['Biryani menu creative',2906,500,302,382],
    ['Website design promotion',2502,733,344,389],
    ['Coconut water product visual',711,1211,331,388],
    ['Career skills campaign',1649,1201,383,413],
    ['Urbanhub ecommerce creative',2010,971,391,399],
    ['Chickart burger campaign',2020,1495,379,406],
    ['Chickart website design',2490,1245,384,393],
    ['Ecommerce mobile experience',2486,1755,366,365],
    ['Noir Élan product branding',2920,1971,279,368],
    ['Academy course creative',380,980,263,379],
    ['Football poster study',383,1454,258,365],
    ['Helmet product campaign',426,1914,283,331],
    ['Football tribute artwork',835,2166,306,319]
  ];
  const atlas = 'assets/work/design-collage.jpg';
  function artwork(work) {
    const image = document.createElement('span');
    image.className = 'work-gallery-art';
    const [,x,y,w,h] = work;
    image.style.backgroundImage = `url("${atlas}")`;
    image.style.backgroundSize = `${3840 / w * 100}% ${2621 / h * 100}%`;
    image.style.backgroundPosition = `${x / (3840 - w) * 100}% ${y / (2621 - h) * 100}%`;
    return image;
  }
  const tiles = [], columns = 24, rows = 4;
  for (let column = 0; column < columns; column++) {
    for (let row = 0; row < rows; row++) {
      const work = works[(column * 7 + row * 5) % works.length];
      const tile = document.createElement('button');
      tile.className = 'work-dome-tile'; tile.type = 'button'; tile.tabIndex = -1;
      tile.setAttribute('aria-label', `Enlarge ${work[0]}`);
      tile.setAttribute('aria-haspopup', 'dialog');
      tile.append(artwork(work));
      sphere.append(tile);
      tiles.push({tile, work, longitude: column * 360 / columns, latitude: (row - 1.5) * 17});
      tile.addEventListener('click', event => {
        if (performance.now() < suppressClickUntil) { event.preventDefault(); return; }
        openArtwork(work, tile);
      });
      tile.addEventListener('focus', () => { focused = true; });
    }
  }
  let yaw = 0, pitch = -4, velocity = 0, radius = 800;
  let raf = 0, previous = 0, visible = false, paused = reduced.matches;
  let held = false, dragged = false, startX = 0, startY = 0, lastX = 0, lastY = 0;
  let suppressClickUntil = 0, focused = false, returnFocus = null, oldBodyOverflow = '';
  function normalAngle(angle) { return ((angle + 180) % 360 + 360) % 360 - 180; }
  function update() {
    sphere.style.transform = `translateZ(${-radius}px) rotateX(${pitch}deg) rotateY(${yaw}deg)`;
    // Only the front-facing tiles participate in keyboard navigation.
    tiles.forEach(({tile, longitude, latitude}) => {
      const front = Math.abs(normalAngle(longitude + yaw)) < 62 && Math.abs(latitude - pitch) < 50;
      tile.tabIndex = front ? 0 : -1;
      tile.setAttribute('aria-hidden', String(!front));
    });
  }
  function resize() {
    radius = Math.max(600, Math.min(1080, dome.clientWidth * .65));
    const width = radius * .242, height = width * 1.15;
    tiles.forEach(({tile, longitude, latitude}) => {
      tile.style.width = `${width}px`; tile.style.height = `${height}px`;
      tile.style.marginLeft = `${-width / 2}px`; tile.style.marginTop = `${-height / 2}px`;
      tile.style.transform = `rotateY(${longitude}deg) rotateX(${latitude}deg) translateZ(${radius}px)`;
    });
    update();
  }
  function tick(time) {
    raf = 0;
    const dt = Math.min(.04, (time - (previous || time)) / 1000); previous = time;
    if (!held && !focused && !dialog.open && !paused && !reduced.matches) {
      yaw += dt * (2.3 + velocity * 45);
      velocity *= Math.pow(.94, dt * 60);
      update();
    }
    if (visible && !document.hidden && !dialog.open && !paused && !reduced.matches) raf = requestAnimationFrame(tick);
  }
  function start() { if (!raf && visible && !document.hidden) { previous = 0; raf = requestAnimationFrame(tick); } }
  dome.addEventListener('pointerdown', event => {
    if (event.button !== 0 || dialog.open) return;
    held = true; dragged = false; velocity = 0;
    startX = lastX = event.clientX; startY = lastY = event.clientY;
    // Capture only after movement so a normal tap still activates its tile.
    dome.classList.add('is-dragging');
  });
  dome.addEventListener('pointermove', event => {
    if (!held) return;
    const dx = event.clientX - lastX, dy = event.clientY - lastY;
    if (!dragged && Math.hypot(event.clientX - startX, event.clientY - startY) > 7) {
      dragged = true; dome.setPointerCapture(event.pointerId);
    }
    if (dragged) {
      yaw += dx * .13; pitch = Math.max(-12, Math.min(12, pitch - dy * .08));
      velocity = dx * .025; update();
    }
    lastX = event.clientX; lastY = event.clientY;
  });
  function release(event) {
    if (!held) return;
    held = false;
    if (dragged) {
      suppressClickUntil = performance.now() + 200;
      if (dome.contains(document.activeElement)) document.activeElement.blur();
      focused = false;
    }
    dome.classList.remove('is-dragging');
    if (event && dome.hasPointerCapture(event.pointerId)) dome.releasePointerCapture(event.pointerId);
    start();
  }
  dome.addEventListener('pointerup', release);
  dome.addEventListener('pointercancel', release);
  dome.addEventListener('lostpointercapture', release);
  // A release outside the dome must never leave it in the dragging state.
  addEventListener('pointerup', release);
  dome.addEventListener('focusin', () => { focused = true; });
  dome.addEventListener('focusout', event => { focused = dome.contains(event.relatedTarget); });
  dome.addEventListener('keydown', event => {
    const directions = {ArrowLeft: -12, ArrowRight: 12, ArrowUp: -5, ArrowDown: 5};
    if (!(event.key in directions)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') yaw += directions[event.key];
    else pitch = Math.max(-12, Math.min(12, pitch + directions[event.key]));
    velocity = 0; update();
  });
  function syncMotion() { motionButton.disabled = reduced.matches; motionButton.textContent = reduced.matches ? 'Reduced motion' : paused ? 'Play motion' : 'Pause motion'; motionButton.setAttribute('aria-pressed', String(paused)); }
  motionButton.addEventListener('click', () => { paused = !paused; syncMotion(); if (paused) { cancelAnimationFrame(raf); raf = 0; } else start(); });
  section.querySelector('.work-dome-reset').addEventListener('click', () => { yaw = 0; pitch = -4; velocity = 0; update(); });
  function openArtwork(work, trigger) {
    returnFocus = trigger; title.textContent = work[0]; preview.replaceChildren(artwork(work));
    preview.style.aspectRatio = `${work[3]} / ${work[4]}`;
    oldBodyOverflow = document.body.style.overflow;
    dialog.showModal(); document.body.style.overflow = 'hidden';
    cancelAnimationFrame(raf); raf = 0;
    section.querySelector('.work-art-close').focus();
  }
  section.querySelector('.work-art-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.style.overflow = oldBodyOverflow; returnFocus?.focus({preventScroll:true}); start(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; velocity = 0; syncMotion(); if (paused) { cancelAnimationFrame(raf); raf = 0; } else start(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); else { cancelAnimationFrame(raf); raf = 0; } }).observe(dome);
  else { visible = true; start(); }
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else start(); });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(dome); else addEventListener('resize', resize);
  syncMotion(); resize();
})();
