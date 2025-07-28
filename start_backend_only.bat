@echo off
title Start DOAR Backend
echo ========================================
echo   START DOAR BACKEND (100% SIGUR)
echo ========================================
echo.

echo [PASUL 1] Opresc procesele existente...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
echo ✅ Procese oprite

echo.
echo [PASUL 2] Pornesc DOAR backend-ul...
echo Backend va rula pe: http://localhost:3001
echo.

npm run dev

echo.
echo Backend-ul s-a oprit.
pause