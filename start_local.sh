#!/bin/bash
set -e

# Start Docker dependencies
echo "Starting Postgres and Redis via Docker..."
docker-compose up -d postgres redis

# Check if .venv exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    uv venv .venv || python3 -m venv .venv
    echo "Installing backend dependencies..."
    source .venv/bin/activate
    pip install -r requirements.txt
else
    source .venv/bin/activate
fi

# Run migrations
echo "Running database migrations..."
alembic upgrade head

# Start Backend
echo "Starting Backend..."
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload --env-file .env --reload-exclude "frontend-sec" --reload-exclude "*.log" --reload-exclude "*.tmp" &
BACKEND_PID=$!

# Start Frontend
echo "Starting Frontend..."
cd frontend-sec
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!

# Handle shutdown
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

echo "Application is running!"
echo "Backend: http://localhost:8000/docs"
echo "Frontend: http://localhost:3000"

wait
