@echo off
echo =====================================================================
echo  epiML - Starting Full Stack with Docker Compose
echo =====================================================================
echo.
echo Checking for Docker...
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in your PATH.
    echo Please install Docker Desktop for Windows from:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo Building and starting containers in detached mode...
docker compose up -d --build

echo.
echo =====================================================================
echo  Containers launched!
echo =====================================================================
echo  - Next.js Web Application: http://localhost:3000
echo  - Admin ML Operations:     http://localhost:3000/?view=admin-ml
echo  - FastAPI ML Service:      http://localhost:8000/docs
echo  - Service Health Check:    http://localhost:8000/health
echo =====================================================================
echo.
pause
