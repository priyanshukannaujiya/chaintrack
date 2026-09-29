from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app.schemas import product
import uuid
from app.models.domain import ProductStatusEnum, User
from app.database import get_db
from app.api.deps import get_current_user
from app.services.product_service import ProductService

router = APIRouter()

@router.get("", response_model=List[product.ProductResponse])
def get_products(
    page: int = 1, 
    limit: int = 25, 
    status: Optional[ProductStatusEnum] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProductService(db)
    return service.get_products(current_user.company_id, page, limit, status)

@router.post("", response_model=product.ProductResponse)
def create_product(
    req: product.ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProductService(db)
    return service.create_product(current_user.company_id, req)

@router.get("/{id}", response_model=product.ProductResponse)
def get_product(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProductService(db)
    prod = service.get_product(current_user.company_id, id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return prod

@router.post("/import", response_model=product.ImportResult)
def import_products(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProductService(db)
    return service.import_products_csv(current_user.company_id, file)
