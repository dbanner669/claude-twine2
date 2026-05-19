@echo off
echo ============================================
echo  SugarCube Template - Tweego Compiler
echo ============================================
echo.

REM Check if Tweego is available
where tweego >nul 2>&1
if errorlevel 1 (
    echo ERROR: Tweego not found in PATH.
    echo Download from: https://www.motoslave.net/tweego/
    echo Add the tweego directory to your system PATH.
    pause
    exit /b 1
)

echo Compiling src/ to output.html...
tweego -o "%~dp0..\output.html" "%~dp0..\src\"

if errorlevel 1 (
    echo.
    echo ERROR: Compilation failed. Check the errors above.
    pause
    exit /b 1
)

echo.
echo SUCCESS: output.html created.
echo Open output.html in your browser to play.
pause
