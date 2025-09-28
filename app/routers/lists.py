from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas, models
from app.auth import get_user
from app.database import get_db

router = APIRouter(prefix="/boards", tags=["lists"])

@router.post("/{board_id}/lists/", response_model=schemas.List)
def create_list_for_board(
    board_id: int,
    list_item: schemas.ListCreate,
    current_user = Depends(get_user),
    db: Session = Depends(get_db)
):
    # Check if user owns the board via workspace
    board = db.query(models.Board).join(models.Workspace).filter(
        models.Board.id == board_id,
        models.Workspace.owner_id == current_user.id
    ).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return crud.create_list(db=db, list_item=list_item, board_id=board_id)


@router.get("/{board_id}/lists/", response_model=List[schemas.List])
def read_lists(board_id: int, current_user = Depends(get_user), db: Session = Depends(get_db)):
    # Check ownership
    board = db.query(models.Board).join(models.Workspace).filter(
        models.Board.id == board_id,
        models.Workspace.owner_id == current_user.id
    ).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return crud.get_lists(db, board_id)
