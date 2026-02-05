from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import engine
from app.routers import auth, boards, cards, lists, websockets, workspaces

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes with /api prefix to avoid conflicts with frontend routes
app.include_router(auth.router, prefix="/auth")
app.include_router(workspaces.router, prefix="/api")
app.include_router(boards.router, prefix="/api")
app.include_router(lists.router, prefix="/api")
app.include_router(cards.router, prefix="/api")
app.include_router(websockets.router)
