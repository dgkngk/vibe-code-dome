from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas, models
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


@router.delete("/workspaces/{workspace_id}/")
def delete_workspace(
    workspace_id: int,
    current_user = Depends(get_user),
    db: Session = Depends(get_db)
):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id,
        models.Workspace.owner_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    crud.delete_workspace(db, workspace_id)
    return {"message": "Workspace deleted successfully"}
