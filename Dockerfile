# Multi-stage build: first build React frontend, then Python backend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
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

# Copy built frontend
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Copy entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 8000

ARG SUPABASE_URL
ARG NODE_ENV
ENV SUPABASE_URL=${SUPABASE_URL}
ENV NODE_ENV=${NODE_ENV}

RUN alembic upgrade head

# Use entrypoint script (handles wait, migrations, and server start)
CMD uvicorn app.main:app --host 0.0.0.0 --port 8000
