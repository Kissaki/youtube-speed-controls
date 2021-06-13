@echo off
"C:\Program Files\7-Zip\7z.exe" a youtube-playback-speed-control.zip manifest.json content.js
IF ERRORLEVEL 1 (
  pause
  EXIT /B 1
)
