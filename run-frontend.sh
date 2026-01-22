#!/bin/bash
# HydroYield Frontend Startup Script

echo "🌱 HydroYield Frontend Startup"
echo "==============================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Start dev server
echo "🚀 Starting Vite dev server..."
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
