import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initBgVideo } from './bgvideo.js';
import { signatureSVG } from './brand/signature.js';
import { BRAND } from './config.js';

gsap.registerPlugin(SplitText, ScrollTrigger);
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const params = new URLSearchParams(location.search);
const HOLD = params.get('hold');          // ?hold=0.6 freezes the preloader at 60% (for screenshots)

// ---------------- Colombo clock ----------------
const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
const clockEl = $('#clock');
const tick = () => (clockEl.textContent = fmt.format(new Date()) + ' +5:30');
const clock2 = $('#clock2');
const fmt2 = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', hour12: false });
const tick2 = () => clock2 && (clock2.textContent = fmt2.format(new Date()) + ' +5:30');
tick(); tick2(); setInterval(() => { tick(); tick2(); }, 1000);

// ---------------- Brand marks ----------------
const brandMark = $('#brandMark');
if (BRAND.logo) {
  const logo = document.createElement('img');
  logo.src = BRAND.logo;
  logo.alt = '';
  brandMark.append(logo);
} else {
  brandMark.innerHTML = signatureSVG({ title: '' });
}
// ---------------- Mobile navigation ----------------
const menuButton = $('.top__menu');
const mobileNav = $('#mobileNav');
const setMenuOpen = (open) => {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileNav.hidden = !open;
  document.body.classList.toggle('menu-open', open);
};
menuButton.addEventListener('click', () => {
  setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
});
mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuButton.focus();
  }
});

// ---------------- Lenis ----------------
const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
lenis.stop();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

// ---------------- Cursor (registration mark, difference blend) ----------------
const cursor = $('#cursor');
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  window.addEventListener('pointermove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    cursor.classList.add('is-visible');
  }, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
  document.querySelectorAll('[data-hover]').forEach((el) => {
    const cls = el.dataset.hover === 'cta' ? 'is-hover' : 'is-link';
    el.addEventListener('pointerenter', () => cursor.classList.add(cls));
    el.addEventListener('pointerleave', () => cursor.classList.remove(cls));
  });
  // magnetic primary CTA
  const btn = $('.btn--primary');
  const xTo = gsap.quickTo(btn, 'x', { duration: 0.16, ease: 'power2.out' });
  const yTo = gsap.quickTo(btn, 'y', { duration: 0.16, ease: 'power2.out' });
  btn.addEventListener('pointermove', (e) => {
    const r = btn.getBoundingClientRect();
    xTo((e.clientX - r.left - r.width / 2) * 0.12);
    yTo((e.clientY - r.top - r.height / 2) * 0.16);
  });
  btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
}

// ---------------- Background videos ----------------
// hero loop starts straight away (it is the first paint); the contact loop attaches its sources on approach.
const progress = { fonts: 0, poster: 0 };
const heroPoster = $('#heroBg .bgvid__poster');
const posterDone = () => (progress.poster = 1);
if (heroPoster.complete && heroPoster.naturalWidth) posterDone();
else { heroPoster.addEventListener('load', posterDone, { once: true }); heroPoster.addEventListener('error', posterDone, { once: true }); }
document.fonts.ready.then(() => (progress.fonts = 1));
initBgVideo($('#heroBg'));
initBgVideo($('#contactBg'), { lazy: true });

// ---------------- Hero intro states ----------------
const lede = new SplitText('#lede', { type: 'lines', mask: 'lines', linesClass: 'ln' });
gsap.set('.line__in', { yPercent: 108 });
gsap.set(lede.lines, { yPercent: 100 });
gsap.set(['[data-reveal]', '.top', '.scrollcue'], { autoAlpha: 0 });
gsap.set('.ctas > *', { autoAlpha: 0, y: 14 });
gsap.set('.sheet', { clipPath: 'inset(50% 50% 50% 50%)' });
gsap.set('.hero__bg', { autoAlpha: 0 });

// ---------------- Preloader ----------------
const digits = $('#preDigits'), fill = $('#preFill');
const checks = [...document.querySelectorAll('#preChecks li')];
const shown = { v: 0 };
const minTime = reduce ? 0.2 : 2.4;
const t0 = performance.now();

function realProgress() {
  const time = Math.min(1, (performance.now() - t0) / 1000 / minTime);
  const asset = (progress.fonts + progress.poster) / 2;
  let p = Math.min(time, asset * 0.5 + time * 0.5, asset === 1 ? time : 0.92);
  if (HOLD) p = Math.min(p, parseFloat(HOLD));
  return p;
}
function paint() {
  const p = shown.v;
  digits.textContent = String(Math.round(p * 100)).padStart(3, '0');
  fill.style.transform = `scaleX(${p})`;
  checks[0].classList.toggle('done', progress.fonts === 1 && p > 0.2);
  checks[1].classList.toggle('done', progress.poster === 1 && p > 0.5);
  checks[2].classList.toggle('done', p > 0.86);
}
gsap.ticker.add(function loop() {
  shown.v += (realProgress() - shown.v) * 0.09;
  if (realProgress() >= 1 && shown.v > 0.995) shown.v = 1;
  paint();
  if (shown.v === 1) { gsap.ticker.remove(loop); finish(); }
});

async function finish() {
  const tl = gsap.timeline();
  tl.to('.pre__checks', { autoAlpha: 0, duration: reduce ? 0 : 0.25, ease: 'power2.out' })
    .to({}, { duration: reduce ? 0 : 0.3 })
    .set('.pre__edge', { opacity: 1 })
    .to('#pre', { yPercent: -100, duration: reduce ? 0 : 1.1, ease: 'power2.inOut' })
    .add(() => { document.body.classList.remove('is-loading'); $('#pre').remove(); lenis.start(); ScrollTrigger.refresh(); })
    .add(reveal(), '-=0.12');
}

function reveal() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.to('.hero__bg', { autoAlpha: 1, duration: 2.4, ease: 'power2.out' }, 0)
    .to('.sheet', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0)
    .to('.line__in', { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0.15)
    .to(['.top', '.scrollcue'], { autoAlpha: 1, duration: 1 }, 0.5)
    .to('[data-reveal]', { autoAlpha: 1, duration: 1, stagger: 0.08 }, 0.6)
    .to(lede.lines, { yPercent: 0, duration: 1.2, stagger: 0.07 }, 0.55)
    .to('.ctas > *', { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 0.8);
  return tl;
}

// ---------------- Scroll: hero parallax ----------------
gsap.to('.hero__title', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
// ---------------- Sheets: line-mask reveals (same easing as the hero) ----------------
document.querySelectorAll('[data-split], [data-lines]').forEach((el) => {
  const st = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
  if (reduce) return;
  gsap.set(st.lines, { yPercent: 105 });
  gsap.to(st.lines, { yPercent: 0, duration: el.hasAttribute('data-split') ? 1.3 : 1.1, stagger: 0.07, ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 86%' } });
});
document.querySelectorAll('.sec-head__folio, .case__no, .case__svc, .case__stack, .case__link, .about__list, .foot__links, .foot__mail').forEach((el) => {
  if (reduce) return;
  gsap.from(el, { autoAlpha: 0, y: 16, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
});
// figures "print in": a crop-mark frame opens, then the halftone resolves
document.querySelectorAll('.case__fig, .about__print').forEach((el) => {
  if (reduce) return;
  gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 82%' } });
});
// case thumbnails: colour proof reveals from the pointer's entry point; on touch it shows while centred
document.querySelectorAll('.case__fig').forEach((el) => {
  el.addEventListener('pointerenter', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--y', `${((e.clientY - r.top) / r.height) * 100}%`);
  });
  ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 45%', toggleClass: 'is-on' });
});
window.__lenis = lenis;
