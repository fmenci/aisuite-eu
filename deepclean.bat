@ECHO OFF
echo "!!! Attention, all automatic feed folder will be erased"
cd %~dp0

setlocal enabledelayedexpansion
if exist dist (  
	echo "rm dist"
	rmdir /s /q dist )
if exist node_modules (  
	echo "rm node_modules"
	rmdir /s /q node_modules )
if exist package-lock.json (  
	echo "del package-lock"
	del package-lock.json )
if exist .angular\cache (  
	echo "rm angular cache"
	rmdir /s /q .angular\cache )

rem Complete
echo "AI Suite WDR project deep clean complete, please check messages above"
rem pause
