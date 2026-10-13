@echo off
setlocal EnableExtensions
color 0a
title SIGTUR Salto - Setup local
set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"

rem Verifica las herramientas necesarias para la presentacion local.
echo ========================================
echo   SIGTUR Salto - Preparar presentacion
echo ========================================
if not exist C:\xampp\apache\bin\httpd.exe (
    echo [!] No se encontro XAMPP en C:\xampp\.
    echo     Instala XAMPP o ajusta la ruta en este archivo.
    pause
    exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    echo [!] Node.js no esta instalado o no esta en PATH.
    echo     Instala Node.js LTS y vuelve a ejecutar este archivo.
    pause
    exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
    echo [!] npm no esta disponible. Reinstala Node.js LTS.
    pause
    exit /b 1
)

if not exist "%BACKEND%\.env" (
    rem Crea una configuracion inicial; las claves reales se completan manualmente.
    copy /Y "%BACKEND%\.env.example" "%BACKEND%\.env" >nul
    echo [!] Se creo backend\.env desde la plantilla.
    echo     Completa las claves de Supabase antes de usar login, mapa y mensajes.
)

if not exist "%BACKEND%\node_modules" (
    rem Instala las librerias solo la primera vez que se usa el proyecto.
    echo [..] Instalando dependencias del backend...
    pushd "%BACKEND%"
    call npm install
    if errorlevel 1 (
        popd
        echo [!] No se pudieron instalar las dependencias.
        pause
        exit /b 1
    )
    popd
) else (
    echo [OK] Dependencias de Node disponibles.
)

findstr /C:"TU-PROYECTO.supabase.co" "%BACKEND%\.env" >nul 2>&1
if errorlevel 1 (
    rem Levanta la API en una ventana separada para que XAMPP pueda consumirla.
    echo [..] Iniciando backend en http://localhost:3000...
    start "SIGTUR Backend" /D "%BACKEND%" cmd /k npm start
) else (
    echo [!] Backend omitido: completa backend\.env para activar Supabase.
)

echo ========================================
echo   Verificar Apache + PHP de XAMPP
echo ========================================
curl -s -o nul -w "%%{http_code}" "http://localhost/sigtur2026-premiere-main%%20(1)/sigtur2026-premiere-main/frontend/html/index.php" > "%TEMP%\sigtur_http_code.txt"
set /p HTTP_CODE=<"%TEMP%\sigtur_http_code.txt"
del "%TEMP%\sigtur_http_code.txt" >nul 2>&1
if "%HTTP_CODE%"=="200" (
    echo [OK] Apache sirve el frontend.
) else (
    echo [!] Apache respondio HTTP %HTTP_CODE%. Inicia Apache desde XAMPP.
)

echo ========================================
echo   Abrir Frontend XAMPP
echo ========================================
start "" "http://localhost/sigtur2026-premiere-main%%20(1)/sigtur2026-premiere-main/frontend/html/index.php"
echo Para mensajes: inicia sesion y confirma que migration_interacciones.sql ya fue ejecutada en Supabase.
echo No cierres la ventana SIGTUR Backend mientras presentes.
endlocal
