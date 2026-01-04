#!/bin/bash

set -e  # Exit on any error

# Run Alembic migrations
# Note: For production, you might want to run this separately or be careful about concurrent migrations.
echo "Running migrations..."
alembic upgrade head

# Start the FastAPI app
# Cloud Run injects the PORT environment variable
PORT=${PORT:-8080}
echo "Starting FastAPI server on port $PORT..."
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
