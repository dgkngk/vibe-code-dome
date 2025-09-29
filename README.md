# Vibe Code Dome

A Trello-like clone built with FastAPI backend and React frontend. The frontend provides a mobile-friendly interface with authentication, workspace/board management, and a draggable Kanban board.

## Backend Setup

1. Install dependencies: `pip install -r requirements.txt`
2. Run Alembic migrations: `alembic upgrade head`
3. Start the server: `uvicorn app.main:app --reload`
4. Access docs at http://localhost:8000/docs

## Frontend Setup

The frontend is a React TypeScript app in the `frontend/` directory, using Tailwind CSS for responsive design and react-beautiful-dnd for drag-and-drop.

1. Navigate to the frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
   - Opens at http://localhost:3000
   - Ensure the backend is running on http://localhost:8000 (CORS is configured for this origin).
4. Test the full app: Register/login, create workspaces/boards/lists/cards, and drag cards between lists.

### Building for Production
1. Build the app: `npm run build`
   - Generates an optimized `build/` folder with static files.
2. Deploy the `build/` folder:
   - **Vercel/Netlify**: Connect the repo or upload `build/` (auto-deploys on push).
   - **GitHub Pages**: Install `gh-pages` (`npm install --save-dev gh-pages`), add `"homepage": "https://<username>.github.io/<repo>"` to package.json, then `npm run deploy`.
   - **Local test**: Install `serve` globally (`npm install -g serve`), then `serve -s build` (runs on http://localhost:5000).
- Before building, update the API base URL in `frontend/src/services/api.ts` (currently `http://localhost:8000`) to your production backend URL.

## Features

- User authentication (register/login with JWT)
- CRUD for Workspaces, Boards, Lists, Cards
- SQLite database with SQLAlchemy and Alembic

## API Endpoints

- POST /auth/register - Create user
- POST /auth/token - Login (returns JWT)
- POST /workspaces/ - Create workspace
- GET /workspaces/ - List user workspaces
- POST /workspaces/{workspace_id}/boards/ - Create board
- GET /workspaces/{workspace_id}/boards/ - List boards
- POST /boards/{board_id}/lists/ - Create list
- GET /boards/{board_id}/lists/ - List lists
- POST /lists/{list_id}/cards/ - Create card
- GET /lists/{list_id}/cards/ - List cards
- PATCH /lists/{list_id}/cards/{card_id} - Update card (e.g., position or list_id for drag-and-drop)
```