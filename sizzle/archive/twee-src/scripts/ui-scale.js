/* ============================================================
   UI SCALE — fixed-proportion stage + zoom-aware text
   The game renders on a fixed 1920×992 design canvas (#game),
   uniformly scaled to fit the window (see layout.css). This
   script keeps two CSS custom properties current on <html>:

   --sz-scale  min(innerW/1920, innerH/992). Window resize moves
               it. Browser zoom shrinks the CSS viewport and the
               scale together, so the stage's physical size and
               proportions never change with zoom.
   --zoom      devicePixelRatio relative to its value at first
               load. Browser zoom moves it; the text-size tokens
               in reset.css multiply by it, so Ctrl+/- resizes
               reading text inside the unmoving frame.

   Caveat: dragging the window to a monitor with different DPI
   scaling also changes devicePixelRatio and is indistinguishable
   from zoom — text size carries across as if zoomed. Best effort.
   ============================================================ */
(function () {
  'use strict';

  var DESIGN_W = 1920;
  var DESIGN_H = 992;
  var baseDpr  = window.devicePixelRatio || 1;

  function apply() {
    var root = document.documentElement;
    var w = window.innerWidth;
    var h = window.innerHeight;

    /* A zero-size viewport (mid-load, background tab) would scale the
       stage to nothing; leave the CSS min() fallback in charge instead. */
    if (!(w > 0 && h > 0)) {
      root.style.removeProperty('--sz-scale');
      return;
    }

    var scale = Math.min(w / DESIGN_W, h / DESIGN_H);
    var zoom  = (window.devicePixelRatio || 1) / baseDpr;

    root.style.setProperty('--sz-scale', String(scale));
    root.style.setProperty('--zoom', String(zoom));
  }

  window.addEventListener('resize', apply);
  window.addEventListener('load', apply);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', apply);
  }
  /* Some environments resize the viewport without dispatching a window
     resize event; observing the root element catches every real change. */
  if (window.ResizeObserver) {
    new ResizeObserver(apply).observe(document.documentElement);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
  window.requestAnimationFrame(apply);
})();
