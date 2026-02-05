#!/bin/bash

set -e  # Exit on any error

# Run Alembic migrations
echo "Checking database status..."

# Check if 'users' table exists but no alembic version is present
CHECK_STAMP=$(python3 -c "
import os
from sqlalchemy import create_engine, inspect
url = os.getenv('SUPABASE_URL')
if not url:
    exit(0)
engine = create_engine(url)
inspector = inspect(engine)
if inspector.has_table('users'):
    # Check if alembic_version table exists and has data
    if not inspector.has_table('alembic_version'):
        print('STAMP_NEEDED')
    else:
        # Check if it's empty
        with engine.connect() as conn:
            from sqlalchemy import text
            res = conn.execute(text('SELECT COUNT(*) FROM alembic_version')).scalar()
            if res == 0:
                print('STAMP_NEEDED')
")

if [ "$CHECK_STAMP" == "STAMP_NEEDED" ]; then
    echo "Tables exist but no migration history found. Stamping database to 'head'..."
    alembic stamp head
fi

echo "Running migrations..."
alembic upgrade head

# Start the FastAPI app
# Cloud Run injects the PORT environment variable
PORT=${PORT:-8080}
echo "Starting FastAPI server on port $PORT..."
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
