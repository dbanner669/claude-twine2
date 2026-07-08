extends SceneTree
## One-shot generator for greybox placeholder layer PNGs on the canonical
## 523x1536 canvas (AVATAR-MANIFEST.md). Each layer is a translucent tinted
## band at its anatomical height so stack order is visually verifiable until
## the bakeoff pipeline delivers real art.
##
## Run: & <godot.exe> --headless --path godot -s res://tools/gen_placeholder_layers.gd

const CANVAS_W := 523
const CANVAS_H := 1536

## file -> [color, y_from (0..1), y_to (0..1), x_inset (0..0.5)]
const SPECS := {
	"20_body-medium.png": [Color(0.76, 0.60, 0.42, 0.85), 0.03, 1.0, 0.30],
	"25_nipples-medium.png": [Color(0.85, 0.40, 0.40, 0.9), 0.28, 0.31, 0.38],
	"26_genitals-medium.png": [Color(0.85, 0.40, 0.40, 0.9), 0.52, 0.55, 0.40],
	"30_hair-back-long-straight-brown.png": [Color(0.33, 0.21, 0.11, 0.9), 0.02, 0.45, 0.26],
	"40_face-default.png": [Color(0.93, 0.83, 0.68, 0.9), 0.045, 0.135, 0.38],
	"45_eyes-blue.png": [Color(0.30, 0.55, 0.85, 0.95), 0.072, 0.095, 0.40],
	"50_underwear-basic.png": [Color(0.92, 0.90, 0.86, 0.95), 0.50, 0.585, 0.34],
	"55_jeans-dark.png": [Color(0.16, 0.22, 0.38, 0.95), 0.55, 0.94, 0.31],
	"60_tshirt-black.png": [Color(0.10, 0.10, 0.12, 0.95), 0.22, 0.54, 0.29],
	"65_sneakers.png": [Color(0.88, 0.88, 0.90, 0.95), 0.945, 1.0, 0.33],
	"70_hair-front-long-straight-brown.png": [Color(0.42, 0.28, 0.16, 0.9), 0.02, 0.30, 0.30],
	"75_expression-calm.png": [Color(0.25, 0.75, 0.60, 0.55), 0.10, 0.125, 0.41],
	"76_expression-smile.png": [Color(0.90, 0.70, 0.20, 0.55), 0.10, 0.13, 0.41],
}


func _init() -> void:
	var dir := "res://avatar/placeholder"
	DirAccess.make_dir_recursive_absolute(dir)
	for file_name: String in SPECS:
		var spec: Array = SPECS[file_name]
		var image := Image.create(CANVAS_W, CANVAS_H, false, Image.FORMAT_RGBA8)
		image.fill(Color(0, 0, 0, 0))
		var color: Color = spec[0]
		var y_from := int(CANVAS_H * float(spec[1]))
		var y_to := int(CANVAS_H * float(spec[2]))
		var x_from := int(CANVAS_W * float(spec[3]))
		var x_to := CANVAS_W - x_from
		for y in range(y_from, min(y_to, CANVAS_H)):
			for x in range(x_from, x_to):
				image.set_pixel(x, y, color)
		var path := "%s/%s" % [dir, file_name]
		var err := image.save_png(ProjectSettings.globalize_path(path))
		print("%s %s" % ["WROTE" if err == OK else "FAILED", path])
	quit(0)
