@echo off
echo =====================================================================
echo  epiML - Running Standalone ML Service in Docker (Port 8000)
echo =====================================================================
echo.
echo Building ML Service Docker Image...
docker build -t epiml-ml-service:latest ./ml-service

echo.
echo Starting container 'epiml-ml-service' on port 8000...
docker stop epiml-ml-service 2>nul
docker rm epiml-ml-service 2>nul
docker run -d ^
  --name epiml-ml-service ^
  -p 8000:8000 ^
  -v epiml_artifacts:/app/artifacts ^
  epiml-ml-service:latest

echo.
echo =====================================================================
echo  ML Service is running!
echo  Swagger UI: http://localhost:8000/docs
echo  Health:     http://localhost:8000/health
echo.
echo  You can now run 'npm run dev' inside the 'frontend' folder,
echo  and it will automatically communicate with this container!
echo =====================================================================
echo.
pause
