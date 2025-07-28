@echo off
title Forteaza Pornirea Aplicatiei
echo ========================================
echo   PORNIRE FORTATA - FARA VERIFICARI
echo ========================================
echo.

echo ATENTIE: Acest script va incerca sa porneasca aplicatia
echo direct, fara verificari prealabile.
echo.

echo Apasa orice tasta pentru a continua sau inchide fereastra pentru a anula...
pause >nul

echo.
echo [BACKEND] Pornesc backend-ul in terminal nou...
echo Comanda: npm run dev
echo.

start "Backend - Mijloace Fixe - FORTAT" cmd /k "echo Pornesc backend... && npm run dev && echo Backend oprit - apasa orice tasta && pause"

echo Backend pornit in terminal separat.
echo Astept 5 secunde pentru ca backend-ul sa porneasca...
timeout /t 5 /nobreak >nul

echo.
echo [FRONTEND] Pornesc frontend-ul in terminal nou...
echo Comanda: cd client && npm start
echo.

start "Frontend - Mijloace Fixe - FORTAT" cmd /k "echo Pornesc frontend... && cd client && npm start && echo Frontend oprit - apasa orice tasta && pause"

echo.
echo ========================================
echo   APLICATIA A FOST PORNITA FORTAT
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Date de login:
echo Username: admin
echo Password: admin123
echo.
echo Daca aplicatia nu functioneaza, verifica terminalele
echo deschise pentru erori.
echo.
echo Acest terminal poate fi inchis acum.
echo Apasa orice tasta pentru a inchide...
pause >nul