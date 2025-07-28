@echo off
title Fix Webpack allowedHosts Error
echo ========================================
echo   FIX WEBPACK ALLOWEDHOSTS ERROR
echo ========================================
echo.

echo [SOLUTIA 1] Incerc cu CRACO (configuratie avansata)...
cd client

echo Verific daca CRACO este instalat...
if not exist "node_modules\@craco" (
    echo Instalez CRACO...
    npm install @craco/craco --save-dev
    if %errorlevel% neq 0 (
        echo ❌ Eroare la instalarea CRACO!
        goto solution2
    )
    echo ✅ CRACO instalat
)

echo.
echo Pornesc cu CRACO...
echo Comanda: npm start (cu CRACO)
npm start
if %errorlevel% equ 0 (
    echo ✅ Aplicatia a pornit cu CRACO!
    goto end
)

:solution2
echo.
echo [SOLUTIA 2] Incerc fara CRACO (variabile de mediu)...
echo.

set GENERATE_SOURCEMAP=false
set SKIP_PREFLIGHT_CHECK=true
set DANGEROUSLY_DISABLE_HOST_CHECK=true
set HOST=0.0.0.0
set PORT=3000
set WDS_SOCKET_HOST=localhost
set WDS_SOCKET_PORT=3000
set CHOKIDAR_USEPOLLING=true
set FAST_REFRESH=false

echo Variabile de mediu setate pentru a evita eroarea webpack.
echo.
echo Pornesc cu react-scripts direct...
npx react-scripts start
if %errorlevel% equ 0 (
    echo ✅ Aplicatia a pornit cu react-scripts!
    goto end
)

:solution3
echo.
echo [SOLUTIA 3] Ultima sansa - versiune mai veche...
echo.
echo Instalez react-scripts 4.0.3 (versiune stabila)...
npm install react-scripts@4.0.3 --save-exact
if %errorlevel% neq 0 (
    echo ❌ Nu pot instala versiunea mai veche!
    goto failed
)

echo Pornesc cu versiunea mai veche...
npm start
if %errorlevel% equ 0 (
    echo ✅ Aplicatia a pornit cu versiunea mai veche!
    goto end
)

:failed
echo.
echo ❌ TOATE SOLUTIILE AU ESUAT!
echo.
echo Probleme posibile:
echo 1. Node.js versiune incompatibila
echo 2. Dependinte corupte
echo 3. Configuratie sistem
echo.
echo Recomandare: Foloseste build static cu 'serve'
echo.
pause
goto end

:end
echo.
echo Aplicatia ruleaza pe http://localhost:3000
echo Login: admin / admin123
echo.
pause