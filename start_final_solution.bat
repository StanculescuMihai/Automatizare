@echo off
title Solutie Finala - Fix allowedHosts
echo ========================================
echo   SOLUTIE FINALA PENTRU ALLOWEDHOSTS
echo ========================================
echo.

echo Am implementat 3 solutii pentru eroarea webpack:
echo 1. CRACO cu configuratie personalizata
echo 2. Variabile de mediu specifice
echo 3. Versiune mai veche de react-scripts
echo.

echo [PASUL 1] Opresc procesele existente...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
echo ✅ Procese oprite

echo.
echo [PASUL 2] Pornesc backend-ul...
start "Backend - Port 3001" cmd /k "echo Backend: http://localhost:3001 && npm run dev"

echo Astept backend sa porneasca...
timeout /t 3 /nobreak >nul

echo.
echo [PASUL 3] Pornesc frontend cu fix pentru allowedHosts...
start "Frontend Fix" cmd /k "fix_webpack_error.bat"

echo.
echo ========================================
echo   INSTRUCTIUNI FINALE
echo ========================================
echo.
echo ✅ Backend pornit pe: http://localhost:3001
echo ⚠️  Frontend se va incerca pe: http://localhost:3000
echo.
echo 🔧 In terminalul frontend, se vor incerca:
echo    1. CRACO (configuratie avansata)
echo    2. Variabile de mediu speciale
echo    3. Versiune mai veche react-scripts
echo.
echo 🔑 Date de login:
echo    Username: admin
echo    Password: admin123
echo.
echo 📝 Daca nici una nu functioneaza:
echo    - Foloseste build static cu 'serve'
echo    - Sau acceseaza direct API-ul pe port 3001
echo.
echo Acest terminal poate fi inchis.
pause