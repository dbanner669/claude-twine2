/* ============================================================
   MENU INITIALIZATION
   Wires up click handlers for the header UI buttons defined
   in StoryInterface. Handles saves, settings, character sheet,
   restart, and avatar rotation.
   ============================================================ */

function initMenu() {
  var $doc = $(document);

  $doc.on("click", "#restartId", function () {
    SugarCube.UI.restart();
    return false;
  });

  $doc.on("click", "#settingsId", function () {
    SugarCube.UI.settings();
    return false;
  });

  $doc.on("click", "#savesId", function () {
    SugarCube.UI.saves();
    return false;
  });

  $doc.on("click", "#turnAvatar", function () {
    if (State.length > 3) {
      State.variables.avatar.showRear = !State.variables.avatar.showRear;
      new Wikifier(null, '<<replace "#avatar-container">><<avatar>><</replace>>');
    }
    return false;
  });

  $doc.on("click", "#characterId", function () {
    SugarCube.Dialog.setup("Character Sheet", "dialog-character-sheet");
    var $dialog = $("#ui-dialog");
    $dialog.addClass("dialog-character-sheet");
    Dialog.open({}, function () {
      $dialog.removeClass("dialog-character-sheet");
    }).wiki("<<charSheet>>");
    return false;
  });

  /* Dropdown menu toggle */
  $doc.on("click", ".dropdown-toggle", function (e) {
    e.preventDefault();
    var target = $(this).attr("data-target");
    $(target).toggleClass("dropdown-visible");
  });

  /* Close dropdown when clicking elsewhere */
  $doc.on("click", function (e) {
    if (!$(e.target).closest(".dropdown-toggle").length) {
      $(".dropdown-content").removeClass("dropdown-visible");
    }
  });
}

initMenu();

/* ESC key closes dialogs */
$(document).on("keydown", function (ev) {
  if (ev.keyCode === 27) {
    Dialog.close();
  }
});
