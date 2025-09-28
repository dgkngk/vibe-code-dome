from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.auth import get_user
from app.database import get_db

router = APIRouter(prefix="/lists", tags=["cards"])

@router.post("/{list_id}/cards/", response_model=schemas.Card)
def create_card_for_list(
    list_id: int,
    card: schemas.CardCreate,
    current_user = Depends(get_user),
    db: Session = Depends(get_db)
):
    # Check if user owns the list via board/workspace
    list_item = db.query(app.models.List).join(app.models.Board).join(app.models.Workspace).filter(
        app.models.List.id == list_id,
        app.models.Workspace.owner_id == current_user.id
    ).first()
    if not list_item:
        raise HTTPException(status_code=404, detail="List not found")
    return crud.create_card(db=db, card=card, list_id=list_id)


@router.get("/{list_id}/cards/", response_model=List[schemas.Card])
def read_cards(list_id: int, current_user = Depends(get_user), db: Session = Depends(get_db)):
    # Check ownership
    list_item = db.query(app.models.List).join(app.models.Board).join(app.models.Workspace).filter(
        app.models.List.id == list_id,
        app.models.Workspace.owner_id == current_user.id
    ).first()
    if not list_item:
        raise HTTPException(status_code=404, detail="List not found")
    return crud.get_cards(db, list_id)
