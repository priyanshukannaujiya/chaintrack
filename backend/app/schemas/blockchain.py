from pydantic import BaseModel
from uuid import UUID
from app.models.domain import BlockchainEventStatusEnum

class BlockchainEventCreate(BaseModel):
    product_id: UUID
    transaction_hash: str
    event_type: str

class BlockchainEventResponse(BaseModel):
    id: UUID
    product_id: UUID
    transaction_hash: str
    event_type: str
    status: BlockchainEventStatusEnum

    class Config:
        from_attributes = True
