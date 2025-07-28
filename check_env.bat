@echo off
echo ========================================
echo   VERIFICARE SI CREARE FISIER .ENV
echo ========================================
echo.

echo [VERIFICARE] Caut fisierul .env...
if exist ".env" (
    echo ✅ Fisierul .env exista deja
    echo.
    echo Continutul fisierului .env:
    echo ----------------------------------------
    type .env
    echo ----------------------------------------
) else (
    echo ⚠️  Fisierul .env nu exista
    echo.
    
    if exist ".env.example" (
        echo ✅ Gasit .env.example, il copiez...
        copy .env.example .env
        echo ✅ Fisier .env creat din .env.example
    ) else (
        echo ⚠️  .env.example nu exista, creez unul de baza...
        echo # Database Configuration > .env
        echo DB_HOST=localhost >> .env
        echo DB_PORT=5432 >> .env
        echo DB_NAME=mijloace_fixe >> .env
        echo DB_USER=postgres >> .env
        echo DB_PASSWORD=postgres >> .env
        echo. >> .env
        echo # Server Configuration >> .env
        echo PORT=3001 >> .env
        echo NODE_ENV=development >> .env
        echo. >> .env
        echo # JWT Configuration >> .env
        echo JWT_SECRET=secret_foarte_sigur_pentru_dezvoltare >> .env
        echo JWT_EXPIRES_IN=24h >> .env
        echo ✅ Fisier .env creat cu setari de baza
    )
    
    echo.
    echo Continutul fisierului .env creat:
    echo ----------------------------------------
    type .env
    echo ----------------------------------------
)

echo.
echo ⚠️  IMPORTANT: Verifica ca setarile din .env sunt corecte!
echo Daca ai o parola diferita pentru PostgreSQL, editeaza fisierul .env
echo.
echo Vrei sa deschizi .env pentru editare? (y/n)
set /p edit_env=
if /i "%edit_env%"=="y" (
    notepad .env
)

echo.
echo Verificare completa!
pause