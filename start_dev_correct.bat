@echo off
title Start Development Mode - Corect
echo ========================================
echo   START DEVELOPMENT MODE - CORECT
echo ========================================
echo.

echo IMPORTANT: Pentru ca login-ul sa functioneze, aplicatia trebuie
echo sa ruleze in modul development (npm start), NU cu serve!
echo.

echo [PASUL 1] Verific daca exista .env...
if not exist ".env" (
    echo ⚠️  Fisierul .env nu exista. Il creez...
    if exist ".env.example" (
        copy .env.example .env >nul
        echo ✅ .env creat din .env.example
    ) else (
        echo # Database > .env
        echo DB_HOST=localhost >> .env
        echo DB_PORT=5432 >> .env
        echo DB_NAME=mijloace_fixe >> .env
        echo DB_USER=postgres >> .env
        echo DB_PASSWORD=postgres >> .env
        echo. >> .env
        echo # Server >> .env
        echo PORT=3001 >> .env
        echo NODE_ENV=development >> .env
        echo. >> .env
        echo # JWT >> .env
        echo JWT_SECRET=secret_foarte_sigur_pentru_dezvoltare >> .env
        echo JWT_EXPIRES_IN=24h >> .env
        echo ✅ .env creat cu setari de baza
    )
) else (
    echo ✅ Fisierul .env exista
)

echo.
echo [PASUL 2] Opresc orice proces existent pe porturile 3000 si 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
echo ✅ Procese oprite

echo.
echo [PASUL 3] Pornesc backend-ul pe portul 3001...
start "Backend - Mijloace Fixe" cmd /k "echo Pornesc backend pe http://localhost:3001... && npm run dev"

echo Astept 5 secunde pentru ca backend-ul sa porneasca...
timeout /t 5 /nobreak >nul

echo.
echo [PASUL 4] Pornesc frontend-ul pe portul 3000 (development mode)...
start "Frontend - Mijloace Fixe" cmd /k "echo Pornesc frontend pe http://localhost:3000... && cd client && npm start"

echo.
echo ========================================
echo   APLICATIA A FOST PORNITA CORECT!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo IMPORTANT: Am corectat configuratia proxy din client/package.json
echo de la port 5000 la port 3001.
echo.
echo Date de login:
echo Username: admin
echo Password: admin123
echo.
echo Daca login-ul nu functioneaza, ruleaza 'test_connection.bat'
echo pentru a verifica conexiunea.
echo.
echo Acest terminal poate fi inchis acum.
echo Apasa orice tasta pentru a inchide...
pause >nul