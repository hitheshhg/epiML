@echo off
title Chiguru Next.js Modern Agri-Web Dashboard
cls
echo ====================================================================
echo                 CHIGURU SMART AGRI-CPS WEB INTERFACE
echo              Team TerraByte - YEN NOVA 1.0 (Next.js + TS)
echo ====================================================================
echo.
echo Starting Next.js Web Dashboard on port 3000...
echo.
echo --------------------------------------------------------------------
echo   ACCESS ON THIS LAPTOP:
echo   http://localhost:3000
echo.
echo   ACCESS WIRELESSLY ON YOUR PHONE / TABLET:
echo   http://10.126.32.174:3000
echo.
echo   (Ensure phone is connected to the same Wi-Fi / Hotspot)
echo --------------------------------------------------------------------
echo.
cd frontend
call npm run dev
pause
