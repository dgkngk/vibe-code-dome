import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import get_user
from app.database import get_db
from app.websocket import manager

router = APIRouter(prefix="/lists", tags=["cards"])


@router.post("/{list_id}/cards/", response_model=schemas.Card)
async def create_card_for_list(
    list_id: int,
    card: schemas.CardCreate,
    current_user=Depends(get_user),
    db: Session = Depends(get_db),
):
    list_item = (
        db.query(models.List)
        .join(models.Board)
        .join(models.Workspace)
        .filter(
            models.List.id == list_id,
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
    if not list_item:
        raise HTTPException(status_code=404, detail="List not found")
    new_card = crud.create_card(db=db, card=card, list_id=list_id)
    board = db.query(models.Board).filter(models.Board.id == list_item.board_id).first()
    await manager.broadcast(
        board.workspace_id,
        json.dumps({"type": "card_created", "payload": new_card.to_dict()}),
    )
    return new_card


@router.get("/{list_id}/cards/", response_model=List[schemas.Card])
def read_cards(
    list_id: int, current_user=Depends(get_user), db: Session = Depends(get_db)
):
    list_item = (
        db.query(models.List)
        .join(models.Board)
        .join(models.Workspace)
        .filter(
            models.List.id == list_id,
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
    if not list_item:
        raise HTTPException(status_code=404, detail="List not found")
    return crud.get_cards(db, list_id)


@router.patch("/{list_id}/cards/{card_id}", response_model=schemas.Card)
async def update_card_for_list(
    list_id: int,
    card_id: int,
    card_update: schemas.CardUpdate,
    current_user=Depends(get_user),
    db: Session = Depends(get_db),
):
    updated_card = crud.update_card(db, card_id, list_id, card_update, current_user.id)
    if not updated_card:
        raise HTTPException(status_code=404, detail="Card not found")
    list_item = db.query(models.List).filter(models.List.id == list_id).first()
    board = db.query(models.Board).filter(models.Board.id == list_item.board_id).first()
    await manager.broadcast(
        board.workspace_id,
        json.dumps({"type": "card_updated", "payload": updated_card.to_dict()}),
    )
    return updated_card


@router.delete("/{list_id}/cards/{card_id}/")
async def delete_card(
    list_id: int,
    card_id: int,
    current_user=Depends(get_user),
    db: Session = Depends(get_db),
):
    list_item = db.query(models.List).filter(models.List.id == list_id).first()
    board = db.query(models.Board).filter(models.Board.id == list_item.board_id).first()
    if not crud.delete_card(db, card_id, current_user.id, list_id):
        raise HTTPException(status_code=404, detail="Card not found")
    await manager.broadcast(
        board.workspace_id,
        json.dumps(
            {
                "type": "card_deleted",
                "payload": {"card_id": card_id, "list_id": list_id},
            }
        ),
    )
    return {"message": "Card deleted successfully"}
