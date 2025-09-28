from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.auth import get_user
from app.database import get_db

router = APIRouter(prefix="/workspaces", tags=["boards"])

@router.post("/{workspace_id}/boards/", response_model=schemas.Board)
def create_board_for_workspace(
    workspace_id: int,
    board: schemas.BoardCreate,
    current_user = Depends(get_user),
    db: Session = Depends(get_db)
):
    # Check if user owns the workspace
    workspace = db.query(app.models.Workspace).filter(
        app.models.Workspace.id == workspace_id,
        app.models.Workspace.owner_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return crud.create_board(db=db, board=board, workspace_id=workspace_id)


@router.get("/{workspace_id}/boards/", response_model=List[schemas.Board])
def read_boards(workspace_id: int, current_user = Depends(get_user), db: Session = Depends(get_db)):
    # Check ownership
    workspace = db.query(app.models.Workspace).filter(
        app.models.Workspace.id == workspace_id,
        app.models.Workspace.owner_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return crud.get_boards(db, workspace_id)
