shader_type canvas_item;
// Atmosphere overlay — vignette + film grain. Ports the body::before /
// body::after fixed overlays from sizzle/src/styles/layout.css (268-305)
// onto the full 1920x1080 stage (PARITY-MATRIX "rebuild -> shaders").
//
// Night: radial vignette (transparent to 40%, rgba(0,0,0,0.55) at edge,
//        centered 50%/35%, ellipse 120%x80%) + warm dot grain, 6% overlay.
// Day:   sunbeam top-right + bottom sepia shadow + same grain, 10% multiply.
//
// The grain is STATIC by design (CSS pattern, not animated noise). Screen
// texture is sampled so the overlay/multiply blend modes match the CSS.

uniform bool day = false;
uniform sampler2D screen_tex : hint_screen_texture;

// 1px dot in an NxN pixel tile, dot centered in the tile (the CSS
// radial-gradient(color 1px, transparent 1px) background pattern).
float grain_dot(vec2 px, float spacing, vec2 grid_offset) {
	vec2 p = mod(px - grid_offset, spacing);
	return 1.0 - step(1.0, length(p - spacing * 0.5));
}

// Normalized elliptical gradient distance: 0 at center, 1 at the ellipse
// edge defined by radii as fractions of the viewport.
float ellipse_t(vec2 uv, vec2 center, vec2 radii) {
	return length((uv - center) / radii);
}

vec3 blend_overlay(vec3 base, vec3 blend) {
	vec3 lo = 2.0 * base * blend;
	vec3 hi = 1.0 - 2.0 * (1.0 - base) * (1.0 - blend);
	return mix(lo, hi, step(vec3(0.5), base));
}

void fragment() {
	vec3 base = texture(screen_tex, SCREEN_UV).rgb;
	vec2 px = SCREEN_UV / SCREEN_PIXEL_SIZE;

	// --- Vignette / light washes (body::before) ---------------------------
	if (day) {
		// Bottom shadow: transparent 50% -> rgba(70,40,20,0.25) at 100%.
		float ts = ellipse_t(SCREEN_UV, vec2(0.5, 1.0), vec2(1.2, 0.8));
		float shadow_a = 0.25 * clamp((ts - 0.5) / 0.5, 0.0, 1.0);
		base = mix(base, vec3(0.275, 0.157, 0.078), shadow_a);
		// Sunbeam: rgba(255,228,170,0.35) at center -> transparent at 55%.
		float tb = ellipse_t(SCREEN_UV, vec2(0.7, 0.2), vec2(0.8, 0.6));
		float beam_a = 0.35 * clamp(1.0 - tb / 0.55, 0.0, 1.0);
		base = mix(base, vec3(1.0, 0.894, 0.667), beam_a);
	} else {
		// Night vignette: transparent to 40%, rgba(0,0,0,0.55) at 100%.
		float tv = ellipse_t(SCREEN_UV, vec2(0.5, 0.35), vec2(1.2, 0.8));
		float vig_a = 0.55 * clamp((tv - 0.4) / 0.6, 0.0, 1.0);
		base = mix(base, vec3(0.0), vig_a);
	}

	// --- Film grain (body::after) ------------------------------------------
	// Two dot grids: rgba(255,235,200,0.6) @ 3px and rgba(255,235,200,0.4)
	// @ 7px offset (2,3); first grid paints over the second.
	float g1 = grain_dot(px, 3.0, vec2(0.0));
	float g2 = grain_dot(px, 7.0, vec2(2.0, 3.0));
	float dot_a = g1 * 0.6 + (1.0 - g1) * g2 * 0.4;
	vec3 grain_rgb = vec3(1.0, 0.921, 0.784);
	float layer_opacity = day ? 0.10 : 0.06;
	vec3 blended = day ? base * grain_rgb : blend_overlay(base, grain_rgb);
	base = mix(base, blended, dot_a * layer_opacity);

	COLOR = vec4(base, 1.0);
}
