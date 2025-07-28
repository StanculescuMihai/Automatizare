@echo off
title Test Basic - Nu se inchide
echo ========================================
echo   TEST FOARTE SIMPLU
echo ========================================
echo.

echo Pasul 1: Afisez directorul curent
echo Directorul curent: %CD%
echo.

echo Pasul 2: Afisez continutul directorului
echo Fisierele din directorul curent:
dir /b
echo.

echo Pasul 3: Verific daca exista package.json
if exist "package.json" (
    echo ✅ package.json EXISTA
) else (
    echo ❌ package.json NU EXISTA
)
echo.

echo Pasul 4: Verific daca exista server.js
if exist "server.js" (
    echo ✅ server.js EXISTA
) else (
    echo ❌ server.js NU EXISTA
)
echo.

echo Pasul 5: Verific daca exista directorul client
if exist "client" (
    echo ✅ Directorul client EXISTA
    echo Continutul directorului client:
    dir client /b
) else (
    echo ❌ Directorul client NU EXISTA
)
echo.

echo Pasul 6: Testez comanda node (fara verificare eroare)
echo Incerc: node --version
node --version
echo Cod de iesire node: %errorlevel%
echo.

echo Pasul 7: Testez comanda npm (fara verificare eroare)
echo Incerc: npm --version
npm --version
echo Cod de iesire npm: %errorlevel%
echo.

echo ========================================
echo   TESTUL S-A TERMINAT
echo ========================================
echo.
echo Toate testele au fost efectuate.
echo Acest terminal NU se va inchide automat.
echo.
echo Pentru a inchide, apasa orice tasta...
pause >nul

echo.
echo Ai apasat o tasta. Scriptul se va inchide acum.
echo Apasa din nou pentru a inchide complet...
pause >nul