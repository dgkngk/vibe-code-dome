import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import get_user
from app.database import get_db
from app.websocket import manager

router = APIRouter(prefix="/workspaces", tags=["boards"])


@router.post("/{workspace_id}/boards/", response_model=schemas.Board)
async def create_board_for_workspace(
    workspace_id: int,
    board: schemas.BoardCreate,
    current_user=Depends(get_user),
    db: Session = Depends(get_db),
):
    workspace = (
        db.query(models.Workspace)
        .filter(
            models.Workspace.id == workspace_id,
            or_(
                models.Workspace.owner_id == current_user.id,
                models.Workspace.id.in_(
                    db.query(models.workspace_members.c.workspace_id).filter(
                        models.workspace_members.c.user_id == current_user.id
                    )
                ),
            ),
        )
        .first()
    )
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    new_board = crud.create_board(db=db, board=board, workspace_id=workspace_id)
    await manager.broadcast(
        workspace_id,
        json.dumps({"type": "board_created", "payload": new_board.to_dict()}),
    )
    return new_board


@router.get("/{workspace_id}/boards/", response_model=List[schemas.Board])
def read_boards(
    workspace_id: int, current_user=Depends(get_user), db: Session = Depends(get_db)
):
    workspace = (
        db.query(models.Workspace)
        .filter(
            models.Workspace.id == workspace_id,
            or_(
                models.Workspace.owner_id == current_user.id,
                models.Workspace.id.in_(
                    db.query(models.workspace_members.c.workspace_id).filter(
                        models.workspace_members.c.user_id == current_user.id
                    )
                ),
            ),
        )
        .first()
    )
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return crud.get_boards(db, workspace_id)


@router.get("/boards/{board_id}/", response_model=schemas.Board)
def read_board(
    board_id: int, current_user=Depends(get_user), db: Session = Depends(get_db)
):
    board = crud.get_board(db, board_id, current_user.id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board
