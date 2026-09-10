@echo off
title J.A.R.V.I.S Command Center
echo =====================================================================
echo    J.A.R.V.I.S — JUST A RATHER VERY INTELLIGENT SYSTEM (Mark VII)
echo =====================================================================
echo.

IF EXIST "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) ELSE IF EXIST ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
)

echo Starting JARVIS Core and Interface...
python run_jarvis.py
pause
