from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app import models
from app.database import engine
from app.routers import auth, workspaces, boards, lists, cards

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve React frontend static files
app.mount("/static", StaticFiles(directory="frontend/build/static"), name="static")

# Serve index.html for SPA routing
@app.get("/")
async def serve_spa():
    return FileResponse("frontend/build/index.html")

# API routes with /api prefix to avoid conflicts with frontend routes
app.include_router(auth.router, prefix="/api/auth")
app.include_router(workspaces.router, prefix="/api")
app.include_router(boards.router, prefix="/api")
app.include_router(lists.router, prefix="/api")
app.include_router(cards.router, prefix="/api")

# Catch-all for SPA: serve index.html for client-side routing
@app.get("/{full_path:path}")
async def serve_spa_fallback(full_path: str):
    if full_path.startswith("api/"):
        return  # Let API handle it
    return FileResponse("frontend/build/index.html")
