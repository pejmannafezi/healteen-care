@echo off
REM Ensure the freshly-installed Node.js is on PATH for this dev session.
set "PATH=C:\Program Files\nodejs;%PATH%"
call "C:\Program Files\nodejs\npm.cmd" run dev
