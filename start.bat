@echo off
title College Lab Equipment Management System
echo =====================================================================
echo  College Lab Equipment Management System (React + Express + Node.js)
echo =====================================================================
echo.
echo Starting Express Server & React Frontend on http://localhost:5000 ...
echo Database: MySQL (college_lab_db)
echo.
cd /d "%~dp0"
node server/server.js
pause

