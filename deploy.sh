#!/bin/bash
# ==============================================================================
# LumenRadar AI — 1-Click Deployment Script for Linux / Ubuntu / Debian
# ==============================================================================

set -e

echo "=========================================================="
echo "  🚀 LumenRadar AI — Розгортання на сервері замовника"
echo "=========================================================="

# Check if Docker is installed
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo "✓ Docker виявлено на сервері."
    echo "→ Створення файлу середовища (.env) якщо відсутній..."
    if [ ! -f .env ]; then
        cp .env.example .env 2>/dev/null || cat <<EOT > .env
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.5-pro"
DIGEST_RECIPIENT="client@company.ua"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SENDER="digest@lighting-monitor.com"
SMTP_PASSWORD=""
PORT=3000
API_PORT=3000
TZ=Europe/Kyiv
EOT
        echo "✓ Створено шаблон .env (вкажіть ваші ключі при необхідності)."
    fi

    echo "→ Збирання та запуск контейнерів у фоновому режимі..."
    docker compose up -d --build

    echo ""
    echo "=========================================================="
    echo "  🎉 Проект успішно розгорнуто!"
    echo "  🌐 Веб-панель доступна за адресою: http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'localhost'):3000"
    echo "  📊 Перевірка стану: docker compose ps"
    echo "  📜 Перегляд логів: docker compose logs -f"
    echo "=========================================================="
    exit 0
fi

# Fallback: Node.js direct deployment
echo "→ Docker не знайдено, перевірка Node.js..."
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    echo "✓ Node.js $(node -v) виявлено."
    
    echo "→ Встановлення залежностей..."
    npm install

    echo "→ Компіляція production фронтенду..."
    npm run build

    echo "→ Запуск фонового процесу через PM2 / Node..."
    if command -v pm2 &> /dev/null; then
        pm2 start "npx tsx backend/server.ts" --name lumenradar
        pm2 save
        echo "✓ Запущено під наглядом PM2!"
    else
        echo "Запуск сервера у фоні..."
        nohup npx tsx backend/server.ts > lumenradar.log 2>&1 &
        echo "✓ Запущено у фоні (PID: $!). Логи в lumenradar.log"
    fi

    echo ""
    echo "=========================================================="
    echo "  🎉 Проект успішно запущено на порту 3001/3000!"
    echo "=========================================================="
    exit 0
fi

echo "❌ Помилка: на сервері повинен бути встановлений або Docker, або Node.js (v20+)."
exit 1
