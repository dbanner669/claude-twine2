/* ============================================================
   MENU INITIALIZATION
   Wires up click handlers for the header UI buttons defined
   in StoryInterface. Handles saves, settings, character sheet,
   restart, and avatar rotation.
   ============================================================ */

function initMenu() {
  var $doc = $(document);

  function canGoBackward() {
    if (typeof State === "undefined" || State.length <= 1) {
      return false;
    }

    if (typeof Story !== "undefined" && typeof State.passage === "string") {
      var passage = Story.get(State.passage);
      if (passage && passage.tags && passage.tags.includes("history-root")) {
        return false;
      }
    }

    return true;
  }

  function canGoForward() {
    return typeof State !== "undefined" && State.length < State.size;
  }

  function setHistoryButtonState($button, enabled) {
    $button.prop("disabled", !enabled);
    $button.attr("aria-disabled", enabled ? "false" : "true");
  }

  function syncHistoryButtons() {
    setHistoryButtonState($("#history-backward"), canGoBackward());
    setHistoryButtonState($("#history-forward"), canGoForward());
  }

  $doc.on("click", "#restartId", function () {
    SugarCube.UI.restart();
    syncHistoryButtons();
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

  $doc.on("click", "#history-backward", function () {
    if (canGoBackward() && typeof Engine !== "undefined" && typeof Engine.backward === "function") {
      Engine.backward();
    }
    return false;
  });

  $doc.on("click", "#history-forward", function () {
    if (canGoForward() && typeof Engine !== "undefined" && typeof Engine.forward === "function") {
      Engine.forward();
    }
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

  $doc.on(":passageend :historyupdate", syncHistoryButtons);
  setTimeout(syncHistoryButtons, 0);
}

initMenu();

function initGlossaryTooltips() {
  var activeTooltip = null;
  var activeTerm = null;

  function hideTooltip() {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
    document.documentElement.classList.remove("glossary-tooltip-active");
    activeTerm = null;
  }

  function positionTooltip(term, tooltip) {
    var termRect = term.getBoundingClientRect();
    var tooltipRect = tooltip.getBoundingClientRect();
    var gap = 10;
    var viewportPad = 12;
    var center = termRect.left + termRect.width / 2;
    var left = center - tooltipRect.width / 2;
    var top = termRect.top - tooltipRect.height - gap;

    left = Math.max(viewportPad, Math.min(left, window.innerWidth - tooltipRect.width - viewportPad));

    if (top < viewportPad) {
      top = termRect.bottom + gap;
      tooltip.classList.add("--below");
    } else {
      tooltip.classList.remove("--below");
    }

    var arrowLeft = center - left;
    arrowLeft = Math.max(12, Math.min(arrowLeft, tooltipRect.width - 12));

    tooltip.style.left = Math.round(left) + "px";
    tooltip.style.top = Math.round(top) + "px";
    tooltip.style.setProperty("--tooltip-arrow-left", Math.round(arrowLeft) + "px");
  }

  function showTooltip(term) {
    var source = term.querySelector(".glossary-tooltip");

    if (!source) {
      return;
    }

    hideTooltip();
    activeTerm = term;
    activeTooltip = document.createElement("div");
    activeTooltip.className = "glossary-tooltip-overlay";
    activeTooltip.innerHTML = source.innerHTML;
    document.body.appendChild(activeTooltip);
    document.documentElement.classList.add("glossary-tooltip-active");

    positionTooltip(term, activeTooltip);
  }

  window.SizzleGlossary = {
    show: showTooltip,
    hide: hideTooltip,
  };

  document.documentElement.classList.add("glossary-tooltips-enhanced");

  document.addEventListener("pointerover", function (ev) {
    var term = ev.target.closest && ev.target.closest(".glossary-term");
    if (term && term !== activeTerm) {
      showTooltip(term);
    }
  });

  document.addEventListener("pointerout", function (ev) {
    var term = ev.target.closest && ev.target.closest(".glossary-term");
    if (term && !term.contains(ev.relatedTarget)) {
      hideTooltip();
    }
  });

  document.addEventListener("focusin", function (ev) {
    var term = ev.target.closest && ev.target.closest(".glossary-term");
    if (term) {
      showTooltip(term);
    }
  });

  document.addEventListener("focusout", function (ev) {
    var term = ev.target.closest && ev.target.closest(".glossary-term");
    if (term) {
      hideTooltip();
    }
  });

  document.addEventListener("scroll", function () {
    if (activeTooltip && activeTerm) {
      positionTooltip(activeTerm, activeTooltip);
    }
  }, true);

  window.addEventListener("resize", hideTooltip);

  document.addEventListener(":passagestart", hideTooltip);
  window.addEventListener("scroll", hideTooltip);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      document.documentElement.classList.add("glossary-tooltips-enhanced");
    });
  } else {
    document.documentElement.classList.add("glossary-tooltips-enhanced");
  }
}

initGlossaryTooltips();

/* ESC key closes dialogs */
$(document).on("keydown", function (ev) {
  if (ev.keyCode === 27) {
    $(".glossary-tooltip-overlay").remove();
    Dialog.close();
  }
});
