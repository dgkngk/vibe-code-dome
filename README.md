# Vibe Code Dome

A Trello-like clone built with FastAPI backend and planned React frontend.

## Backend Setup

1. Install dependencies: `pip install -r requirements.txt`
2. Run Alembic migrations: `alembic upgrade head`
3. Start the server: `uvicorn app.main:app --reload`
4. Access docs at http://localhost:8000/docs

## Features

- User authentication (register/login with JWT)
- CRUD for Workspaces, Boards, Lists, Cards
- SQLite database with SQLAlchemy and Alembic

## API Endpoints

- POST /register - Create user
- POST /token - Login
- POST /workspaces/ - Create workspace
- GET /workspaces/ - List user workspaces
- POST /workspaces/{workspace_id}/boards/ - Create board
- GET /workspaces/{workspace_id}/boards/ - List boards
- POST /boards/{board_id}/lists/ - Create list
- GET /boards/{board_id}/lists/ - List lists
- POST /lists/{list_id}/cards/ - Create card
- GET /lists/{list_id}/cards/ - List cards
