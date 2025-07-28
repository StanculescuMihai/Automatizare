@echo off
title Rebuild si Serve Aplicatie
echo ========================================
echo   REBUILD SI SERVE APLICATIE
echo ========================================
echo.

echo [PASUL 1] Ma mut in directorul client...
cd client
if %errorlevel% neq 0 (
    echo ❌ Nu pot accesa directorul client!
    pause
    exit /b 1
)

echo ✅ Sunt in directorul client
echo.

echo [PASUL 2] Sterg directorul build existent (daca exista)...
if exist "build" (
    rmdir /s /q build
    echo ✅ Directorul build sters
) else (
    echo ⚠️  Directorul build nu exista
)
echo.

echo [PASUL 3] Construiesc aplicatia (npm run build)...
echo Aceasta operatie poate dura cateva minute...
echo.
npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ EROARE la build!
    echo Verifica erorile de mai sus.
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ Build realizat cu succes!
)

echo.
echo [PASUL 4] Verific daca directorul build a fost creat...
if exist "build" (
    echo ✅ Directorul build exista
    echo.
    echo Continutul directorului build:
    dir build /b
) else (
    echo ❌ Directorul build nu a fost creat!
    pause
    exit /b 1
)

echo.
echo [PASUL 5] Pornesc serverul cu serve...
echo Aplicatia va fi disponibila la: http://localhost:3000
echo Pentru a opri serverul, apasa Ctrl+C
echo.
echo Pornesc serve -s build...
serve -s build

echo.
echo Serverul s-a oprit.
pause