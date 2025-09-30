from typing import List
from sqlalchemy import or_

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas, models
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
    list_item = db.query(models.List).join(models.Board).join(models.Workspace).filter(
        models.List.id == list_id,
        or_(models.Workspace.owner_id == current_user.id, models.Workspace.id.in_(
            db.query(models.workspace_members.c.workspace_id).filter(models.workspace_members.c.user_id == current_user.id)
        ))
    ).first()
    if not list_item:
        raise HTTPException(status_code=404, detail="List not found")
    return crud.create_card(db=db, card=card, list_id=list_id)


@router.get("/{list_id}/cards/", response_model=List[schemas.Card])
def read_cards(list_id: int, current_user = Depends(get_user), db: Session = Depends(get_db)):
    list_item = db.query(models.List).join(models.Board).join(models.Workspace).filter(
        models.List.id == list_id,
        or_(models.Workspace.owner_id == current_user.id, models.Workspace.id.in_(
            db.query(models.workspace_members.c.workspace_id).filter(models.workspace_members.c.user_id == current_user.id)
        ))
    ).first()
    if not list_item:
        raise HTTPException(status_code=404, detail="List not found")
    return crud.get_cards(db, list_id)


@router.patch("/{list_id}/cards/{card_id}", response_model=schemas.Card)
def update_card_for_list(
    list_id: int,
    card_id: int,
    card_update: schemas.CardUpdate,
    current_user=Depends(get_user),
    db: Session = Depends(get_db)
):
    updated_card = crud.update_card(db, card_id, list_id, card_update, current_user.id)
    if not updated_card:
        raise HTTPException(status_code=404, detail="Card not found")
    return updated_card


@router.delete("/{list_id}/cards/{card_id}/")
def delete_card(
    list_id: int,
    card_id: int,
    current_user = Depends(get_user),
    db: Session = Depends(get_db)
):
    if not crud.delete_card(db, card_id, current_user.id, list_id):
        raise HTTPException(status_code=404, detail="Card not found")
    return {"message": "Card deleted successfully"}
