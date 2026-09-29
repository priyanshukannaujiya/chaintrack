from sqlalchemy.orm import Session
from app.models.domain import BlockchainEvent, BlockchainEventStatusEnum
from app.schemas.blockchain import BlockchainEventCreate
import uuid
from fastapi import HTTPException

class BlockchainService:
    def __init__(self, db: Session):
        self.db = db

    def create_event(self, company_id: uuid.UUID, req: BlockchainEventCreate):
        event = BlockchainEvent(
            company_id=company_id,
            product_id=req.product_id,
            transaction_hash=req.transaction_hash,
            event_type=req.event_type,
            status=BlockchainEventStatusEnum.PENDING
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_event(self, transaction_hash: str):
        event = self.db.query(BlockchainEvent).filter(BlockchainEvent.transaction_hash == transaction_hash).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event
