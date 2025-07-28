@echo off
echo ========================================
echo   START FRONTEND SEPARAT
echo ========================================
echo.

echo Directorul curent: %CD%
echo.

echo [PASUL 1] Ma mut in directorul client...
if exist "client" (
    cd client
    echo ✅ Am intrat in directorul client
    echo Directorul curent: %CD%
) else (
    echo ❌ Directorul client nu exista!
    pause
    exit /b 1
)

echo.
echo [PASUL 2] Verific package.json din client...
if exist "package.json" (
    echo ✅ client/package.json gasit
) else (
    echo ❌ client/package.json nu exista!
    pause
    exit /b 1
)

echo.
echo [PASUL 3] Verific node_modules din client...
if exist "node_modules" (
    echo ✅ client/node_modules gasit
) else (
    echo ⚠️  client/node_modules nu exista
    echo Instalez dependintele...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Eroare la instalarea dependintelor!
        pause
        exit /b 1
    )
)

echo.
echo [PASUL 4] Pornesc frontend-ul...
echo Comanda: npm start
echo.
echo ATENTIE: Daca vezi erori, noteaza-le!
echo Frontend-ul va rula pe http://localhost:3000
echo.
pause

echo Pornesc frontend in acest terminal...
npm start

echo.
echo Daca ajungi aici, frontend-ul s-a oprit.
echo Apasa orice tasta...
pause