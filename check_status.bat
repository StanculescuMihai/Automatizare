@echo off
title Verificare Status Aplicatie
echo ========================================
echo   VERIFICARE STATUS APLICATIE
echo ========================================
echo.

echo [1] Verific daca backend-ul ruleaza pe portul 3001...
netstat -an | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo ✅ Backend ruleaza pe portul 3001
) else (
    echo ❌ Backend NU ruleaza pe portul 3001
)

echo.
echo [2] Verific daca frontend-ul ruleaza pe portul 3000...
netstat -an | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ✅ Frontend ruleaza pe portul 3000
) else (
    echo ❌ Frontend NU ruleaza pe portul 3000
)

echo.
echo [3] Afisez toate porturile ocupate (3000-3010)...
echo Porturi ocupate:
netstat -an | findstr :300

echo.
echo [4] Verific procesele Node.js active...
tasklist | findstr node.exe
if %errorlevel% equ 0 (
    echo ✅ Procese Node.js gasite
) else (
    echo ❌ Nu sunt procese Node.js active
)

echo.
echo ========================================
echo   VERIFICARE COMPLETA
echo ========================================
echo.
echo Daca vezi ❌ la backend sau frontend, inseamna ca nu ruleaza.
echo Verifica terminalele deschise pentru erori.
echo.
pause