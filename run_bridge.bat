@echo off
title Chiguru Arduino Serial Telemetry Bridge
cls
echo ====================================================================
echo             CHIGURU ARDUINO SERIAL TELEMETRY BRIDGE
echo                 Team TerraByte - YEN NOVA 1.0
echo ====================================================================
echo.
echo NOTE: If you have Arduino IDE Serial Monitor open, PLEASE CLOSE IT!
echo (Only one program can connect to COM8 at a time).
echo.
echo Connecting to Arduino on COM8 at 115200 baud...
echo.
"C:\Users\gurud\AppData\Local\Python\bin\python.exe" software/bridge.py --port COM8 --baud 115200
pause
