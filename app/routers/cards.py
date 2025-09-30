from typing import List

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
    # Check if user owns the list via board/workspace
    list_item = db.query(models.List).join(models.Board).join(models.Workspace).filter(
        models.List.id == list_id,
        models.Workspace.owner_id == current_user.id
    ).first()
    if not list_item:
        raise HTTPException(status_code=404, detail="List not found")
    return crud.create_card(db=db, card=card, list_id=list_id)


@router.get("/{list_id}/cards/", response_model=List[schemas.Card])
def read_cards(list_id: int, current_user = Depends(get_user), db: Session = Depends(get_db)):
    # Check ownership
    list_item = db.query(models.List).join(models.Board).join(models.Workspace).filter(
        models.List.id == list_id,
        models.Workspace.owner_id == current_user.id
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
    card = db.query(models.Card).filter(
        models.Card.id == card_id,
        models.Card.list_id == list_id
    ).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found in this list")

    # Check ownership via current list -> board -> workspace
    current_list = db.query(models.List).filter(models.List.id == list_id).first()
    if not current_list:
        raise HTTPException(status_code=404, detail="List not found")
    current_board = db.query(models.Board).filter(models.Board.id == current_list.board_id).first()
    if not current_board:
        raise HTTPException(status_code=404, detail="Board not found")
    current_workspace = db.query(models.Workspace).filter(models.Workspace.id == current_board.workspace_id).first()
    if not current_workspace or current_workspace.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # If changing list_id
    new_list_id = card_update.list_id
    if new_list_id and new_list_id != list_id:
        new_list = db.query(models.List).filter(models.List.id == new_list_id).first()
        if not new_list:
            raise HTTPException(status_code=404, detail="New list not found")
        new_board = db.query(models.Board).filter(models.Board.id == new_list.board_id).first()
        if not new_board:
            raise HTTPException(status_code=404, detail="New board not found")
        new_workspace = db.query(models.Workspace).filter(models.Workspace.id == new_board.workspace_id).first()
        if not new_workspace or new_workspace.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized for new list")
        card.list_id = new_list_id

    # Update position if provided
    if card_update.position is not None:
        card.position = card_update.position

    # Update other fields if provided
    if card_update.name is not None:
        card.name = card_update.name
    if card_update.description is not None:
        card.description = card_update.description

    db.commit()
    db.refresh(card)
    return card
