import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect

from app import models
from app.database import Base, engine
from app.routers import auth, boards, cards, lists, websockets, workspaces

DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve React frontend static files only in dev mode (production uses Firebase Hosting)
if DEV_MODE:
    from starlette.responses import FileResponse
    from starlette.staticfiles import StaticFiles

    if os.path.exists("frontend/build/assets"):
        app.mount("/assets", StaticFiles(directory="frontend/build/assets"), name="assets")

    @app.get("/")
    async def serve_spa():
        index_path = "frontend/build/index.html"
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"status": "dev", "message": "Frontend not built. Run 'npm run build' in frontend/."}


@app.get("/health")
async def health_check():
    """Health check endpoint that also reports database table status in dev mode."""
    result = {"status": "ok", "mode": "dev" if DEV_MODE else "production"}

    if DEV_MODE:
        try:
            db_inspector = inspect(engine)
            tables = db_inspector.get_table_names()
            result["tables"] = tables
            result["table_count"] = len(tables)
        except Exception as error:
            result["db_error"] = str(error)

    return result


# API routes
app.include_router(auth.router, prefix="/auth")
app.include_router(workspaces.router, prefix="/api")
app.include_router(boards.router, prefix="/api")
app.include_router(lists.router, prefix="/api")
app.include_router(cards.router, prefix="/api")
app.include_router(websockets.router)
