import { beforeEach, describe, expect, test } from 'vitest';
import { BRAND, PALETTE } from '../config.js';

function seedDom() {
  document.body.innerHTML = `
    <div class="pre" id="pre" aria-hidden="true">
      <div class="pre__top">
        <div class="pre__brand">
          <img src="/brand/signature-mark.png" alt="Sasiranka D. Fernando signature" />
          <span class="pre__brand-name">Sasiranka D. Fernando<small>VZiP DEVELOGENZ</small></span>
        </div>
        <span class="pre__folio">SHEET 01 / 04</span>
        <span class="pre__stock">A4 · 300 DPI · CMYK</span>
      </div>
      <div class="pre__digits" id="preDigits">000</div>
      <div id="preFill"></div>
      <ul id="preChecks">
        <li></li>
        <li></li>
        <li></li>
      </ul>
      <div class="pre__edge" aria-hidden="true"></div>
    </div>

    <div class="cursor" id="cursor" aria-hidden="true">
      <span class="cursor__ring"></span>
    </div>

    <main id="main">
      <section class="hero" id="hero">
        <div class="bgvid hero__bg" id="heroBg" aria-hidden="true">
          <img class="bgvid__poster" src="/video/hero-poster.webp" alt="" width="1280" height="886" />
          <video class="bgvid__video" id="heroVideo" muted playsinline preload="auto" width="1280" height="886">
            <source data-src="/video/hero-bg.mp4" type="video/mp4" />
          </video>
          <div class="bgvid__shade"></div>
        </div>

        <div class="sheet" aria-hidden="true"></div>

        <header class="top">
          <a class="brand" href="#" data-hover>
            <span class="brand__mark" id="brandMark" aria-hidden="true"></span>
            <span class="brand__name">Sasiranka D. Fernando</span>
          </a>
          <div class="top__meta mono">
            <span>Colombo <b id="clock">--:--:--</b></span>
            <b id="clock2">--:--</b>
          </div>
          <nav class="top__nav mono" aria-label="Primary"></nav>
          <button class="top__menu mono" type="button" data-hover aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav">Index</button>
          <nav class="mobile-nav mono" id="mobileNav" aria-label="Mobile" hidden>
            <a href="#work"><span>02</span> Work</a>
            <a href="#about"><span>03</span> About</a>
            <a href="#contact"><span>04</span> Contact</a>
          </nav>
        </header>

        <div class="hero__kicker mono" data-reveal>Hero kicker</div>
        <h1 class="hero__title" aria-label="Form to print.">
          <span class="line"><span class="line__in solid">Form</span></span>
          <span class="line line--2"><span class="line__in">to</span></span>
        </h1>

        <div class="rcol">
          <dl class="specs mono" data-reveal></dl>
        </div>

        <div class="hero__foot">
          <div class="hero__copy">
            <p class="lede" id="lede">I build web tools.</p>
            <div class="ctas">
              <a class="btn btn--primary" href="#work" data-hover="cta">See selected work</a>
              <a class="btn btn--text" href="mailto:test@example.com" data-hover="cta">Start a project</a>
            </div>
          </div>
        </div>

        <div class="scrollcue mono" aria-hidden="true">Scroll</div>
      </section>

      <section class="work sheet-sec" id="work" aria-labelledby="work-title">
        <header class="sec-head">
          <p class="mono sec-head__folio"><span>Sheet 02 / 04</span></p>
          <h2 class="two-tone" id="work-title" data-split><span class="solid">Selected</span></h2>
          <p class="sec-head__lede" data-lines>Work summary</p>
        </header>
        <ol class="cases">
          <li class="case" data-case>
            <a class="case__fig" href="#">Case study</a>
          </li>
        </ol>
      </section>

      <img class="foot__sig" id="footSig" src="/brand/signature-mark.png" alt="Sasiranka D. Fernando signature" />
    </main>
  `;
}

describe('portfolio bootstrapping', () => {
  beforeEach(() => {
    seedDom();
  });

  test('brand metadata is defined and usable', () => {
    expect(PALETTE.ink).toBe('#0F0E0C');
    expect(BRAND.site).toBe('https://sashiranka.me/');
    expect(BRAND.email).toMatch(/@/);
  });

  test('the client bootstraps the required app hooks', async () => {
    await import('../main.js');

    const clock = document.querySelector('#clock');
    expect(clock).not.toBeNull();
    expect(clock.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);
    expect(document.querySelector('#brandMark img')).toHaveAttribute('src', '/brand/signature-mark.png');
    expect(document.querySelector('.pre__brand img')).toHaveAttribute('src', '/brand/signature-mark.png');
    expect(document.querySelector('.pre__brand svg')).toBeNull();
    expect(document.querySelector('.pre__brand-name').textContent).toContain('Sasiranka D. Fernando');
    expect(document.querySelector('#pre .pre__edge')).not.toBeNull();
    expect(document.querySelector('#pre .pre__ink')).toBeNull();
    expect(document.querySelector('.foot__sig')).toHaveAttribute('src', '/brand/signature-mark.png');
    expect(document.querySelector('#footSig svg')).toBeNull();
    expect(window.__lenis).toBeDefined();
    expect(document.querySelector('#preDigits')?.textContent).toBeTruthy();

    const cursor = document.querySelector('#cursor');
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 321, clientY: 234 }));
    expect(cursor.style.left).toBe('321px');
    expect(cursor.style.top).toBe('234px');
    expect(cursor).toHaveClass('is-visible');

    const menuButton = document.querySelector('.top__menu');
    const mobileNav = document.querySelector('#mobileNav');
    menuButton.click();
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(mobileNav.hidden).toBe(false);
    mobileNav.querySelector('a').click();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(mobileNav.hidden).toBe(true);

    menuButton.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(mobileNav.hidden).toBe(true);
  });
});
