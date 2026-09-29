from fastapi import APIRouter, Depends
from app.schemas import core
from app.models.domain import User
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/me", response_model=core.UserResponse)
def get_current_user_endpoint(current_user: User = Depends(get_current_user)):
    return current_user
