/* ============================================================
   PASSAGE EVENT HANDLERS
   Hooks into SugarCube's passage lifecycle events.
   ============================================================ */

/* Reset per-passage temporary state */
$(document).on(":passageinit", function () {
  State.variables.temp = {};
});

/* Scroll to top on passage change */
$(document).on(":passagedisplay", function () {
  var passages = document.getElementById("passages");
  if (passages) {
    passages.scrollTop = 0;
  }
});
