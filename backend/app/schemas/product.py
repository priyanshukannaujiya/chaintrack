from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from app.models.domain import ProductStatusEnum
from decimal import Decimal

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    quantity: Decimal

class ProductResponse(BaseModel):
    id: UUID
    company_id: UUID
    name: str
    description: Optional[str]
    quantity: Decimal
    status: ProductStatusEnum
    blockchain_hash: Optional[str]

    class Config:
        from_attributes = True

class RowError(BaseModel):
    row_num: int
    error: str

class ImportResult(BaseModel):
    success_count: int
    errors: List[RowError]
