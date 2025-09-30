from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class WorkspaceBase(BaseModel):
    name: str


class WorkspaceCreate(WorkspaceBase):
    pass


class Workspace(WorkspaceBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True


class BoardBase(BaseModel):
    name: str


class BoardCreate(BoardBase):
    pass


class Board(BoardBase):
    id: int
    workspace_id: int

    class Config:
        from_attributes = True


class ListBase(BaseModel):
    name: str
    position: int


class ListCreate(ListBase):
    pass


class List(ListBase):
    id: int
    board_id: int

    class Config:
        from_attributes = True


class CardBase(BaseModel):
    name: str
    description: Optional[str] = None
    position: int


class CardCreate(CardBase):
    pass


class CardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = None
    list_id: Optional[int] = None


class Card(CardBase):
    id: int
    list_id: int

    class Config:
        from_attributes = True
