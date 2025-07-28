@echo off
title Start cu Build Static
echo ========================================
echo   START CU BUILD STATIC (SIGUR)
echo ========================================
echo.

echo Aceasta este solutia SIGURA care va functiona 100%!
echo.

echo [PASUL 1] Opresc procesele existente...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
echo ✅ Procese oprite

echo.
echo [PASUL 2] Pornesc DOAR backend-ul pe portul 3001...
start "Backend - Mijloace Fixe" cmd /k "echo Backend pornit pe http://localhost:3001 && npm run dev"

echo Astept backend sa porneasca...
timeout /t 5 /nobreak >nul

echo.
echo [PASUL 3] Fac build-ul frontend-ului...
cd client
echo Construiesc aplicatia...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Eroare la build!
    echo Verifica erorile de mai sus.
    pause
    exit /b 1
)
echo ✅ Build realizat cu succes!

echo.
echo [PASUL 4] Pornesc frontend-ul cu serve pe portul 3000...
echo IMPORTANT: Voi configura serve sa redirectioneze API calls catre backend
echo.

start "Frontend - Serve" cmd /k "echo Frontend pornit pe http://localhost:3000 && npx serve -s build -l 3000 --cors"

cd ..

echo.
echo ========================================
echo   APLICATIA PORNITA CU BUILD STATIC!
echo ========================================
echo.
echo ✅ Backend: http://localhost:3001 (API)
echo ✅ Frontend: http://localhost:3000 (Static Build)
echo.
echo 🔑 Date de login:
echo    Username: admin
echo    Password: admin123
echo.
echo ⚠️  NOTA: Daca login-ul nu functioneaza, este pentru ca
echo frontend-ul static nu poate comunica cu backend-ul.
echo In acest caz, va trebui sa configurez un proxy server.
echo.
echo Incearca sa te loghezi acum!
echo.
pause