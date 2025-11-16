@echo off
echo ======================================
echo Starting MCP Orchestration Server
echo ======================================
echo.

echo [1/5] Checking prerequisites...

REM Check if Redis is running
docker ps | findstr redis-orchestration >nul
if %errorlevel% neq 0 (
    echo ERROR: Redis container is not running!
    echo Please start Redis first:
    echo   docker run -d --name redis-orchestration -p 6379:6379 redis:7.2-alpine
    pause
    exit /b 1
)
echo ✓ Redis is running

REM Check if MCP Server is built
if not exist mcp-server\dist\index.js (
    echo ERROR: MCP Server is not built!
    echo Please run: cd mcp-server && npm run build
    pause
    exit /b 1
)
echo ✓ MCP Server is built

echo.
echo [2/5] Starting MCP Server in background...
start "MCP Server" cmd /k "cd mcp-server && npm run dev"
timeout /t 3 /nobreak >nul
echo ✓ MCP Server started

echo.
echo [3/5] Opening Cursor windows for each agent...

echo Opening Orchestrator (Purple)...
start "" cmd /c "cd /d %~dp0agent-workspaces\orchestrator && cursor ."
timeout /t 2 /nobreak >nul

echo Opening Planning Agent (Blue)...
start "" cmd /c "cd /d %~dp0agent-workspaces\planning-agent && cursor ."
timeout /t 2 /nobreak >nul

echo Opening Implementation Agent (Green)...
start "" cmd /c "cd /d %~dp0agent-workspaces\implementation-agent && cursor ."
timeout /t 2 /nobreak >nul

echo Opening Testing Agent (Orange)...
start "" cmd /c "cd /d %~dp0agent-workspaces\testing-agent && cursor ."
timeout /t 2 /nobreak >nul

echo.
echo [4/5] All Cursor windows opened!

echo.
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo MCP Server is running in a separate window
echo 4 Cursor windows are now open with color-coded workspaces:
echo   🎯 Orchestrator (Purple)
echo   📋 Planning Agent (Blue)
echo   ⚙️ Implementation Agent (Green)
echo   🧪 Testing Agent (Orange)
echo.
echo [5/5] Next steps:
echo 1. In each Cursor window, configure MCP settings:
echo    - Press Ctrl+Shift+P
echo    - Search for "Preferences: Open User Settings (JSON)"
echo    - Add MCP server configuration (see claude-code-configs/)
echo.
echo 2. Test in Orchestrator window:
echo    - Open Claude Code chat
echo    - Type: "list_agents ツールを使ってエージェント一覧を表示"
echo.
echo Press any key to exit...
pause >nul
