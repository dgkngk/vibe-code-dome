from sqlalchemy.orm import Session
from sqlalchemy import func

import app.models as models
import app.schemas as schemas

from app.auth import get_password_hash


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(func.lower(models.User.email) == email.lower()).first()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, email=user.email.lower(), hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_workspace(db: Session, workspace: schemas.WorkspaceCreate, user_id: int):
    db_workspace = models.Workspace(**workspace.dict(), owner_id=user_id)
    db.add(db_workspace)
    db.commit()
    db.refresh(db_workspace)
    return db_workspace


def get_workspaces(db: Session, user_id: int):
    return db.query(models.Workspace).filter(models.Workspace.owner_id == user_id).all()


def delete_workspace(db: Session, workspace_id: int) -> bool:
    num_deleted = db.query(models.Workspace).filter(models.Workspace.id == workspace_id).delete()
    db.commit()
    return num_deleted > 0


def create_board(db: Session, board: schemas.BoardCreate, workspace_id: int):
    db_board = models.Board(**board.dict(), workspace_id=workspace_id)
    db.add(db_board)
    db.commit()
    db.refresh(db_board)
    return db_board


def get_boards(db: Session, workspace_id: int):
    return db.query(models.Board).filter(models.Board.workspace_id == workspace_id).all()


def create_list(db: Session, list_item: schemas.ListCreate, board_id: int):
    db_list = models.List(**list_item.dict(), board_id=board_id)
    db.add(db_list)
    db.commit()
    db.refresh(db_list)
    return db_list


def get_lists(db: Session, board_id: int):
    return db.query(models.List).filter(models.List.board_id == board_id).order_by(models.List.position).all()


def delete_list(db: Session, list_id: int) -> bool:
    num_deleted = db.query(models.List).filter(models.List.id == list_id).delete()
    db.commit()
    return num_deleted > 0


def create_card(db: Session, card: schemas.CardCreate, list_id: int):
    db_card = models.Card(**card.dict(), list_id=list_id)
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card


def get_cards(db: Session, list_id: int):
    return db.query(models.Card).filter(models.Card.list_id == list_id).order_by(models.Card.position).all()


def delete_card(db: Session, card_id: int) -> bool:
    num_deleted = db.query(models.Card).filter(models.Card.id == card_id).delete()
    db.commit()
    return num_deleted > 0
