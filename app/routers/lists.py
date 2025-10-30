import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import get_user
from app.database import get_db
from app.websocket import manager

router = APIRouter(prefix="/boards", tags=["lists"])


@router.post("/{board_id}/lists/", response_model=schemas.List)
async def create_list_for_board(
    board_id: int,
    list_item: schemas.ListCreate,
    current_user=Depends(get_user),
    db: Session = Depends(get_db),
):
    board = (
        db.query(models.Board)
        .join(models.Workspace)
        .filter(
            models.Board.id == board_id,
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
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    new_list = crud.create_list(db=db, list_item=list_item, board_id=board_id)
    await manager.broadcast(
        board.workspace_id,
        json.dumps({"type": "list_created", "payload": new_list.to_dict()}),
    )
    return new_list


@router.get("/{board_id}/lists/", response_model=List[schemas.List])
def read_lists(
    board_id: int, current_user=Depends(get_user), db: Session = Depends(get_db)
):
    board = (
        db.query(models.Board)
        .join(models.Workspace)
        .filter(
            models.Board.id == board_id,
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
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return crud.get_lists(db, board_id)


@router.delete("/{board_id}/lists/{list_id}/")
async def delete_list(
    board_id: int,
    list_id: int,
    current_user=Depends(get_user),
    db: Session = Depends(get_db),
):
    board = (
        db.query(models.Board)
        .join(models.Workspace)
        .filter(
            models.Board.id == board_id,
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
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    if not crud.delete_list(db, list_id, current_user.id, board_id):
        raise HTTPException(status_code=404, detail="List not found")

    await manager.broadcast(
        board.workspace_id,
        json.dumps(
            {
                "type": "list_deleted",
                "payload": {"list_id": list_id, "board_id": board_id},
            }
        ),
    )
    return {"message": "List deleted successfully"}
