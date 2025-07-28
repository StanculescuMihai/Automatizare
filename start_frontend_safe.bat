@echo off
title Start Frontend Safe Mode
echo ========================================
echo   START FRONTEND - MOD SIGUR
echo ========================================
echo.

echo Ma mut in directorul client...
cd client

echo.
echo Pornesc frontend-ul cu configurari sigure...
echo.
echo ATENTIE: Daca vezi erori, lasa aplicatia sa ruleze oricum.
echo Multe erori de webpack sunt doar warning-uri.
echo.

set GENERATE_SOURCEMAP=false
set SKIP_PREFLIGHT_CHECK=true
set DANGEROUSLY_DISABLE_HOST_CHECK=true
set HOST=0.0.0.0
set PORT=3000

echo Variabile de mediu setate:
echo GENERATE_SOURCEMAP=false
echo SKIP_PREFLIGHT_CHECK=true
echo DANGEROUSLY_DISABLE_HOST_CHECK=true
echo HOST=0.0.0.0
echo PORT=3000
echo.

echo Pornesc cu npm start...
npm start

echo.
echo Frontend-ul s-a oprit.
echo Apasa orice tasta pentru a inchide...
pause