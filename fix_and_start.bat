@echo off
title Fix si Start Aplicatie
echo ========================================
echo   FIX SI START APLICATIE
echo ========================================
echo.

echo [PASUL 1] Opresc procesele existente...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
echo ✅ Procese oprite

echo.
echo [PASUL 2] Reinstalez dependintele frontend (poate dura cateva minute)...
cd client
if exist "node_modules" (
    echo Sterg node_modules existent...
    rmdir /s /q node_modules
)
if exist "package-lock.json" (
    echo Sterg package-lock.json existent...
    del package-lock.json
)

echo Instalez dependintele...
npm install
if %errorlevel% neq 0 (
    echo ❌ Eroare la instalarea dependintelor!
    echo.
    echo Incerc cu npm install --legacy-peer-deps...
    npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ❌ Eroare si cu --legacy-peer-deps!
        echo.
        pause
        exit /b 1
    )
)
echo ✅ Dependinte frontend instalate

cd ..

echo.
echo [PASUL 3] Verific dependintele backend...
if not exist "node_modules" (
    echo Instalez dependintele backend...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Eroare la instalarea dependintelor backend!
        pause
        exit /b 1
    )
    echo ✅ Dependinte backend instalate
) else (
    echo ✅ Dependinte backend deja instalate
)

echo.
echo [PASUL 4] Pornesc backend-ul...
start "Backend - Mijloace Fixe" cmd /k "echo Backend pornit pe http://localhost:3001 && npm run dev"

echo Astept 5 secunde pentru backend...
timeout /t 5 /nobreak >nul

echo.
echo [PASUL 5] Pornesc frontend-ul...
start "Frontend - Mijloace Fixe" cmd /k "echo Frontend pornit pe http://localhost:3000 && cd client && npm start"

echo.
echo ========================================
echo   APLICATIA A FOST PORNITA!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Date de login:
echo Username: admin
echo Password: admin123
echo.
echo Daca inca nu functioneaza, verifica terminalele
echo deschise pentru erori specifice.
echo.
pause