/* ============================================================
   CUSTOM MACROS
   Reusable macros extracted from the game's patterns:
   - <<page>>   : wraps content in a styled page container
   - <<first>>  : shows different content on 1st/Nth visits
   - <<rollDice>>: simple dice roller with NdS notation
   - <<skillCheck>>: player-facing roll interaction
   ============================================================ */

var sizzleSkillCheckId = 0;

function sizzleParseDiceNotation(notation) {
  if (typeof notation !== "string") {
    return null;
  }

  var match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) {
    return null;
  }

  return {
    count: parseInt(match[1], 10),
    sides: parseInt(match[2], 10),
    modifier: match[3] ? parseInt(match[3], 10) : 0,
  };
}

function sizzleRollDiceDetails(notation) {
  var parsed = sizzleParseDiceNotation(notation);
  var rolls = [];
  var total = parsed.modifier;

  for (var i = 0; i < parsed.count; i++) {
    var roll = Math.floor(Math.random() * parsed.sides) + 1;
    rolls.push(roll);
    total += roll;
  }

  return {
    notation: notation,
    rolls: rolls,
    modifier: parsed.modifier,
    total: total,
  };
}

function sizzleEscapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sizzleShowToast(message, kind) {
  var container = document.querySelector(".notifications-container");
  var toast = document.createElement("div");
  var toastKind = kind || "info";

  if (!container) {
    container = document.createElement("div");
    container.className = "notifications-container";
    document.body.appendChild(container);
  }

  toast.className = "notification --" + toastKind;
  toast.textContent = message;
  container.appendChild(toast);

  window.setTimeout(function () {
    toast.classList.add("--leaving");
  }, 3600);

  window.setTimeout(function () {
    toast.remove();
    if (!container.children.length) {
      container.remove();
    }
  }, 4000);
}

/* --- <<page>> macro ------------------------------------------
   Wraps passage content in a styled page container div.
   Usage:
     <<page>>
       Your passage text goes here.
       [[Choice A|NextPassage]]
       [[Choice B|OtherPassage]]
     <</page>>
   ------------------------------------------------------------ */
Macro.add("page", {
  tags: null,
  handler: function () {
    var header =
      '<div id="page" class="page"><div class="page-inner"><div class="text">';
    var contents = this.payload[0].contents;
    var footer = "</div></div></div>";
    jQuery(this.output).wiki(header + contents + footer);
  },
});

/* --- <<first>> macro -----------------------------------------
   Shows different content depending on how many times the
   player has visited the current passage.

   Usage:
     <<first>>
       Content shown on the first visit.
     <<then>>
       Content shown on the second visit.
     <<then>>
       Content shown on the third visit.
     <<finally>>
       Content shown on all subsequent visits.
     <</first>>

   If there is no <<finally>> and visits exceed the number of
   <<then>> blocks, nothing is displayed.
   ------------------------------------------------------------ */
Macro.add("first", {
  skipArgs: true,
  tags: ["then", "finally"],
  handler: function () {
    var $wrapper = $(document.createElement("span"));
    var last = this.payload[this.payload.length - 1];
    var visits = visited() - 1;
    var content;

    if (visits < this.payload.length) {
      content = this.payload[visits].contents;
    } else {
      content = last.name === "finally" ? last.contents : "";
    }

    $wrapper
      .wiki(content)
      .addClass("macro-" + this.name)
      .appendTo(this.output);
  },
});

/* --- <<rollDice>> macro --------------------------------------
   Rolls dice using standard NdS notation (e.g., "2d6").
   Stores result in _diceResult temporary variable.

   Usage:
     <<rollDice "2d6">>
       You rolled _diceResult!
     <</rollDice>>
   ------------------------------------------------------------ */
Macro.add("rollDice", {
  tags: null,
  handler: function () {
    if (this.args.length < 1) {
      return this.error("Dice notation not specified");
    }
    if (typeof this.args[0] !== "string") {
      return this.error("Dice notation must be a string");
    }

    var notation = this.args[0];
    var parsed = sizzleParseDiceNotation(notation);
    if (!parsed) {
      return this.error('Invalid dice notation: "' + notation + '"');
    }

    State.temporary.diceResult = sizzleRollDiceDetails(notation).total;

    if (this.payload && this.payload[0] && this.payload[0].contents) {
      jQuery(this.output).wiki(this.payload[0].contents);
    }
  },
});

/* --- <<skillCheck>> macro ------------------------------------
   Player-facing skill check with a button, dice animation, and
   delayed success/failure reveal.

   Usage:
     <<skillCheck "Composure" "2d6" _checkSkill 8>>
       <<success>>
         Success text.
       <<failure>>
         Failure text.
     <</skillCheck>>
   ------------------------------------------------------------ */
Macro.add("skillCheck", {
  tags: ["success", "failure"],
  handler: function () {
    if (this.args.length < 4) {
      return this.error("Expected skill name, dice notation, skill modifier, and difficulty");
    }

    var label = this.args[0];
    var notation = this.args[1];
    var skill = this.args[2];
    var difficulty = this.args[3];
    var parsed = sizzleParseDiceNotation(notation);

    if (typeof label !== "string") {
      return this.error("Skill check label must be a string");
    }
    if (!parsed) {
      return this.error('Invalid dice notation: "' + notation + '"');
    }
    if (typeof skill !== "number" || typeof difficulty !== "number") {
      return this.error("Skill modifier and difficulty must be numbers");
    }

    var successPayload = this.payload.find(function (part) {
      return part.name === "success";
    });
    var failurePayload = this.payload.find(function (part) {
      return part.name === "failure";
    });

    var checkId = "skill-check-" + (++sizzleSkillCheckId);
    var safeLabel = sizzleEscapeHtml(label);
    var skillText = (skill >= 0 ? "+" : "") + skill;
    var markup =
      '<div class="skill-check" id="' + checkId + '" data-state="ready">' +
        '<div class="skill-check-header">' +
          '<span class="skill-check-label">' + safeLabel + ' check</span>' +
          '<span class="skill-check-target">Target ' + difficulty + '</span>' +
        '</div>' +
        '<div class="skill-check-dice" aria-live="polite">' +
          '<span class="skill-check-rolls">--</span>' +
          '<span class="skill-check-plus">+</span>' +
          '<span class="skill-check-modifier">' + skillText + '</span>' +
          '<span class="skill-check-equals">=</span>' +
          '<span class="skill-check-total">?</span>' +
        '</div>' +
        '<button type="button" class="skill-check-button">Roll ' + sizzleEscapeHtml(notation) + '</button>' +
        '<div class="skill-check-outcome" hidden></div>' +
        '<div class="skill-check-reveal"></div>' +
      '</div>';

    var $check = jQuery(markup).appendTo(this.output);
    var $button = $check.find(".skill-check-button");
    var $rolls = $check.find(".skill-check-rolls");
    var $total = $check.find(".skill-check-total");
    var $outcome = $check.find(".skill-check-outcome");
    var $reveal = $check.find(".skill-check-reveal");

    $button.on("click", function () {
      var finalRoll = sizzleRollDiceDetails(notation);
      var finalTotal = finalRoll.total + skill;
      var succeeded = finalTotal >= difficulty;
      var steps = 18;
      var step = 0;

      $button.prop("disabled", true).text("Rolling...");
      $check.attr("data-state", "rolling");

      var interval = window.setInterval(function () {
        var preview = sizzleRollDiceDetails(notation);
        var previewTotal = preview.total + skill;

        step += 1;
        $rolls.text(preview.rolls.join(" + "));
        $total.text(previewTotal);

        if (step >= steps) {
          window.clearInterval(interval);
          $rolls.text(finalRoll.rolls.join(" + "));
          $total.text(finalTotal);
          $check.attr("data-state", succeeded ? "success" : "failure");
          $check.addClass(succeeded ? "--success" : "--failure");
          $button.text("Rolled").prop("disabled", true);

          window.setTimeout(function () {
            State.temporary.diceResult = finalRoll.total;
            State.temporary.checkSkill = skill;
            State.temporary.checkDifficulty = difficulty;
            State.temporary.checkTotal = finalTotal;
            State.temporary.checkSucceeded = succeeded;

            $outcome
              .prop("hidden", false)
              .text((succeeded ? "Success" : "Failure") + " - " + finalTotal + " vs " + difficulty);

            sizzleShowToast(
              safeLabel + " check: " + (succeeded ? "passed" : "failed") + " (" + finalTotal + " vs " + difficulty + ")",
              succeeded ? "success" : "warn"
            );

            $reveal
              .hide()
              .wiki(succeeded
                ? (successPayload ? successPayload.contents : "")
                : (failurePayload ? failurePayload.contents : ""))
              .slideDown(180);
          }, 360);
        }
      }, 80);
    });
  },
});

function sizzleComposureBounds() {
  return {
    min: (typeof setup !== "undefined" && typeof setup.composureMin === "number") ? setup.composureMin : 0,
    max: (typeof setup !== "undefined" && typeof setup.composureMax === "number") ? setup.composureMax : 7,
  };
}

function sizzleClampComposure(value) {
  var bounds = sizzleComposureBounds();
  return Math.max(bounds.min, Math.min(bounds.max, value));
}

function sizzleBaselineComposure(player) {
  if (!player) {
    return 0;
  }
  if (typeof player.baselineComposure === "number") {
    return player.baselineComposure;
  }
  if (player.skills && player.skills.composure && typeof player.skills.composure.level === "number") {
    return player.skills.composure.level;
  }
  return 0;
}

function sizzleEnsureComposureState() {
  var player = State.variables.player;
  if (!player) {
    return null;
  }

  if (typeof player.baselineComposure !== "number") {
    player.baselineComposure = sizzleClampComposure(sizzleBaselineComposure(player));
  }
  if (typeof player.currentComposure !== "number") {
    player.currentComposure = player.baselineComposure;
  }

  player.baselineComposure = sizzleClampComposure(player.baselineComposure);
  player.currentComposure = sizzleClampComposure(player.currentComposure);
  return player;
}

function sizzleTimeSlots() {
  if (typeof setup !== "undefined" && setup.timeSlots && setup.timeSlots.length) {
    return setup.timeSlots;
  }
  return ["earlyMorning", "morning", "noon", "afternoon", "evening", "night", "laterNight"];
}

function sizzleIsTimeSlot(slot) {
  return typeof slot === "string" && sizzleTimeSlots().indexOf(slot) !== -1;
}

function sizzleEnsureDateState() {
  if (!State.variables.date) {
    State.variables.date = {
      year: 2005,
      month: 9,
      day: 12,
      dayOfWeek: "Monday",
      slot: "morning",
    };
  }
  return State.variables.date;
}

function sizzleDayOfWeek(year, month, day) {
  var labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return labels[new Date(year, month - 1, day).getDay()];
}

function sizzleIsValidDateParts(year, month, day) {
  var date;

  if (typeof year !== "number" || typeof month !== "number" || typeof day !== "number") {
    return false;
  }
  if (!isFinite(year) || !isFinite(month) || !isFinite(day)) {
    return false;
  }
  if (Math.floor(year) !== year || Math.floor(month) !== month || Math.floor(day) !== day) {
    return false;
  }

  date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
}

function sizzleFormatSlot(slot) {
  if (typeof setup !== "undefined" && setup.timeSlotLabels && setup.timeSlotLabels[slot]) {
    return setup.timeSlotLabels[slot];
  }
  return slot ? String(slot) : "";
}

function sizzleFormatDate(date) {
  var source = date || (State.variables && State.variables.date) || {};
  var monthNames = (typeof setup !== "undefined" && setup.monthNames) ? setup.monthNames : [];
  var monthName = monthNames[source.month - 1] || "";

  return monthName + " " + source.day + ", " + source.year;
}

function sizzleExposeTimeFormatters() {
  if (typeof setup !== "undefined") {
    setup.formatDate = sizzleFormatDate;
    setup.formatSlot = sizzleFormatSlot;
  }
}

function sizzleResetCurrentComposureToBaseline() {
  var player = sizzleEnsureComposureState();
  if (player) {
    player.currentComposure = player.baselineComposure;
  }
}

function sizzleSetSlot(slot) {
  var date = sizzleEnsureDateState();
  date.slot = slot;
  return date;
}

function sizzleSetFullDate(year, month, day, slot) {
  var date = sizzleEnsureDateState();
  date.year = year;
  date.month = month;
  date.day = day;
  date.dayOfWeek = sizzleDayOfWeek(year, month, day);
  date.slot = slot;
  return date;
}

function sizzleShiftCalendarDays(date, count) {
  var shifted = new Date(date.year, date.month - 1, date.day);
  shifted.setDate(shifted.getDate() + count);
  date.year = shifted.getFullYear();
  date.month = shifted.getMonth() + 1;
  date.day = shifted.getDate();
  date.dayOfWeek = sizzleDayOfWeek(date.year, date.month, date.day);
  return date;
}

function sizzleAdvanceSlot(count) {
  var date = sizzleEnsureDateState();
  var slots = sizzleTimeSlots();
  var currentIndex = slots.indexOf(date.slot);
  var total;
  var days;

  if (currentIndex === -1) {
    return null;
  }

  total = currentIndex + count;
  days = Math.floor(total / slots.length);
  date.slot = slots[total % slots.length];

  if (days > 0) {
    sizzleShiftCalendarDays(date, days);
    sizzleResetCurrentComposureToBaseline();
  }

  return date;
}

function sizzleAdvanceDays(count, slot) {
  var date = sizzleEnsureDateState();

  if (count > 0) {
    sizzleShiftCalendarDays(date, count);
    sizzleResetCurrentComposureToBaseline();
  }

  date.slot = slot;
  return date;
}

/* StoryInit rebuilds setup, so expose formatter aliases at load and again
   before each passage renders. */
sizzleExposeTimeFormatters();
if (typeof jQuery !== "undefined") {
  jQuery(document).on(":passageinit", sizzleExposeTimeFormatters);
}

/* --- Composure macros ----------------------------------------
   Baseline Composure is the durable character-created value.
   Current Composure is volatile scene/day state.

   Usage:
     <<resetComposure>>
     <<setCurrentComposure 2>>
     <<adjustComposure -1>>
   ------------------------------------------------------------ */
Macro.add("resetComposure", {
  handler: function () {
    var player = sizzleEnsureComposureState();
    if (player) {
      player.currentComposure = player.baselineComposure;
    }
  },
});

Macro.add("setCurrentComposure", {
  handler: function () {
    if (this.args.length < 1 || typeof this.args[0] !== "number") {
      return this.error("Current Composure value must be a number");
    }

    var player = sizzleEnsureComposureState();
    if (player) {
      player.currentComposure = sizzleClampComposure(this.args[0]);
    }
  },
});

Macro.add("adjustComposure", {
  handler: function () {
    if (this.args.length < 1 || typeof this.args[0] !== "number") {
      return this.error("Composure adjustment must be a number");
    }

    var player = sizzleEnsureComposureState();
    if (player) {
      player.currentComposure = sizzleClampComposure(player.currentComposure + this.args[0]);
    }
  },
});

/* --- Time macros ---------------------------------------------
   Scene-entry helpers set authored time directly. Routine-action
   helpers advance time; only actual day crossings reset Current
   Composure to Baseline.

   Usage:
     <<setTime "evening">>
     <<setDate 2005 9 12 "morning">>
     <<advanceTime>>
     <<advanceTime 2>>
     <<advanceDays 1 "morning">>
   ------------------------------------------------------------ */
Macro.add("setTime", {
  handler: function () {
    var slot = this.args[0];

    if (this.args.length < 1 || !sizzleIsTimeSlot(slot)) {
      return this.error("Time slot must be one of: " + sizzleTimeSlots().join(", "));
    }

    sizzleSetSlot(slot);
  },
});

Macro.add("setDate", {
  handler: function () {
    var year = this.args[0];
    var month = this.args[1];
    var day = this.args[2];
    var slot = this.args[3];

    if (this.args.length < 4) {
      return this.error("Expected year, month, day, and time slot");
    }
    if (!sizzleIsValidDateParts(year, month, day)) {
      return this.error("Date values must be valid numbers");
    }
    if (!sizzleIsTimeSlot(slot)) {
      return this.error("Time slot must be one of: " + sizzleTimeSlots().join(", "));
    }

    /* Explicit scene-entry date changes do not reset composure; only
       elapsed-time helpers do that when the calendar day advances. */
    sizzleSetFullDate(year, month, day, slot);
  },
});

Macro.add("advanceTime", {
  handler: function () {
    var count = this.args.length ? this.args[0] : 1;
    var date = sizzleEnsureDateState();

    if (typeof count !== "number" || !isFinite(count) || Math.floor(count) !== count || count < 0) {
      return this.error("Time advance must be a non-negative whole number");
    }
    if (!sizzleIsTimeSlot(date.slot)) {
      return this.error("Current time slot is invalid: " + date.slot);
    }

    sizzleAdvanceSlot(count);
  },
});

Macro.add("advanceDays", {
  handler: function () {
    var count = this.args[0];
    var slot = this.args[1];

    if (this.args.length < 2) {
      return this.error("Expected day count and time slot");
    }
    if (typeof count !== "number" || !isFinite(count) || Math.floor(count) !== count || count < 0) {
      return this.error("Day advance must be a non-negative whole number");
    }
    if (!sizzleIsTimeSlot(slot)) {
      return this.error("Time slot must be one of: " + sizzleTimeSlots().join(", "));
    }

    sizzleAdvanceDays(count, slot);
  },
});
