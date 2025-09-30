#!/bin/bash

set -e  # Exit on any error

# Wait for PostgreSQL to be ready
echo "Waiting for database..."
until nc -z db 5432; do
  echo "Database is unavailable - sleeping for 2 seconds..."
  sleep 2
done
echo "Database is up - running migrations..."

# Run Alembic migrations
alembic upgrade head

# Start the FastAPI app
echo "Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000