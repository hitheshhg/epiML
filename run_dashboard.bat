@echo off
title Chiguru Mobile & Tablet Dashboard
cls
echo ====================================================================
echo                 CHIGURU AGRI-LIFECYCLE MONITOR
echo                    Team TerraByte - YEN NOVA 1.0
echo ====================================================================
echo.
echo Starting Streamlit Dashboard on 0.0.0.0:8501...
echo.
echo --------------------------------------------------------------------
echo   OPEN THIS LINK ON YOUR MOBILE PHONE:
echo   http://10.126.32.174:8501
echo.
echo   (Ensure your mobile phone is connected to the same Wi-Fi network)
echo --------------------------------------------------------------------
echo.
"C:\Users\gurud\AppData\Local\Python\bin\python.exe" -m streamlit run software/dashboard.py --server.port 8501 --server.address 0.0.0.0 --server.headless true
pause
