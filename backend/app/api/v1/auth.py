from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import auth
from app.services.auth_service import AuthService
from app.database import get_db

router = APIRouter()

@router.post("/signup", response_model=auth.SignupResponse)
def signup(request: auth.SignupRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.signup(request)

@router.post("/login", response_model=auth.LoginResponse)
def login(request: auth.LoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.login(request)

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
