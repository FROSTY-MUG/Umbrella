#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

echo "=== Updating apt ==="
sudo apt-get update -y

echo "=== Installing Redis + PostgreSQL ==="
sudo apt-get install -y redis-server postgresql postgresql-contrib

echo "=== Starting Redis ==="
sudo service redis-server start
redis-cli ping

echo "=== Starting PostgreSQL ==="
sudo service postgresql start

echo "=== Creating umbrella DB user and database ==="
sudo -u postgres psql -c "CREATE USER umbrella WITH PASSWORD 'umbrella_secure_bio' CREATEDB;" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "CREATE DATABASE umbrella_os OWNER umbrella;" 2>/dev/null || echo "DB already exists"

echo "=== Verifying ==="
redis-cli ping
sudo -u postgres psql -c "SELECT version();" umbrella_os

echo "=== DONE ==="
