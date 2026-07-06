// godot-ink capability spike story (Phase 0.5, deliverable A).
// Self-contained: declares its own VAR + EXTERNAL surface.

VAR mood = "steady"
EXTERNAL spike_boost(x)

-> start

=== start ===
Hello from ink.
~ temp boosted = spike_boost(2)
Boost returned {boosted}.
Mood is {mood}.
* [Go left.] -> left
* [Go right.] -> right

=== left ===
You went left, into the dark.
* [Strike a match.] -> finale

=== right ===
You went right, toward the street.
* [Keep walking.] -> finale

=== finale ===
The spike is complete.
-> END
