@echo off
echo ========================================
echo   START SIMPLU - PAS CU PAS
echo ========================================
echo.

echo Directorul curent: %CD%
echo.

echo [PASUL 1] Verific daca exista package.json...
if exist "package.json" (
    echo ✅ package.json gasit
) else (
    echo ❌ package.json nu exista!
    echo Esti in directorul corect?
    pause
    exit /b 1
)

echo.
echo [PASUL 2] Verific daca exista server.js...
if exist "server.js" (
    echo ✅ server.js gasit
) else (
    echo ❌ server.js nu exista!
    pause
    exit /b 1
)

echo.
echo [PASUL 3] Verific daca exista client/package.json...
if exist "client\package.json" (
    echo ✅ client/package.json gasit
) else (
    echo ❌ client/package.json nu exista!
    pause
    exit /b 1
)

echo.
echo [PASUL 4] Testez comanda node...
echo Versiunea Node.js:
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js nu functioneaza!
    pause
    exit /b 1
)

echo.
echo [PASUL 5] Testez comanda npm...
echo Versiunea npm:
npm --version
if %errorlevel% neq 0 (
    echo ❌ npm nu functioneaza!
    pause
    exit /b 1
)

echo.
echo [PASUL 6] Pornesc backend-ul...
echo Comanda: npm run dev
echo.
echo ATENTIE: Daca vezi erori, noteaza-le!
echo.
pause

echo Pornesc backend in acest terminal...
npm run dev

echo.
echo Daca ajungi aici, backend-ul s-a oprit.
echo Apasa orice tasta...
pause