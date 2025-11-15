@echo off
echo ======================================
echo MCP Orchestration Server Setup
echo ======================================
echo.

echo [1/6] Checking prerequisites...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Docker is not installed. Redis will not be available.
    echo Please install Docker Desktop for Windows.
)

echo [2/6] Installing MCP Server dependencies...
cd mcp-server
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: npm install failed
        exit /b 1
    )
) else (
    echo Dependencies already installed, skipping...
)

echo.
echo [3/6] Building MCP Server...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    exit /b 1
)

echo.
echo [4/6] Creating .env file...
cd ..
if not exist mcp-server\.env (
    copy mcp-server\.env.example mcp-server\.env
    echo .env file created. Please edit it if needed.
) else (
    echo .env file already exists, skipping...
)

echo.
echo [5/6] Starting Redis with Docker...
docker ps >nul 2>&1
if %errorlevel% equ 0 (
    docker run -d --name redis-orchestration -p 6379:6379 redis:7.2-alpine
    if %errorlevel% equ 0 (
        echo Redis started successfully on port 6379
    ) else (
        echo Redis container might already be running or Docker is not available
        docker start redis-orchestration 2>nul
    )
) else (
    echo Docker is not running. Please start Docker Desktop.
    echo You can start Redis manually later with: docker run -d -p 6379:6379 redis:7.2-alpine
)

echo.
echo [6/6] Verifying installation...
if exist mcp-server\dist\index.js (
    echo ✓ MCP Server build successful
) else (
    echo ✗ MCP Server build not found
    exit /b 1
)

echo.
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo Next steps:
echo 1. Configure Claude Code/Cursor with MCP settings:
echo    - Orchestrator: claude-code-configs\orchestrator-config.json
echo    - Planning Agent: claude-code-configs\planning-agent-config.json
echo    - Implementation Agent: claude-code-configs\implementation-agent-config.json
echo    - Testing Agent: claude-code-configs\testing-agent-config.json
echo.
echo 2. Start the MCP Server:
echo    cd mcp-server
echo    npm run dev
echo.
echo 3. Open multiple Cursor/Claude Code windows for each agent
echo.
echo 4. Read the documentation:
echo    - mcp-orchestration-architecture.md
echo    - agent-protocols.md
echo    - comprehensive_orchestration_guide.md
echo.
echo Press any key to exit...
pause >nul
