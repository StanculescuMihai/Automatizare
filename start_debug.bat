@echo off
echo ========================================
echo   SISTEM GESTIONARE MIJLOACE FIXE
echo   (VERSIUNE DEBUG)
echo ========================================
echo.

REM Verificare Node.js cu debug
echo [1/5] Verificare Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nu este instalat sau nu este in PATH!
    echo.
    echo Verificare locatii comune:
    if exist "C:\Program Files\nodejs\node.exe" (
        echo ✅ Gasit Node.js in: C:\Program Files\nodejs\
        set "NODE_PATH=C:\Program Files\nodejs"
        set "PATH=%NODE_PATH%;%PATH%"
        echo Adaugat in PATH temporar...
        node --version
    ) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
        echo ✅ Gasit Node.js in: C:\Program Files (x86)\nodejs\
        set "NODE_PATH=C:\Program Files (x86)\nodejs"
        set "PATH=%NODE_PATH%;%PATH%"
        echo Adaugat in PATH temporar...
        node --version
    ) else (
        echo ❌ Node.js nu a fost gasit in locatiile comune
        echo.
        echo Pentru a instala Node.js:
        echo 1. Mergi la https://nodejs.org/
        echo 2. Descarca versiunea LTS
        echo 3. Instaleaza si restartează terminalul
        echo 4. Ruleaza din nou acest script
        echo.
        echo SAU citeste ghidul complet: INSTALARE_WINDOWS.md
        echo.
        echo Apasa orice tasta pentru a continua...
        pause
        goto manual_start
    )
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js %NODE_VERSION% este instalat
)

REM Verificare npm
echo [2/5] Verificare npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm nu este disponibil!
    echo Reinstaleaza Node.js cu npm inclus
    echo.
    echo Apasa orice tasta pentru a continua...
    pause
    goto manual_start
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm %NPM_VERSION% este instalat
)

REM Verificare PostgreSQL
echo [3/5] Verificare PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL nu este găsit în PATH
    echo Asigura-te ca PostgreSQL este instalat si adaugat in PATH
    echo Sau citeste ghidul: INSTALARE_WINDOWS.md
    echo.
    echo Continui oricum? (y/n)
    set /p continue=
    if /i not "%continue%"=="y" goto end
) else (
    for /f "tokens=*" %%i in ('psql --version') do set PG_VERSION=%%i
    echo ✅ PostgreSQL este instalat
)

REM Verificare fișier .env
echo [4/5] Verificare configuratie...
if not exist ".env" (
    echo ⚠️  Fisierul .env nu exista. Creez unul din template...
    if exist ".env.example" (
        copy .env.example .env >nul
        echo ✅ Fisier .env creat din .env.example
        echo.
        echo ⚠️  IMPORTANT: Editeaza fisierul .env cu setarile tale de baza de date!
        echo Apasa orice tasta pentru a deschide .env in notepad...
        pause >nul
        notepad .env
    ) else (
        echo ❌ Fisierul .env.example nu exista!
        echo Creez un fisier .env de baza...
        echo # Database > .env
        echo DB_HOST=localhost >> .env
        echo DB_PORT=5432 >> .env
        echo DB_NAME=mijloace_fixe >> .env
        echo DB_USER=postgres >> .env
        echo DB_PASSWORD=postgres >> .env
        echo. >> .env
        echo # Server >> .env
        echo PORT=3001 >> .env
        echo NODE_ENV=development >> .env
        echo. >> .env
        echo # JWT >> .env
        echo JWT_SECRET=secret_foarte_sigur_pentru_dezvoltare >> .env
        echo JWT_EXPIRES_IN=24h >> .env
        echo ✅ Fisier .env creat cu setari de baza
    )
) else (
    echo ✅ Fisierul .env exista
)

REM Verificare node_modules
echo [5/5] Verificare dependinte...
if not exist "node_modules" (
    echo ⚠️  Dependintele nu sunt instalate. Instalez...
    echo Aceasta operatie poate dura cateva minute...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Eroare la instalarea dependintelor backend!
        echo Verifica conexiunea la internet si incearca din nou
        echo.
        echo Apasa orice tasta pentru a continua...
        pause
        goto manual_start
    )
    echo ✅ Dependinte backend instalate
) else (
    echo ✅ Dependinte backend deja instalate
)

REM Verificare dependinte frontend
if not exist "client\node_modules" (
    echo ⚠️  Dependintele frontend nu sunt instalate. Instalez...
    cd client
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Eroare la instalarea dependintelor frontend!
        cd ..
        echo.
        echo Apasa orice tasta pentru a continua...
        pause
        goto manual_start
    )
    cd ..
    echo ✅ Dependinte frontend instalate
) else (
    echo ✅ Dependinte frontend deja instalate
)

echo.
echo ========================================
echo   CONFIGURARE COMPLETA!
echo ========================================
echo.
echo Ce vrei sa faci?
echo.
echo 1. Porneste aplicatia (development mode)
echo 2. Testeaza conexiunea la baza de date
echo 3. Initializeaza baza de date (sterge si recreaza tabelele)
echo 4. Populeaza baza de date cu date initiale
echo 5. Setup complet (initializeaza + populeaza)
echo 6. Build pentru productie
echo 7. Start manual (fara verificari)
echo 8. Iesire
echo.
set /p choice="Alege optiunea (1-8): "

if "%choice%"=="1" goto start_dev
if "%choice%"=="2" goto test_db
if "%choice%"=="3" goto init_db
if "%choice%"=="4" goto seed_db
if "%choice%"=="5" goto full_setup
if "%choice%"=="6" goto build_prod
if "%choice%"=="7" goto manual_start
if "%choice%"=="8" goto end

echo Optiune invalida!
pause
goto end

:start_dev
echo.
echo Pornesc aplicatia in modul dezvoltare...
echo.
echo Backend va rula pe: http://localhost:3001
echo Frontend va rula pe: http://localhost:3000
echo.
echo Pentru a opri aplicatia, apasa Ctrl+C in ambele terminale
echo.
echo Apasa orice tasta pentru a continua...
pause >nul

REM Porneste backend in terminal nou
start "Backend - Mijloace Fixe" cmd /k "npm run dev"

REM Asteapta putin pentru backend sa porneasca
timeout /t 3 /nobreak >nul

REM Porneste frontend in terminal nou
start "Frontend - Mijloace Fixe" cmd /k "cd client && npm start"

echo.
echo ✅ Aplicatia a fost pornita!
echo.
echo Deschide browser-ul la: http://localhost:3000
echo.
echo Date de login implicite:
echo Username: admin
echo Password: admin123
echo.
goto end

:manual_start
echo.
echo ========================================
echo   START MANUAL (FARA VERIFICARI)
echo ========================================
echo.
echo Incerc sa pornesc aplicatia direct...
echo.
echo Apasa orice tasta pentru a continua...
pause >nul

echo Pornesc backend...
start "Backend - Mijloace Fixe" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo Pornesc frontend...
start "Frontend - Mijloace Fixe" cmd /k "cd client && npm start"

echo.
echo ✅ Aplicatia a fost pornita (mod manual)!
echo.
echo Deschide browser-ul la: http://localhost:3000
echo.
goto end

:test_db
echo.
echo Testez conexiunea la baza de date...
node scripts/testApplication.js
echo.
pause
goto end

:init_db
echo.
echo Initializez baza de date (sterge si recreaza tabelele)...
echo ATENTIE: Aceasta operatie va sterge toate datele existente!
echo.
set /p confirm="Esti sigur? (y/n): "
if /i not "%confirm%"=="y" goto end
echo.
node scripts/initDatabase.js
echo.
pause
goto end

:seed_db
echo.
echo Populez baza de date cu date initiale...
node scripts/seedDatabase.js
echo.
pause
goto end

:full_setup
echo.
echo Setup complet: initializez si populez baza de date...
echo ATENTIE: Aceasta operatie va sterge toate datele existente!
echo.
set /p confirm="Esti sigur? (y/n): "
if /i not "%confirm%"=="y" goto end
echo.
echo [1/2] Initializez baza de date...
node scripts/initDatabase.js
if %errorlevel% neq 0 (
    echo ❌ Eroare la initializarea bazei de date!
    pause
    goto end
)
echo.
echo [2/2] Populez cu date initiale...
node scripts/seedDatabase.js
if %errorlevel% neq 0 (
    echo ❌ Eroare la popularea bazei de date!
    pause
    goto end
)
echo.
echo ✅ Setup complet finalizat cu succes!
pause
goto end

:build_prod
echo.
echo Construiesc aplicatia pentru productie...
cd client
npm run build
cd ..
echo.
echo ✅ Build complet! Fisierele sunt in client/build/
echo Pentru a rula in productie: npm start
echo.
pause
goto end

:end
echo.
echo Multumesc ca folosesti Sistemul de Gestionare Mijloace Fixe!
echo.
echo Pentru ajutor suplimentar:
echo - Citeste README.md pentru documentatie completa
echo - Citeste INSTALARE_WINDOWS.md pentru ghid de instalare
echo - Citeste DEPLOYMENT.md pentru deployment in productie
echo.
pause