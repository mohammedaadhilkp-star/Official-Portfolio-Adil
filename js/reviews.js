// Duplicate one visual group for a continuous, accessible review slide.
(() => {
  const track = document.querySelector('.reviews-glass-track');
  const group = track?.querySelector('.reviews-glass-group');
  if (!group) return;
  const copy = group.cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  copy.setAttribute('inert', '');
  track.append(copy);
  track.classList.add('is-sliding');
})();
