// Phase 0.5 vertical slice — hand-converted from sizzle/src/content/blackout.twee
// (BLK-130 .. BLK-215) per sizzle/docs/godot/INK-CONVENTIONS.md.
//
// Construct coverage:
//   BLK_130 / BLK_145  — reveal-in-place -> choice + gather (append drift accepted)
//   BLK_160 / BLK_170  — # check knot-tag protocol, engine-set check_passed/check_total,
//                        one-shot grants guarded with ink once-semantics
//   BLK_180            — one-shot influence grant via knot visit-count guard
//   BLK_205            — advance_days day-crossing (composure reset) + mirror interpolation
//   BLK_210 / BLK_215  — # scene: branch_file_extract stubs
//
// Prose is trimmed versus the twee source (construct fidelity over prose
// fidelity for the slice); trims are listed in the port report.

INCLUDE ../mirror.ink
INCLUDE ../ops.ink

// Story-local narrative state (not mirrored; ink may assign freely).
VAR blk_climbed = false
VAR blk_skill_granted = false

-> BLK_130

// The propped door
=== BLK_130 ===
# id: BLK_130
# avatar: blk_day
~ set_date(2003, 8, 14, "afternoon")
~ set_header("JUST OFF THE DANFORTH", "Thursday afternoon")
You head up a side street to find some better shade. A few blocks in, a [url=gloss:walkup]walkup[/url] catches your eye. The front door is propped open with a brick, and through the gap comes sound.
Not ordinary building sound. Something lower and sustained. A sensual moan that lands wrong in your chest.
You stop.
* [You push the door open a little wider and look in.] -> BLK_135
* [You keep walking.]
    Half a block. Maybe a little more. The sound follows you, or the memory of it does, and it won't shake loose. At the corner your feet slow before you do. You look back. The door is still propped. Whatever that sound was is still wrong.
    * * [You cross back to the propped door.] -> BLK_135

// Crossing the little yard
=== BLK_135 ===
# id: BLK_135
# avatar: blk_day
~ set_header("WALKUP, JUST OFF THE DANFORTH", "Thursday afternoon")
Between the sidewalk and the door there's a small concrete yard: a bike against the railing, a planter dried out from the week. Through the gap, a dim hallway and the smell of someone's dinner gone cold on a stove.
Normal. Yet your unease has sharpened.
* [You go inside.] -> BLK_140

// The lobby
=== BLK_140 ===
# id: BLK_140
# avatar: blk_night
~ set_time("evening")
~ set_header("WALKUP LOBBY", "Thursday evening")
The lobby is a short hallway: mailboxes, a fire extinguisher, emergency lighting running off its battery pack in a dim orange arc.
The stairwell at the end of the hall is dark. Too dark. Not dark the way the rest of the city is dark. The light from outside reaches the bottom stair and stops, and what's beyond that point is a different quality of dark entirely.
* [You step further into the lobby.] -> BLK_145

// The man who won't go up
=== BLK_145 ===
# id: BLK_145
# avatar: blk_night
~ set_header("WALKUP LOBBY", "Thursday evening")
A heavy-set man in his fifties pokes his head out from a first floor unit, watching the stairwell the way you are.
"Don't go up," he says.
* [You ask if he knows what's happening.]
    He's quiet for a moment. "Light's been on since I moved in. Five years. Never went out." He nods toward the stairwell. "Now it has."
    He goes back inside. You hear his deadbolt.
    * * [You stand in the lobby with that.] -> BLK_150

// What the dark is doing
=== BLK_150 ===
# id: BLK_150
# avatar: blk_night
~ set_header("WALKUP LOBBY", "Thursday evening")
A woman comes out from a doorway right next to the stairwell, mid-thirties, in a sundress, looking up the stairwell and not at you. She's undoing the dress as she walks. It slips off her body by the time she reaches the edge of the light, and she climbs into the dark above completely nude.
You hear her footsteps continue up.
* [You watch the dark where she went.] -> BLK_155

// The sound from above
=== BLK_155 ===
# id: BLK_155
# avatar: blk_night
~ set_header("WALKUP LOBBY", "Thursday evening")
From above: sounds you can't mistake. Not one person's sounds. Several. They are very clearly fucking, loudly, in the dark.
You're warm and not from the heat. Whatever is up those stairs terrifies you. You're also sure something deep within you wants to go up there.
* [You haven't moved.] -> BLK_160

// The pull — # check protocol knot
=== BLK_160 ===
# id: BLK_160
# avatar: blk_night
# check: composure 2d6 8
~ set_header("WALKUP LOBBY", "Thursday evening")
The dark wants you in it. Part of you is ready to go. Your feet haven't moved. Yet.
{ check_passed:
    { not blk_skill_granted:
        ~ grant_skill("composure", 1)
        ~ blk_skill_granted = true
    }
    ~ blk_climbed = false
    Your feet stay. The want is real, but the part of you that decides is holding at the line, watching the rest of you strain toward the dark.
    * [You hold your position.] -> BLK_165
- else:
    ~ blk_climbed = true
    Your foot finds the first stair.
    * [You take a step.] -> BLK_165
}

// Two steps up
=== BLK_165 ===
# id: BLK_165
# avatar: blk_night
~ set_header("WALKUP STAIRWELL", "Thursday evening")
{ blk_climbed:
    Two steps up. Maybe three. The dark on the stairs is thicker than the lobby dark, and warmer, and the moment you crossed the bottom stair the want changed. Louder. Your hand is around the matchbook in your pocket. You stop taking steps.
- else:
    You don't go. Some part of you draws the line here, at the bottom stair, and holds it. The want is still there. But you hold.
}
* [You turn your attention to the dark itself.] -> BLK_170

// It's the dark itself — # check protocol knot
=== BLK_170 ===
# id: BLK_170
# avatar: blk_night
# check: academic 2d6 7
~ set_header("WALKUP LOBBY", "Thursday evening")
The man downstairs said the light had been on for five years. Maybe it was holding something back. A thing in the dark. Maybe the dark [i]is[/i] a thing.
{ check_passed:
    { not blk_skill_granted:
        ~ grant_skill("academic", 1)
        ~ blk_skill_granted = true
    }
    You reason it through, which is what you do. If the light keeps the dark manageable, introducing light interrupts whatever the dark has become. Practical. Testable. Your hand is already moving.
    * [You think of the matchbook.] -> BLK_175
- else:
    You don't reason it. There isn't time and the dark is still pulling. Your hand finds the matchbook before the thought does.
    * [Your hand closes around the matchbook.] -> BLK_175
}

// The matchbook
=== BLK_175 ===
# id: BLK_175
# avatar: blk_night
~ set_header("WALKUP LOBBY", "Thursday evening")
{ not blk_skill_granted:
    ~ grant_skill("streetwise", 1)
    ~ blk_skill_granted = true
}
The matchbook in your hand. You don't smoke.
You tear off a match and strike it against the strip. Nothing. The head skids and crumbles. Above you, an ecstatic scream. The dark is patient.
You tear off another match.
* [You strike.] -> BLK_180

// One match — one-shot influence grant (knot visit-count guard)
=== BLK_180 ===
# id: BLK_180
# avatar: blk_night
~ set_header("WALKUP LOBBY", "Thursday evening")
{ BLK_180 == 1:
    ~ adjust_influence(1)
    { blk_climbed:
        ~ adjust_influence(1)
    }
}
It catches.
A small orange flame, not much bigger than a thumbnail. The stairwell eases the way a held breath eases. The dark recoils, like a predator that exposed too much of itself. Gone. For now at least. The want in your body steps down, then down again.
Above you, the sounds change. Confusion where a moment ago there was none.
What do you do with the match?
* [You hold it up as high as your arm reaches.] -> BLK_185
* [You find a hallway votive on the window ledge and light it.] -> BLK_185
* [You fold a flyer from the mailbox rack into a torch and light it.] -> BLK_185

// The building exhales
=== BLK_185 ===
# id: BLK_185
# avatar: blk_night
~ set_header("WALKUP LOBBY", "Thursday evening")
From above: footsteps that are not the blank-faced climbing kind. Hesitation. A man's voice saying "oh god" in a way that does not sound ecstatic. The specific shame of not knowing why your clothes are undone, or who the stranger next to you is.
Nobody comes downstairs. Not yet.
* [You don't wait to be seen.] -> BLK_190

// Before anyone thanks you
=== BLK_190 ===
# id: BLK_190
# avatar: blk_night
~ set_header("WALKUP, JUST OFF THE DANFORTH", "Thursday evening")
You back out the way you came in. Across the lobby, past the mailboxes, across the little yard. You don't look back.
The street has moved on while you were inside. Thirty metres away something was banished, something you can't name, and the street never felt it.
* [You keep moving.] -> BLK_200

// The rest of the dark
=== BLK_200 ===
# id: BLK_200
# avatar: blk_night
~ set_header("TORONTO", "Thursday evening")
{ background == "RCMP constable" or background == "CSIS analyst":
    The walk back to your hotel takes more than two hours.
- else:
    The walk takes more than two hours, until you make it to your friend Genevieve's downtown condo to crash.
}
There was something wrong in that stairwell. You stopped it with those matches you shouldn't have had.
* [You get home sometime after nine.] -> BLK_205

// Still out — day crossing (advance_days resets composure)
=== BLK_205 ===
# id: BLK_205
# avatar: blk_day
~ advance_days(1, "morning")
~ set_header("TORONTO", "Friday morning")
{day_of_week} morning and the power is still out.
The city has settled into it: people on front porches with coffee, radio news through open windows, {background == "RCMP constable" or background == "CSIS analyst": the intersection outside your hotel still a mess|the intersection below Genevieve's building still a mess}. Ontario Hydro says power will probably be back today. They said probably yesterday too.
You haven't told anyone about the walkup.
* [A week passes.] -> BLK_210

// Incident report — Branch file extract STUB (native scene template later)
=== BLK_210 ===
# id: BLK_210
# screen: menu
# scene: branch_file_extract
# extract: blk_incident_report_03_DAN_0814
~ set_date(2003, 8, 21, "morning")
~ set_header("BRANCH FILE EXTRACT", "Thursday morning")
Incident File 03-DAN-0814, extract. Rendered by the native BranchFileExtract scene template; the slice shows a placeholder panel.
* [You turn the page.] -> BLK_215

// Recommendation — Branch file extract STUB
=== BLK_215 ===
# id: BLK_215
# screen: menu
# scene: branch_file_extract
# extract: blk_recommendation_r_flett
~ set_header("BRANCH FILE EXTRACT", "Thursday morning")
Recruitment Recommendation, R. Flett, 2003.08.21. Rendered by the native BranchFileExtract scene template; the slice shows a placeholder panel.
* [The file closes.] -> blk_slice_end

=== blk_slice_end ===
# id: blk_slice_end
The BLK slice ends here. CC_500 Summary lives outside the vertical slice.
-> END
