@echo off
title Test Conexiune Frontend-Backend
echo ========================================
echo   TEST CONEXIUNE FRONTEND-BACKEND
echo ========================================
echo.

echo [1] Verific daca backend-ul ruleaza pe portul 3001...
netstat -an | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo ✅ Backend ruleaza pe portul 3001
) else (
    echo ❌ Backend NU ruleaza pe portul 3001
    echo.
    echo PROBLEMA: Backend-ul nu ruleaza!
    echo Solutie: Ruleaza 'force_start.bat' pentru a porni backend-ul
    echo.
    pause
    exit /b 1
)

echo.
echo [2] Verific daca frontend-ul ruleaza pe portul 3000...
netstat -an | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ✅ Frontend ruleaza pe portul 3000
) else (
    echo ❌ Frontend NU ruleaza pe portul 3000
    echo.
    echo PROBLEMA: Frontend-ul nu ruleaza!
    echo Solutie: Ruleaza 'force_start.bat' pentru a porni frontend-ul
    echo.
    pause
    exit /b 1
)

echo.
echo [3] Testez conexiunea la backend prin curl...
echo Testez: http://localhost:3001/api/auth/login
echo.

curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" 2>nul
if %errorlevel% equ 0 (
    echo.
    echo ✅ Backend-ul raspunde la request-uri
) else (
    echo ❌ Backend-ul nu raspunde sau curl nu este instalat
    echo.
    echo Incerc cu PowerShell...
    powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -Body (@{username='admin';password='admin123'} | ConvertTo-Json) -ContentType 'application/json'; Write-Host 'Backend raspunde:'; $response } catch { Write-Host 'Eroare la conectarea la backend:' $_.Exception.Message }"
)

echo.
echo [4] Verific daca exista proxy sau configurare speciala...
echo.
echo Daca frontend-ul ruleaza pe serve (build), este posibil sa nu
echo aiba configurata redirectarea catre backend.
echo.
echo Pentru development, backend si frontend trebuie sa ruleze separat:
echo - Backend pe http://localhost:3001
echo - Frontend pe http://localhost:3000 (cu npm start, nu serve)
echo.

echo ========================================
echo   TESTUL S-A TERMINAT
echo ========================================
echo.
pause