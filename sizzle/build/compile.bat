@echo off
REM Compile Sizzle using local Tweego installation
REM Run from the sizzle/build/ directory

set TWEEGO_PATH=..\..\..\_tools\tweego\storyformats
..\..\..\_tools\tweego\tweego.exe -o ..\output.html ..\src\

echo.
if %ERRORLEVEL% EQU 0 (
    echo Build successful: sizzle/output.html
) else (
    echo Build FAILED
)
pause
