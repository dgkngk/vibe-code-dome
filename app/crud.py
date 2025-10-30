from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

import app.models as models
import app.schemas as schemas
from app.auth import get_password_hash


def get_user_by_email(db: Session, email: str):
    return (
        db.query(models.User)
        .filter(func.lower(models.User.email) == email.lower())
        .first()
    )


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email.lower(),
        hashed_password=hashed_password,
    )
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
    return (
        db.query(models.Workspace)
        .filter(
            or_(
                models.Workspace.owner_id == user_id,
                models.Workspace.id.in_(
                    db.query(models.workspace_members.c.workspace_id).filter(
                        models.workspace_members.c.user_id == user_id
                    )
                ),
            )
        )
        .all()
    )


def get_workspace_by_id(db: Session, workspace_id: int, user_id: int):
    workspace = (
        db.query(models.Workspace)
        .filter(
            models.Workspace.id == workspace_id,
            or_(
                models.Workspace.owner_id == user_id,
                models.Workspace.id.in_(
                    db.query(models.workspace_members.c.workspace_id).filter(
                        models.workspace_members.c.user_id == user_id
                    )
                ),
            ),
        )
        .first()
    )
    if workspace:
        workspace.members = (
            db.query(models.User)
            .join(models.workspace_members)
            .filter(models.workspace_members.c.workspace_id == workspace_id)
            .all()
        )
    return workspace


def delete_workspace(db: Session, workspace_id: int, user_id: int) -> bool:
    workspace = (
        db.query(models.Workspace)
        .filter(
            models.Workspace.id == workspace_id, models.Workspace.owner_id == user_id
        )
        .first()
    )
    if not workspace:
        return False
    num_deleted = (
        db.query(models.Workspace).filter(models.Workspace.id == workspace_id).delete()
    )
    db.commit()
    return num_deleted > 0


def add_member_to_workspace(db: Session, workspace_id: int, user_id: int):
    if (
        not db.query(models.workspace_members)
        .filter(
            models.workspace_members.c.workspace_id == workspace_id,
            models.workspace_members.c.user_id == user_id,
        )
        .first()
    ):
        ins = models.workspace_members.insert().values(
            workspace_id=workspace_id, user_id=user_id
        )
        db.execute(ins)
        db.commit()
    return True


def get_members(db: Session, workspace_id: int):
    return (
        db.query(models.User)
        .join(models.workspace_members)
        .filter(models.workspace_members.c.workspace_id == workspace_id)
        .all()
    )


def search_users(db: Session, query: str, exclude_user_id: int = None):
    q = db.query(models.User).filter(
        func.lower(models.User.email).like(f"%{query.lower()}%")
    )
    if exclude_user_id:
        q = q.filter(models.User.id != exclude_user_id)
    return q.all()


def create_board(db: Session, board: schemas.BoardCreate, workspace_id: int):
    db_board = models.Board(**board.dict(), workspace_id=workspace_id)
    db.add(db_board)
    db.commit()
    db.refresh(db_board)
    return db_board


def get_boards(db: Session, workspace_id: int):
    return (
        db.query(models.Board).filter(models.Board.workspace_id == workspace_id).all()
    )


def get_board(db: Session, board_id: int, user_id: int):
    return (
        db.query(models.Board)
        .join(models.Workspace)
        .filter(
            models.Board.id == board_id,
            or_(
                models.Workspace.owner_id == user_id,
                models.Workspace.id.in_(
                    db.query(models.workspace_members.c.workspace_id).filter(
                        models.workspace_members.c.user_id == user_id
                    )
                ),
            ),
        )
        .first()
    )


def create_list(db: Session, list_item: schemas.ListCreate, board_id: int):
    db_list = models.List(**list_item.dict(), board_id=board_id)
    db.add(db_list)
    db.commit()
    db.refresh(db_list)
    return db_list


def get_lists(db: Session, board_id: int):
    return (
        db.query(models.List)
        .filter(models.List.board_id == board_id)
        .order_by(models.List.position)
        .all()
    )


def delete_list(db: Session, list_id: int, user_id: int, board_id: int) -> bool:
    list_item = (
        db.query(models.List)
        .join(models.Board)
        .join(models.Workspace)
        .filter(
            models.List.id == list_id,
            models.Board.id == board_id,
            or_(
                models.Workspace.owner_id == user_id,
                models.Workspace.id.in_(
                    db.query(models.workspace_members.c.workspace_id).filter(
                        models.workspace_members.c.user_id == user_id
                    )
                ),
            ),
        )
        .first()
    )
    if not list_item:
        return False
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
    return (
        db.query(models.Card)
        .filter(models.Card.list_id == list_id)
        .order_by(models.Card.position)
        .all()
    )


def update_card(
    db: Session,
    card_id: int,
    list_id: int,
    card_update: schemas.CardUpdate,
    user_id: int,
):
    card = (
        db.query(models.Card)
        .filter(models.Card.id == card_id, models.Card.list_id == list_id)
        .first()
    )
    if not card:
        return None

    current_list = db.query(models.List).filter(models.List.id == list_id).first()
    if not current_list:
        return None
    current_board = (
        db.query(models.Board).filter(models.Board.id == current_list.board_id).first()
    )
    if not current_board:
        return None
    current_workspace = (
        db.query(models.Workspace)
        .filter(models.Workspace.id == current_board.workspace_id)
        .first()
    )
    if not current_workspace or not (
        current_workspace.owner_id == user_id
        or db.query(models.workspace_members)
        .filter(
            models.workspace_members.c.workspace_id == current_workspace.id,
            models.workspace_members.c.user_id == user_id,
        )
        .first()
    ):
        return None

    if card_update.list_id and card_update.list_id != list_id:
        new_list = (
            db.query(models.List).filter(models.List.id == card_update.list_id).first()
        )
        if not new_list:
            return None
        new_board = (
            db.query(models.Board).filter(models.Board.id == new_list.board_id).first()
        )
        if not new_board:
            return None
        new_workspace = (
            db.query(models.Workspace)
            .filter(models.Workspace.id == new_board.workspace_id)
            .first()
        )
        if not new_workspace or not (
            new_workspace.owner_id == user_id
            or db.query(models.workspace_members)
            .filter(
                models.workspace_members.c.workspace_id == new_workspace.id,
                models.workspace_members.c.user_id == user_id,
            )
            .first()
        ):
            return None
        card.list_id = card_update.list_id

    if card_update.position is not None:
        card.position = card_update.position
    if card_update.name is not None:
        card.name = card_update.name
    if card_update.description is not None:
        card.description = card_update.description

    db.commit()
    db.refresh(card)
    return card


def delete_card(db: Session, card_id: int, user_id: int, list_id: int) -> bool:
    card = (
        db.query(models.Card)
        .join(models.List)
        .join(models.Board)
        .join(models.Workspace)
        .filter(
            models.Card.id == card_id,
            models.Card.list_id == list_id,
            or_(
                models.Workspace.owner_id == user_id,
                models.Workspace.id.in_(
                    db.query(models.workspace_members.c.workspace_id).filter(
                        models.workspace_members.c.user_id == user_id
                    )
                ),
            ),
        )
        .first()
    )
    if not card:
        return False
    num_deleted = db.query(models.Card).filter(models.Card.id == card_id).delete()
    db.commit()
    return num_deleted > 0
