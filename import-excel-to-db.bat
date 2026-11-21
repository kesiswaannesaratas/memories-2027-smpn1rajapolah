@echo off
title Import Excel ke Database - MEMORIES 2027
echo ========================================================
echo   IMPORT DATA EXCEL (.XLSX) KE DATABASE SUPABASE
echo   MEMORIES 2027 - SMPN 1 RAJAPOLAH
echo ========================================================
echo.
cd /d "%~dp0"
set NODE_PATH=C:\Users\vivob\.gemini\antigravity\brain\55149147-0a0b-4287-b0de-9a0de969bd69\scratch\node_modules
node scripts/import_excel.js
echo.
pause
