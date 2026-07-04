document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadPartial('partials/header.html', 'site-header'),
    loadPartial('partials/footer.html', 'site-footer')
  ]);
  initNav();
  initPhotoStacks();
});

async function loadPartial(url, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  try {
    const res = await fetch(url);
    // outerHTML (not innerHTML) so the placeholder div doesn't wrap the
    // result — a wrapper exactly the height of .nav leaves position:sticky
    // with no room to stick, so .nav must become a direct child of body.
    target.outerHTML = await res.text();
  } catch (err) {
    console.error('Kunne ikke laste ' + url, err);
  }
}

function initPhotoStacks() {
  // Clicking the stack plays an exit animation on the front card, then
  // moves it to the back of the DOM order once that finishes, revealing
  // the next photo on top. The remaining cards shift into their new
  // :nth-child positions using the stack's own transform transition.
  document.querySelectorAll('.photo-stack').forEach(stack => {
    let animating = false;
    stack.addEventListener('click', () => {
      if (animating) return;
      const items = stack.querySelectorAll('.stack-item');
      if (items.length < 2) return;
      const front = items[items.length - 1];
      animating = true;
      front.classList.add('stack-item--exit');
      front.addEventListener('transitionend', function onEnd(e) {
        if (e.propertyName !== 'transform') return;
        front.removeEventListener('transitionend', onEnd);
        front.style.transition = 'none';
        front.classList.remove('stack-item--exit');
        stack.prepend(front);
        void front.offsetWidth; // force reflow before re-enabling the transition
        front.style.transition = '';
        animating = false;
      });
    });
  });
}

function initNav() {
  const currentPage = document.body.dataset.page;
  document.querySelectorAll('.nav a[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) link.classList.add('active');
  });
  const hamburger = document.querySelector('.nav-hamburger');
  const links = document.querySelector('.nav-links');
  if (hamburger && links) {
    hamburger.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }
}
