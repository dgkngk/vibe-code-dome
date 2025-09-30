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


@router.get("/workspaces/{workspace_id}/", response_model=schemas.Workspace)
def read_workspace(workspace_id: int, current_user = Depends(get_user), db: Session = Depends(get_db)):
    workspace = crud.get_workspace_by_id(db, workspace_id, current_user.id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace


@router.delete("/workspaces/{workspace_id}/")
def delete_workspace(
    workspace_id: int,
    current_user = Depends(get_user),
    db: Session = Depends(get_db)
):
    workspace = crud.get_workspace_by_id(db, workspace_id, current_user.id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    if workspace.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can delete this workspace")
    num_deleted = db.query(models.Workspace).filter(models.Workspace.id == workspace_id).delete()
    db.commit()
    if num_deleted == 0:
        raise HTTPException(status_code=500, detail="Failed to delete workspace")
    return {"message": "Workspace deleted successfully"}


@router.post("/workspaces/{workspace_id}/members/", response_model=schemas.User)
def add_member(
    workspace_id: int,
    user_id: int,
    current_user = Depends(get_user),
    db: Session = Depends(get_db)
):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id,
        models.Workspace.owner_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=403, detail="Only owner can add members")
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    crud.add_member_to_workspace(db, workspace_id, user_id)
    return target_user


@router.get("/workspaces/{workspace_id}/members/", response_model=List[schemas.User])
def read_members(workspace_id: int, current_user = Depends(get_user), db: Session = Depends(get_db)):
    workspace = crud.get_workspace_by_id(db, workspace_id, current_user.id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return crud.get_members(db, workspace_id)


@router.get("/users/search/")
def search_users(q: str, current_user = Depends(get_user), db: Session = Depends(get_db)):
    return crud.search_users(db, q, current_user.id)
