/* ============================================================
   CUSTOM MACROS
   Three reusable macros extracted from the game's patterns:
   - <<page>>   : wraps content in a styled page container
   - <<first>>  : shows different content on 1st/Nth visits
   - <<rollDice>>: simple dice roller with NdS notation
   ============================================================ */

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
    var match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/);
    if (!match) {
      return this.error('Invalid dice notation: "' + notation + '"');
    }

    var count = parseInt(match[1], 10);
    var sides = parseInt(match[2], 10);
    var modifier = match[3] ? parseInt(match[3], 10) : 0;
    var total = 0;

    for (var i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    total += modifier;

    State.temporary.diceResult = total;

    if (this.payload && this.payload[0] && this.payload[0].contents) {
      jQuery(this.output).wiki(this.payload[0].contents);
    }
  },
});
