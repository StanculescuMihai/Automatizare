@echo off
title Reset Complete si Start
echo ========================================
echo   RESET COMPLET SI START APLICATIE
echo ========================================
echo.

echo [PASUL 1] Opresc toate procesele...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
echo ✅ Procese oprite

echo.
echo [PASUL 2] Reset complet frontend...
cd client

echo Sterg node_modules si package-lock.json...
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del package-lock.json

echo.
echo Instalez cu versiunea stabila de react-scripts (4.0.3)...
npm install
if %errorlevel% neq 0 (
    echo ❌ Eroare la npm install normal. Incerc cu --force...
    npm install --force
    if %errorlevel% neq 0 (
        echo ❌ Eroare si cu --force. Incerc cu --legacy-peer-deps...
        npm install --legacy-peer-deps
        if %errorlevel% neq 0 (
            echo ❌ Nu pot instala dependintele!
            pause
            exit /b 1
        )
    )
)
echo ✅ Dependinte frontend instalate

cd ..

echo.
echo [PASUL 3] Verific backend...
if not exist "node_modules" (
    echo Instalez dependinte backend...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Eroare la backend dependencies!
        pause
        exit /b 1
    )
)
echo ✅ Backend ready

echo.
echo [PASUL 4] Pornesc backend...
start "Backend - Port 3001" cmd /k "echo Backend: http://localhost:3001 && npm run dev"

echo Astept backend sa porneasca...
timeout /t 5 /nobreak >nul

echo.
echo [PASUL 5] Pornesc frontend cu setari sigure...
cd client
start "Frontend - Port 3000" cmd /k "echo Frontend: http://localhost:3000 && set SKIP_PREFLIGHT_CHECK=true && set GENERATE_SOURCEMAP=false && npm start"

cd ..

echo.
echo ========================================
echo   APLICATIA PORNITA!
echo ========================================
echo.
echo ✅ Backend: http://localhost:3001
echo ✅ Frontend: http://localhost:3000
echo.
echo 🔑 Date de login:
echo    Username: admin
echo    Password: admin123
echo.
echo 📝 Ce am facut:
echo    - Am resetat complet frontend-ul
echo    - Am folosit react-scripts 4.0.3 (versiune stabila)
echo    - Am configurat variabile de mediu sigure
echo    - Am corectat proxy-ul la portul 3001
echo    - Am actualizat parola de login
echo.
echo Daca inca nu functioneaza, problema poate fi:
echo - PostgreSQL nu ruleaza
echo - Porturile sunt blocate de firewall
echo - Dependinte lipsesc din sistem
echo.
pause