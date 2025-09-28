from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.auth import get_user
from app.database import get_db

router = APIRouter()

@router.post("/workspaces/", response_model=schemas.Workspace)
def create_workspace_for_user(
    workspace: schemas.WorkspaceCreate,
    current_user = Depends(get_user),
    db: Session = Depends(get_db)
):
    return crud.create_workspace(db=db, workspace=workspace, user_id=current_user.id)


@router.get("/workspaces/", response_model=List[schemas.Workspace])
def read_workspaces(current_user = Depends(get_user), db: Session = Depends(get_db)):
    return crud.get_workspaces(db, current_user.id)
