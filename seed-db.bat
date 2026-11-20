@echo off
title Seed Database MEMORIES 2027
echo Mengisi ulang database dengan sample data SMPN 1 Rajapolah...
cd /d C:\memories_app
set NODE_PATH=C:\memories_app\node_modules
node scripts/seed.js
pause
