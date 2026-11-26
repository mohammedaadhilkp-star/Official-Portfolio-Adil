/* Dedicated contact page: navigation, text reveal and reviewed message drafts. */
(() => {
  'use strict';
  const header = document.querySelector('.floating-header');
  const toggle = document.querySelector('.mobile-toggle');
  const navigation = document.querySelector('.nav-pill-track');
  const updateHeader = () => header.classList.toggle('is-scrolled', scrollY > 20);
  addEventListener('scroll', updateHeader, { passive: true }); updateHeader();
  function closeMenu() { toggle.setAttribute('aria-expanded', 'false'); navigation.classList.remove('is-open'); }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('is-open', open);
  });
  navigation.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // Same word-by-word blur, lift and stagger as the homepage.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const headings = document.querySelectorAll('.split-blur');
  headings.forEach(heading => {
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    let index = 0;
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(word => {
        if (!word.trim()) { fragment.append(document.createTextNode(word)); return; }
        const span = document.createElement('span'); span.className = 'split-word';
        span.textContent = word; span.style.setProperty('--w-idx', index++); fragment.append(span);
      });
      node.replaceWith(fragment);
    });
  });
  if (!reduced.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); observer.unobserve(entry.target); }
    }), { threshold: .12 });
    headings.forEach(heading => observer.observe(heading));
  } else headings.forEach(heading => heading.classList.add('is-revealed'));

  const enquiry = document.getElementById('project-enquiry');
  enquiry.addEventListener('submit', event => {
    event.preventDefault();
    if (!enquiry.reportValidity()) return;
    const data = new FormData(enquiry);
    const message = ['Hi Adil, I’d like to discuss a project.', '',
      `Name: ${data.get('name')}`, `Email: ${data.get('email')}`,
      `Company: ${data.get('company') || 'Not specified'}`, `Phone: ${data.get('phone') || 'Not specified'}`,
      `Service: ${data.get('service')}`, `Budget: ${data.get('budget')}`, '', String(data.get('message'))].join('\n');
    const email = event.submitter?.value === 'email';
    const url = email ? `mailto:mohammedaadhilkp@gmail.com?subject=${encodeURIComponent('Project enquiry — ' + data.get('name'))}&body=${encodeURIComponent(message)}` : `https://wa.me/917736735421?text=${encodeURIComponent(message)}`;
    showDraft('enquiry-feedback', url, email ? 'email app' : 'WhatsApp');
  });

  const booking = document.getElementById('consultation-request');
  const date = document.getElementById('booking-date');
  const time = document.getElementById('booking-time');
  const todayIST = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  date.min = todayIST();
  const clearDateError = () => { date.setCustomValidity(''); time.setCustomValidity(''); };
  date.addEventListener('input', clearDateError); time.addEventListener('change', clearDateError);
  booking.addEventListener('submit', event => {
    event.preventDefault(); clearDateError(); date.min = todayIST();
    const [clock, meridiem] = time.value.split(' ');
    if (date.value && clock && meridiem) {
      let [hours, minutes] = clock.split(':').map(Number); hours = hours % 12 + (meridiem === 'PM' ? 12 : 0);
      const requested = new Date(`${date.value}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`);
      if (requested <= new Date()) time.setCustomValidity('Please choose a future date and time in IST.');
    }
    if (!booking.reportValidity()) return;
    const data = new FormData(booking);
    const message = ['Hi Adil, I’d like to request a 30-minute consultation.', '', `Name: ${data.get('name')}`, `Email: ${data.get('email')}`, `Preferred date: ${data.get('date')}`, `Preferred time: ${data.get('time')} IST (UTC+05:30)`, `Topic: ${data.get('topic') || 'Discuss my project and goals'}`, '', 'Please confirm whether this time is available and share the call details.'].join('\n');
    showDraft('booking-feedback', `https://wa.me/917736735421?text=${encodeURIComponent(message)}`, 'WhatsApp');
  });
  function showDraft(id, url, destination) {
    const status = document.getElementById(id);
    status.replaceChildren(document.createTextNode(`Your draft is ready. Review and send it in ${destination}. `));
    const link = document.createElement('a'); link.href = url; link.textContent = `Open ${destination} again`;
    if (destination !== 'email app') { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    status.append(link);
    if (destination === 'email app') location.href = url;
    else window.open(url, '_blank', 'noopener,noreferrer');
  }
})();
