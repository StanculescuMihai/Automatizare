@echo off
echo ========================================
echo   DEBUG SCRIPT - VERIFICARE SISTEM
echo ========================================
echo.

echo [DEBUG] Verificare Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ EROARE: Node.js nu este gasit in PATH
    echo.
    echo Verificare locatii comune Node.js:
    if exist "C:\Program Files\nodejs\node.exe" (
        echo ✅ Gasit: C:\Program Files\nodejs\node.exe
        "C:\Program Files\nodejs\node.exe" --version
    ) else (
        echo ❌ Nu este in: C:\Program Files\nodejs\
    )
    
    if exist "C:\Program Files (x86)\nodejs\node.exe" (
        echo ✅ Gasit: C:\Program Files (x86)\nodejs\node.exe
        "C:\Program Files (x86)\nodejs\node.exe" --version
    ) else (
        echo ❌ Nu este in: C:\Program Files (x86)\nodejs\
    )
    
    echo.
    echo PATH actual:
    echo %PATH%
    echo.
) else (
    echo ✅ Node.js gasit in PATH
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo Versiune: %NODE_VERSION%
)

echo.
echo [DEBUG] Verificare npm...
npm --version
if %errorlevel% neq 0 (
    echo ❌ EROARE: npm nu este gasit
) else (
    echo ✅ npm gasit
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo Versiune: %NPM_VERSION%
)

echo.
echo [DEBUG] Verificare fisiere proiect...
if exist "package.json" (
    echo ✅ package.json exista
) else (
    echo ❌ package.json nu exista
)

if exist "server.js" (
    echo ✅ server.js exista
) else (
    echo ❌ server.js nu exista
)

if exist "client\package.json" (
    echo ✅ client\package.json exista
) else (
    echo ❌ client\package.json nu exista
)

echo.
echo [DEBUG] Verificare directorul curent...
echo Directorul curent: %CD%
echo.
echo Continutul directorului:
dir /b

echo.
echo ========================================
echo   APASA ORICE TASTA PENTRU A INCHIDE
echo ========================================
pause