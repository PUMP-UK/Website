'use strict';

// Progressive enhancement: links, project images and navigation work without JS.
const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
menu.hidden = false;
header.classList.add('menu-ready');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
}
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('is-open', !expanded);
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
header.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu(); menu.focus();
  }
});
const mobileQuery = matchMedia('(max-width: 760px)');
mobileQuery.addEventListener('change', closeMenu);

const track = document.querySelector('#gallery-track');
const allSlides = [...track.querySelectorAll('.project-slide')];
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const previous = document.querySelector('#gallery-prev');
const next = document.querySelector('#gallery-next');
const count = document.querySelector('#gallery-count');
const status = document.querySelector('#gallery-status');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let slides = allSlides;
let active = 0;
let scrollFrame = 0;
let statusTimer;
const format = number => String(number).padStart(2, '0');
function updateControls(announce = false) {
  count.textContent = `${format(active + 1)} / ${format(slides.length)}`;
  previous.disabled = active === 0;
  next.disabled = active === slides.length - 1;
  if (announce) status.textContent = `Photograph ${active + 1} of ${slides.length}: ${slides[active].dataset.title}`;
}
function slidePosition(slide) {
  return slide.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
}
function goTo(index, smooth = true) {
  active = Math.max(0, Math.min(index, slides.length - 1));
  track.scrollTo({left: slidePosition(slides[active]), behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant'});
  updateControls(true);
}
previous.addEventListener('click', () => goTo(active - 1));
next.addEventListener('click', () => goTo(active + 1));
track.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); goTo(active + (event.key === 'ArrowRight' ? 1 : -1));
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault(); goTo(event.key === 'Home' ? 0 : slides.length - 1);
  }
});
function syncPosition() {
  if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 3 && track.scrollLeft > 0) {
    active = slides.length - 1;
  } else {
    let distance = Infinity;
    slides.forEach((slide, index) => {
      const candidate = Math.abs(slidePosition(slide) - track.scrollLeft);
      if (candidate < distance) { distance = candidate; active = index; }
    });
  }
  updateControls();
}
track.addEventListener('scroll', () => {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(syncPosition);
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => updateControls(true), 180);
}, {passive: true});
filterButtons.forEach(button => button.addEventListener('click', () => {
  filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  allSlides.forEach(slide => { slide.hidden = button.dataset.filter !== 'all' && slide.dataset.category !== button.dataset.filter; });
  slides = allSlides.filter(slide => !slide.hidden);
  goTo(0, false);
}));
new ResizeObserver(() => goTo(active, false)).observe(track);
document.querySelector('.gallery-toolbar').hidden = false;
updateControls();

const dialog = document.querySelector('#image-dialog');
const dialogImage = document.querySelector('#dialog-image');
const dialogTitle = document.querySelector('#image-title');
const dialogCount = document.querySelector('#dialog-count');
const dialogPrevious = document.querySelector('#dialog-prev');
const dialogNext = document.querySelector('#dialog-next');
let zoomIndex = 0;
let opener = null;
function displayPhoto(index) {
  zoomIndex = Math.max(0, Math.min(index, slides.length - 1));
  const slide = slides[zoomIndex];
  dialogImage.src = slide.querySelector('a').href;
  dialogImage.alt = slide.querySelector('img').alt;
  dialogTitle.textContent = slide.dataset.title;
  dialogCount.textContent = `${zoomIndex + 1} / ${slides.length}`;
  dialogPrevious.disabled = zoomIndex === 0;
  dialogNext.disabled = zoomIndex === slides.length - 1;
}
track.addEventListener('click', event => {
  const link = event.target.closest('.project-image');
  if (!link || typeof dialog.showModal !== 'function' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  opener = link;
  displayPhoto(slides.indexOf(link.closest('.project-slide')));
  dialog.showModal();
  document.body.classList.add('dialog-open');
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialogPrevious.addEventListener('click', () => displayPhoto(zoomIndex - 1));
dialogNext.addEventListener('click', () => displayPhoto(zoomIndex + 1));
dialog.addEventListener('click', event => { if (event.target === dialog && event.clientY !== 0) {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
}});
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault(); displayPhoto(zoomIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (opener) opener.focus({preventScroll: true});
});
document.querySelector('#year').textContent = new Date().getFullYear();
