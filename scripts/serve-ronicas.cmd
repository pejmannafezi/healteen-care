@echo off
REM Serve the static Ronica's friends site with the freshly-installed Node.js.
set "PATH=C:\Program Files\nodejs;%PATH%"
call "C:\Program Files\nodejs\node.exe" "%~dp0..\ronicas-friends\serve.js" 5173
