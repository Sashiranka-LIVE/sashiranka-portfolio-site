import SD from './sd-mark.json';

// The SD signature brand mark: authentic calligraphic mark vectorised from original artwork.
// Mask strokes animate in natural human signing order:
// 1. S (continuous loop & bowl)
// 2. Pen lift & reposition
// 3. D stem (firm downward stroke)
// 4. Pen lift
// 5. D arch & flourish underline (sweeping grand curve & underline)
// 6. Cross tick
let uid = 0;
export function signatureSVG({ cls = '', title = 'Sasiranka D. Fernando signature', drawn = true } = {}) {
  const id = `sdm${++uid}`;
  const strokes = SD.strokes.map((s, idx) =>
    `<path d="${s.d}" pathLength="1" style="stroke-dasharray:1 3;stroke-dashoffset:${drawn ? 0 : 1.01}" data-len="${s.len}" data-lift="${s.lift ? 1 : 0}" data-name="${s.name || idx}"/>`).join('');
  return `<svg class="sig ${cls}" viewBox="0 0 ${SD.w} ${SD.h}" role="img" aria-label="${title}">
    <defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${SD.w}" height="${SD.h}">
      <g fill="none" stroke="#fff" stroke-width="${SD.pen}" stroke-linecap="round" stroke-linejoin="round">${strokes}</g>
    </mask></defs>
    <path class="sig__ink" d="${SD.fill}" fill="currentColor" fill-rule="evenodd" mask="url(#${id})"/>
  </svg>`;
}

// Draw the mask strokes with realistic human signing physics
export function drawSignature(gsap, svg, { duration = 1.8 } = {}) {
  const paths = [...svg.querySelectorAll('mask path')];
  const total = paths.reduce((a, p) => a + +p.dataset.len, 0);
  const tl = gsap.timeline();

  paths.forEach((p, idx) => {
    const rawLen = +p.dataset.len;
    const name = p.dataset.name;
    const isLift = p.dataset.lift === '1';

    // Tailored human writing physics:
    // S has continuous rhythm
    // D stem is a decisive downward stroke
    // D arch accelerates along the long sweeping flourish tail
    let ease = 'power1.inOut';
    let durationWeight = rawLen / total;

    if (name === 'S' || idx === 0) {
      ease = 'power1.inOut';
    } else if (name === 'D_stem') {
      ease = 'power2.out';
    } else if (name === 'D_arch') {
      ease = 'power2.inOut';
    } else if (name === 'D_tick') {
      ease = 'power3.out';
    }

    const d = Math.max(duration * durationWeight, 0.08);

    // Realistic pen lift pauses between letters
    let position = '>';
    if (idx === 0) {
      position = '>';
    } else if (name === 'D_stem') {
      position = '+=0.16'; // distinct pause between S and D
    } else if (name === 'D_arch') {
      position = '+=0.10'; // brief lift to top of D arch
    } else if (name === 'D_tick') {
      position = '+=0.08'; // quick lift to cross tick
    } else if (isLift) {
      position = '+=0.12';
    }

    tl.fromTo(p, 
      { strokeDashoffset: 1.01 }, 
      { strokeDashoffset: 0, duration: d, ease: ease }, 
      position
    );
  });

  return tl;
}

export function resetSignature(svg) { 
  svg.querySelectorAll('mask path').forEach((p) => (p.style.strokeDashoffset = 1.01)); 
}
