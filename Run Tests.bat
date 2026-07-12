@echo off
rem Double-click to run the full GUT suite (unit + differential) headless.
rem The window stays open so the summary is readable.
"%~dp0_tools\godot4\Godot_v4.7-stable_mono_win64\Godot_v4.7-stable_mono_win64.exe" --headless --path "%~dp0godot" -s res://addons/gut/gut_cmdln.gd -gdir=res://test/unit -gdir=res://test/differential -gexit
echo.
pause
