class_name SizzleFormat
extends RefCounted
## Date/slot display formatting — ports sizzleFormatDate / sizzleFormatSlot
## from sizzle/src/scripts/macros.js (setup.timeSlotLabels in variables.twee).

const MONTH_NAMES := [
	"January", "February", "March", "April", "May", "June", "July",
	"August", "September", "October", "November", "December",
]

const SLOT_LABELS := {
	"earlyMorning": "Early morning",
	"morning": "Morning",
	"noon": "Noon",
	"afternoon": "Afternoon",
	"evening": "Evening",
	"night": "Night",
	"laterNight": "Later Night",
}


## {year, month, day, ...} -> "September 12, 2005"
static func format_date(date: Dictionary) -> String:
	var month := clampi(int(date.get("month", 1)), 1, 12)
	return "%s %d, %d" % [MONTH_NAMES[month - 1], int(date.get("day", 1)), int(date.get("year", 2005))]


static func slot_label(slot: String) -> String:
	return SLOT_LABELS.get(slot, slot.capitalize())


## Footer form: "September 12, 2005 · Morning" (FooterStatus passage).
static func footer_status(date: Dictionary) -> String:
	return "%s · %s" % [format_date(date), slot_label(String(date.get("slot", "")))]
