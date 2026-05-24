/* ============================================================
   AVATAR SETTINGS
   Registers SugarCube settings for avatar size, text size,
   and avatar visibility. These add entries to the Settings
   dialog that players can adjust.
   ============================================================ */

function initAvatarSize() {
  var callback = function () {
    var value = SugarCube.settings.avatarSize;
    var html = document.querySelector("html");
    var classes = html.classList;
    var sizes = {
      XXS: "avatar-size-xxs",
      XS: "avatar-size-xs",
      S: "avatar-size-s",
      M: "avatar-size-m",
      L: "avatar-size-l",
      XL: "avatar-size-xl",
      XXL: "avatar-size-xxl",
    };
    Object.values(sizes).forEach(function (s) {
      classes.remove(s);
    });
    classes.add(sizes[value]);
  };

  SugarCube.Setting.addList("avatarSize", {
    label: "Avatar Size:",
    list: ["XXS", "XS", "S", "M", "L", "XL", "XXL"],
    default: "M",
    onInit: callback,
    onChange: callback,
  });
}

function initTextSize() {
  var callback = function () {
    var value = SugarCube.settings.textSize;
    var html = document.querySelector("html");
    var classes = html.classList;
    var sizes = {
      XS: "size-xs",
      S: "size-s",
      M: "size-m",
      L: "size-l",
      XL: "size-xl",
    };
    Object.values(sizes).forEach(function (s) {
      classes.remove(s);
    });
    classes.add(sizes[value]);
  };

  SugarCube.Setting.addList("textSize", {
    label: "Text Size:",
    list: ["XS", "S", "M", "L", "XL"],
    default: "M",
    onInit: callback,
    onChange: callback,
  });
}

function initAvatarVisible() {
  var callback = function () {
    var value = SugarCube.settings.avatarVisible;
    var html = document.querySelector("html");
    if (value) {
      html.classList.remove("avatar-hidden");
    } else {
      html.classList.add("avatar-hidden");
    }
  };

  SugarCube.Setting.addToggle("avatarVisible", {
    label: "Avatar Visible:",
    default: true,
    onInit: callback,
    onChange: callback,
  });
}

function initAvatar() {
  initAvatarSize();
  initTextSize();
  initAvatarVisible();
}

/* Initialize via SugarCube's :storyready event (v2.32+) */
var avatarInitialized = false;
$(document).one(":storyready", function () {
  if (!avatarInitialized) {
    avatarInitialized = true;
    initAvatar();
  }
});

/* Fallback for older SugarCube versions */
$(function () {
  setTimeout(function () {
    if (!avatarInitialized) {
      avatarInitialized = true;
      initAvatar();
    }
  }, 40);
});
