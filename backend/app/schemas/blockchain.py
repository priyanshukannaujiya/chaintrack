from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.models.domain import BlockchainEventStatusEnum

class BlockchainEventCreate(BaseModel):
    product_id: UUID
    transaction_hash: str
    event_type: str

class BlockchainEventResponse(BaseModel):
    id: UUID
    company_id: UUID
    product_id: UUID
    transaction_hash: str
    event_type: str
    status: BlockchainEventStatusEnum
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
