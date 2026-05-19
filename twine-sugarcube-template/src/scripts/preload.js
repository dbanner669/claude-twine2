/* ============================================================
   IMAGE PRELOADER
   Call preloadImages() with an array of URLs to pre-cache images
   in the browser. Use before scenes with many avatar changes
   to prevent flicker.

   Usage (in a script or passage):
     preloadImages([
       "media/avatar/20_body-fair.png",
       "media/avatar/clothing/tops/blackTshirt.png"
     ]);
   ============================================================ */

function preloadImages(urls) {
  if (!Array.isArray(urls)) return;
  urls.forEach(function (url) {
    var img = new Image();
    img.src = url;
  });
}

/* Expose globally so it can be called from passages */
window.preloadImages = preloadImages;
