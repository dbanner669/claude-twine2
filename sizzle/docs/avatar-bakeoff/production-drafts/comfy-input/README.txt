Copy these PNGs into ComfyUI/input before loading the Sizzle Flux2 mask-edit workflow.
The canonical 523x1536 images are padded on the right to 576x1536 for FLUX latent compatibility.
After Comfy generation, crop the rightmost 53 px to return to the canonical 523x1536 canvas.
For Qwen Image Edit 2509 clothing tests, use sizzle_alex_noface_blank_qwen2509_canvas_624x1672.png.
It keeps the 576x1536 padded avatar unchanged at x=24,y=68 inside a 624x1672 canvas.
After Qwen generation, crop x=24,y=68,w=576,h=1536, then crop the rightmost 53 px for canonical 523x1536.
