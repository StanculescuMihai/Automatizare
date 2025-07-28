@echo off
title Build Debug - Nu se inchide
echo ========================================
echo   BUILD DEBUG - AFISEAZA TOATE ERORILE
echo ========================================
echo.

echo Directorul curent: %CD%
echo.

echo [PASUL 1] Verific daca sunt in directorul principal...
if exist "client" (
    echo ✅ Directorul client exista
) else (
    echo ❌ Directorul client nu exista!
    echo Esti in directorul corect?
    echo.
    echo Apasa orice tasta pentru a continua oricum...
    pause >nul
)

echo.
echo [PASUL 2] Ma mut in directorul client...
cd client
echo Directorul curent dupa cd: %CD%
echo.

echo [PASUL 3] Verific continutul directorului client...
echo Fisierele din client:
dir /b
echo.

echo [PASUL 4] Verific daca exista package.json...
if exist "package.json" (
    echo ✅ package.json exista
) else (
    echo ❌ package.json nu exista!
)
echo.

echo [PASUL 5] Verific daca exista tsconfig.json...
if exist "tsconfig.json" (
    echo ✅ tsconfig.json exista
) else (
    echo ❌ tsconfig.json nu exista!
)
echo.

echo [PASUL 6] Verific daca exista node_modules...
if exist "node_modules" (
    echo ✅ node_modules exista
) else (
    echo ❌ node_modules nu exista! Instalez dependintele...
    npm install
    echo Cod de iesire npm install: %errorlevel%
)
echo.

echo [PASUL 7] Testez comanda npm...
echo Versiunea npm:
npm --version
echo Cod de iesire npm --version: %errorlevel%
echo.

echo [PASUL 8] Incerc build-ul cu afisarea completa a erorilor...
echo Comanda: npm run build
echo.
echo ATENTIE: Voi afisa TOATE erorile. Nu ma voi opri la prima eroare.
echo.
echo Apasa orice tasta pentru a continua...
pause >nul
echo.

echo ========== INCEPEREA BUILD-ULUI ==========
npm run build
echo ========== SFARSITUL BUILD-ULUI ==========
echo.
echo Cod de iesire build: %errorlevel%
echo.

echo [PASUL 9] Verific daca s-a creat directorul build...
if exist "build" (
    echo ✅ Directorul build a fost creat
    echo.
    echo Continutul directorului build:
    dir build /b
    echo.
    echo Verific daca exista index.html in build:
    if exist "build\index.html" (
        echo ✅ index.html exista in build
    ) else (
        echo ❌ index.html NU exista in build
    )
) else (
    echo ❌ Directorul build NU a fost creat
)

echo.
echo ========================================
echo   DIAGNOSTICUL S-A TERMINAT
echo ========================================
echo.
echo Acest terminal NU se va inchide automat.
echo Poti vedea toate erorile de mai sus.
echo.
echo Pentru a inchide, apasa orice tasta...
pause >nul

echo.
echo Ai apasat o tasta. Apasa din nou pentru a inchide complet...
pause >nul