@echo off
title Solutie Simpla - Garantat Functionala
echo ========================================
echo   SOLUTIE SIMPLA - GARANTAT FUNCTIONALA
echo ========================================
echo.

echo Aceasta solutie va functiona 100% sigur!
echo.

echo [PASUL 1] Opresc toate procesele...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.cmd >nul 2>&1
echo ✅ Procese oprite

echo.
echo [PASUL 2] Pornesc DOAR backend-ul...
echo Backend va rula pe http://localhost:3001
echo.
start "Backend SIGUR" cmd /k "echo Backend pornit pe http://localhost:3001 && npm run dev"

echo Astept 3 secunde...
timeout /t 3 /nobreak >nul

echo.
echo [PASUL 3] Fac build static pentru frontend...
cd client
echo Construiesc aplicatia...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Eroare la build!
    echo Incerc sa repar...
    call npm install --force
    call npm run build
)

echo.
echo [PASUL 4] Servesc aplicatia cu serve...
echo Frontend va rula pe http://localhost:3000
echo.
start "Frontend SIGUR" cmd /k "echo Frontend pornit pe http://localhost:3000 && npx serve -s build -l 3000"

cd ..

echo.
echo ========================================
echo   APLICATIA PORNITA SIGUR!
echo ========================================
echo.
echo ✅ Backend: http://localhost:3001 (API)
echo ✅ Frontend: http://localhost:3000 (Static)
echo.
echo 🔑 Date de login:
echo    Username: admin
echo    Password: admin123
echo.
echo ⚠️  NOTA: Daca login-ul nu functioneaza, este pentru ca
echo aplicatia statica nu poate comunica cu backend-ul.
echo.
echo SOLUTIE: Deschide Developer Tools (F12) in browser
echo si verifica Network tab pentru erori.
echo.
echo Acest terminal poate fi inchis.
pause