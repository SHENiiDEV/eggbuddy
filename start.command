#!/bin/bash
# EggBuddy: one-click local start on macOS.
# Double-click this file in Finder (or run ./start.command in Terminal).
# The first run installs dependencies and builds the front-end (a few minutes).

PORT=1929
cd "$(dirname "$0")" || exit 1
export PATH="$HOME/Library/Application Support/Herd/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

step() { printf '\n\033[1;35m==> %s\033[0m\n' "$1"; }
fail() { printf '\n\033[1;31m%s\033[0m\n' "$1"; read -r -p "Press Enter to close..."; exit 1; }

command -v php >/dev/null 2>&1 || fail "PHP not found. Install Laravel Herd (https://herd.laravel.com) and run this again."
command -v composer >/dev/null 2>&1 || fail "Composer not found. It comes with Laravel Herd (https://herd.laravel.com)."
command -v npm >/dev/null 2>&1 || fail "Node.js not found. Install it from https://nodejs.org (LTS) or with Herd, then run this again."

step "PHP $(php -r 'echo PHP_VERSION;') · Node $(node -v)"

if [ ! -f .env ]; then
  step "Creating .env"
  cp .env.example .env
fi
sed -i '' "s#^APP_URL=.*#APP_URL=http://localhost:${PORT}#" .env

if [ ! -f vendor/autoload.php ]; then
  step "Installing PHP packages (composer install)"
  composer install --no-interaction || fail "composer install failed (see above)."
fi

if ! grep -q '^APP_KEY=base64:' .env; then
  php artisan key:generate --ansi
fi

[ -f database/database.sqlite ] || touch database/database.sqlite

step "Preparing the database"
php artisan migrate --seed --force || fail "Database migration failed (see above)."

if [ ! -d node_modules ]; then
  step "Installing front-end packages (npm install)"
  npm install || fail "npm install failed (see above)."
fi

step "Building the front-end"
npm run build || fail "Front-end build failed (see above)."

php artisan optimize:clear >/dev/null 2>&1

step "EggBuddy is running at http://localhost:${PORT}"
echo "Demo login: demo@eggbuddy.test / password1"
echo "Press Ctrl+C in this window to stop the server."
(sleep 2 && open "http://localhost:${PORT}") &
php artisan serve --host=127.0.0.1 --port="${PORT}"
