# Dome With Love 🎨

![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-red?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

**Dome With Love** is a full-stack, collaborative project management platform inspired by Trello. It features a robust **Kanban board** interface with drag-and-drop capabilities, secure authentication, and a hierarchical workspace management system.

This project demonstrates a clean separation of concerns between a RESTful Python backend and a reactive TypeScript frontend, orchestrated via Docker Compose.

## 🚀 Features

*   **Kanban Workflow**: Drag-and-drop cards between lists using `react-beautiful-dnd`.
*   **Hierarchical Structure**: Workspaces -> Boards -> Lists -> Cards.
*   **Secure Auth**: JWT-based authentication flow with protected routes.
*   **Database Migrations**: Managed via **Alembic** for reliable schema evolution.
*   **Responsive UI**: Mobile-first design using Tailwind CSS.

## 🏗️ Architecture

### Backend (Python/FastAPI)
*   **API**: RESTful endpoints documenting using OpenAPI (Swagger).
*   **ORM**: SQLAlchemy with SQLite (dev) / PostgreSQL (prod).
*   **Validation**: Pydantic models for strict request/response schemas.

### Frontend (React/TypeScript)
*   **Component Library**: Tailwind CSS for styling.
*   **State Management**: Context API for Auth and Workspace state.
*   **Integration**: Axios interceptors for handling JWT injection and refresh tokens.

## 🛠️ Setup & Deployment

### Docker (Recommended)

Run the full stack with a single command:

```bash
docker-compose up --build
```

The frontend will be available at `http://localhost:3000` and the API at `http://localhost:8000`.

### Manual Setup

**Backend**:
```bash
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm start
```

## 📚 API Documentation

Once running, visit `http://localhost:8000/docs` for the interactive Swagger UI.
