/* ============================================================
   PASSAGE EVENT HANDLERS
   Hooks into SugarCube's passage lifecycle events.
   ============================================================ */

/* Reset per-passage temporary state */
$(document).on(":passageinit", function () {
  State.variables.temp = {};
});

/* Scroll to top on passage change + set screen mode + day/night */
$(document).on(":passagedisplay", function () {
  var passages = document.getElementById("passages");
  if (passages) {
    passages.scrollTop = 0;
  }

  /* Stamp data-screen on #game so CSS grid can adapt layout.
     Passage tags control which mode:
       character-creation  → "creation" (single-column, no avatar)
       avatar-hidden       → "menu" (single-column, no avatar)
       (default)           → "scene" (two-column with avatar)
     Character-creation takes precedence because those passages
     also carry avatar-hidden. */
  var game = document.getElementById("game");
  if (game) {
    var psg = Story.get(State.passage);
    var passageTags = (psg && psg.tags) ? psg.tags : [];

    if (passageTags.indexOf("character-creation") !== -1) {
      game.setAttribute("data-screen", "creation");
    } else if (passageTags.indexOf("avatar-hidden") !== -1) {
      game.setAttribute("data-screen", "menu");
    } else {
      game.setAttribute("data-screen", "scene");
    }
  }

  /* Day/night mode — set on <body> so CSS custom property
     overrides cascade to all descendants AND body pseudo-elements.
     Passage tags override: "daytime" forces day, "nighttime" forces night.
     Otherwise determined by $date.slot. */
  var psg2 = Story.get(State.passage);
  var tags = (psg2 && psg2.tags) ? psg2.tags : [];
  var mode;

  if (tags.indexOf("daytime") !== -1) {
    mode = "day";
  } else if (tags.indexOf("nighttime") !== -1) {
    mode = "night";
  } else {
    var date = State.variables.date || {};
    var slot = date.slot || "noon";
    var daySlots = (typeof setup !== "undefined" && setup.dayModeSlots)
      ? setup.dayModeSlots
      : ["earlyMorning", "morning", "noon", "afternoon"];
    mode = daySlots.indexOf(slot) !== -1 ? "day" : "night";
  }

  document.body.setAttribute("data-mode", mode);
});
