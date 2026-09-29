from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.schemas import core
from app.models.domain import User, Company
from app.api.deps import get_current_user
from app.database import get_db

router = APIRouter()

@router.get("/me", response_model=core.CompanyResponse)
def get_current_company(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    return company

@router.get("", response_model=List[core.CompanyResponse])
def get_all_companies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Company).all()
