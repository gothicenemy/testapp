@echo off
REM ==============================================================================
REM LumenRadar AI — 1-Click Deployment Script for Windows Server
REM ==============================================================================

echo ==========================================================
echo   LumenRadar AI - Rozgortannya na Windows Server
echo ==========================================================

where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Docker viyavleno.
    if not exist .env (
        echo [INFO] Stvorennya failu .env...
        (
            echo GEMINI_API_KEY=""
            echo GEMINI_MODEL="gemini-2.5-pro"
            echo DIGEST_RECIPIENT="client@company.ua"
            echo SMTP_HOST="smtp.gmail.com"
            echo SMTP_PORT=587
            echo SMTP_SENDER="digest@lighting-monitor.com"
            echo SMTP_PASSWORD=""
            echo PORT=3000
            echo API_PORT=3000
            echo TZ=Europe/Kyiv
        ) > .env
    )

    echo [INFO] Zbyrannya ta zapusk Docker konteyneriv...
    docker compose up -d --build
    echo.
    echo ==========================================================
    echo   Uspishno zapushcheno! Vidkryite: http://localhost:3000
    echo ==========================================================
    goto end
)

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Node.js viyavleno.
    echo [INFO] Vstanovlennya zalezhnostey...
    call npm install
    echo [INFO] Kompilyatsiya frontendu...
    call npm run build
    echo [INFO] Zapusk servera...
    call npm start
    goto end
)

echo [POMYLKA] Vstanovit Docker abo Node.js dlya zapusku proyektu!

:end
pause
