FROM python:3.11-slim AS backend
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini ./alembic.ini

# Copy entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 8000

# Use 'db' as host for Docker Compose networking (overridden by docker-compose.yml if needed)
ENV DB_URL=postgresql://user:password@db:5432/dome

# Install netcat for DB wait (lightweight; remove if using SQLAlchemy retries)
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Use entrypoint script (handles wait, migrations, and server start)
CMD ["./entrypoint.sh"]
