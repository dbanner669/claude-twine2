class_name SizzlePalette
extends RefCounted
## Design-token palettes, translated 1-for-1 from sizzle/src/styles/reset.css.
## NIGHT = the `:root` values; DAY = the `body[data-mode="day"]` overrides.
## Key names mirror the --sz-* custom properties (dashes -> underscores,
## `--sz-` prefix dropped). Every UI script colors itself via
## ThemeService.color("name") so a palette swap restyles everything.

const NIGHT := {
	# Backgrounds — warm, never blue-leaning
	"ink_deep": Color("#0e0a08"),
	"ink": Color("#15100d"),
	"ink_2": Color("#1c1612"),
	"ink_3": Color("#241d18"),
	"ink_4": Color("#2e2620"),
	# Brick / wine accent
	"brick_deep": Color("#5a141a"),
	"brick": Color("#7b1f26"),
	"brick_glow": Color("#a8434b"),
	# Brass
	"brass_dim": Color("#8a6c43"),
	"brass": Color("#b8945e"),
	"brass_glow": Color("#d6b582"),
	# Text
	"cream_faint": Color("#7a7062"),
	"cream_soft": Color("#bdb09a"),
	"cream": Color("#ece2cd"),
	# Lines & borders
	"rule": Color(0.722, 0.580, 0.369, 0.18),
	"rule_strong": Color(0.722, 0.580, 0.369, 0.32),
	"rule_cool": Color(0.925, 0.886, 0.804, 0.08),
	# Day-header bronze variant text (layout.css literals; night values fall
	# back to cream so night styling is unchanged by the shared token)
	"bronze_cream": Color("#ece2cd"),
	"bronze_cream_bright": Color("#ece2cd"),
	# Status
	"composed": Color("#6f8c5a"),
	"rattled": Color("#c46b3d"),
	"redact": Color("#0a0807"),
	"status_rattled": Color("#b8443f"),
	"status_shaken": Color("#c46b3d"),
	"status_steady": Color("#6f8c5a"),
	"status_cool": Color("#4f7f9f"),
	"status_ice": Color("#263f6e"),
}

const DAY := {
	# Backgrounds — parchment-on-chrome
	"ink_deep": Color("#b89366"),
	"ink": Color("#efe2bf"),
	"ink_2": Color("#b8966a"),
	"ink_3": Color("#dcc699"),
	"ink_4": Color("#8c6b3a"),
	# Brick — deepened for legibility on light bg
	"brick_deep": Color("#5a141a"),
	"brick": Color("#8a1f28"),
	"brick_glow": Color("#b03540"),
	# Brass — saturated for light surfaces
	"brass_dim": Color("#614120"),
	"brass": Color("#8b5e25"),
	"brass_glow": Color("#b58440"),
	# Text — deep coffee, never pure black
	"cream_faint": Color("#6a4f30"),
	"cream_soft": Color("#3a2818"),
	"cream": Color("#1a0f06"),
	# Rules — sepia ink, stronger than night
	"rule": Color(0.157, 0.098, 0.039, 0.28),
	"rule_strong": Color(0.157, 0.098, 0.039, 0.45),
	"rule_cool": Color(0.157, 0.098, 0.039, 0.12),
	# Day-header bronze variant text (layout.css: #ecdcb8 header text,
	# #f6ead0 menu-link hover)
	"bronze_cream": Color("#ecdcb8"),
	"bronze_cream_bright": Color("#f6ead0"),
	# Status
	"composed": Color("#3e5a26"),
	"rattled": Color("#a8421f"),
	"redact": Color("#1a120a"),
	"status_rattled": Color("#8f251f"),
	"status_shaken": Color("#a8421f"),
	"status_steady": Color("#3e5a26"),
	"status_cool": Color("#245f7d"),
	"status_ice": Color("#173a68"),
}

# --- Typography tokens (reset.css --sz-text-* at --zoom 1) -------------------
const TEXT_BASE := 16
const TEXT_LG := 18   # base * 1.125
const TEXT_XL := 20   # base * 1.25
const TEXT_UI := 11   # tracked-uppercase UI labels
const TEXT_UI_MD := 13
const TEXT_MONO := 10 # footer
const TEXT_MONO_BODY := 12 # extract body

# Day-mode slots (setup.dayModeSlots in variables.twee / events.js).
const DAY_SLOTS := ["earlyMorning", "morning", "noon", "afternoon"]


static func get_palette(mode: String) -> Dictionary:
	return DAY if mode == "day" else NIGHT
