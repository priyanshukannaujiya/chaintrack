from pydantic import BaseModel
from uuid import UUID
from app.models.domain import ShipmentStatusEnum
from decimal import Decimal

class ShipmentCreate(BaseModel):
    product_id: UUID
    to_company_id: UUID
    quantity: Decimal

class ShipmentResponse(BaseModel):
    id: UUID
    company_id: UUID
    product_id: UUID
    from_company_id: UUID
    to_company_id: UUID
    status: ShipmentStatusEnum

    class Config:
        from_attributes = True
