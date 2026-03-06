# Multi-stage build: first build React frontend, then Python backend
FROM node:24-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim AS backend
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini ./alembic.ini

# Copy built frontend from first stage
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Copy entrypoint script and install system utilities
COPY entrypoint.sh .
RUN apt-get update && apt-get install -y dos2unix netcat-openbsd \
    && dos2unix entrypoint.sh && chmod +x entrypoint.sh \
    && rm -rf /var/lib/apt/lists/*

# Expose port
EXPOSE 8000

ENV DB_URL=postgresql://user:password@db:5432/dome

# Use entrypoint script (handles wait, migrations, and server start)
CMD ["./entrypoint.sh"]
