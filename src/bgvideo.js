// Background-loop helper for .bgvid blocks (poster <img> + <video> + shade).
//
//  • reduced motion → the <video> is removed, only the poster is ever shown
//  • lazy: true     → <source data-src> are attached the first time the block nears the viewport
//  • seamless loop  → dual-video crossfade eliminates freezes or jumps at loop boundaries
//  • plays only while on screen and while the tab is visible (saves battery/CPU)
export function initBgVideo(root, { lazy = false, margin = '300px 0px', crossfade = 0.85 } = {}) {
  const v1 = root?.querySelector('video');
  if (!v1) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { v1.remove(); return; }

  v1.loop = false;

  // Duplicate video node for seamless crossfade looping
  const v2 = v1.cloneNode(true);
  v2.removeAttribute('id');
  v2.loop = false;
  v1.parentNode.insertBefore(v2, v1.nextSibling);

  // Set initial styles
  v1.style.transition = `opacity ${crossfade}s ease-in-out`;
  v2.style.transition = `opacity ${crossfade}s ease-in-out`;
  v1.style.opacity = '0';
  v2.style.opacity = '0';

  let loaded = !lazy, inView = false;
  let active = v1, next = v2;
  let transitioning = false;

  const markPlaying = () => {
    root.classList.add('is-playing');
    if (!transitioning) {
      active.style.opacity = 'var(--op, .55)';
    }
  };

  v1.addEventListener('playing', markPlaying, { once: true });
  v2.addEventListener('playing', markPlaying, { once: true });
  if (!v1.paused && v1.readyState > 2) markPlaying();

  const attachSources = (v) => {
    v.querySelectorAll('source[data-src]').forEach((s) => {
      if (!s.src) s.src = s.dataset.src;
    });
    v.load();
  };

  const attach = () => {
    if (loaded) return;
    loaded = true;
    attachSources(v1);
    attachSources(v2);
  };

  const sync = () => {
    if (inView && !document.hidden) {
      attach();
      active.play()?.catch(() => {});
    } else {
      v1.pause();
      v2.pause();
    }
  };

  function checkLoop() {
    if (inView && !document.hidden && active && active.duration && active.duration > 1) {
      const timeLeft = active.duration - active.currentTime;
      if (timeLeft <= crossfade && !transitioning && active.currentTime > 0.5) {
        transitioning = true;
        next.currentTime = 0;
        next.play()?.catch(() => {});
        next.style.opacity = 'var(--op, .55)';
        active.style.opacity = '0';

        setTimeout(() => {
          active.pause();
          const temp = active;
          active = next;
          next = temp;
          transitioning = false;
        }, crossfade * 1000);
      }
    }
    requestAnimationFrame(checkLoop);
  }

  // Safety fallbacks
  v1.addEventListener('ended', () => {
    if (!transitioning) {
      v1.currentTime = 0;
      v1.play()?.catch(() => {});
      v1.style.opacity = 'var(--op, .55)';
    }
  });
  v2.addEventListener('ended', () => {
    if (!transitioning) {
      v2.currentTime = 0;
      v2.play()?.catch(() => {});
      v2.style.opacity = 'var(--op, .55)';
    }
  });

  new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { rootMargin: margin }).observe(root);
  document.addEventListener('visibilitychange', sync);
  requestAnimationFrame(checkLoop);
}
