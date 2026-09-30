from sqlalchemy.orm import Session
from app.models.domain import BlockchainEvent, BlockchainEventStatusEnum, Product, ProductStatusEnum
from app.schemas.blockchain import BlockchainEventCreate
import uuid
from typing import Optional
from fastapi import HTTPException


class BlockchainService:
    def __init__(self, db: Session):
        self.db = db

    def create_event(self, company_id: uuid.UUID, req: BlockchainEventCreate):
        # Validate the product belongs to this company
        product = self.db.query(Product).filter(
            Product.id == req.product_id,
            Product.company_id == company_id
        ).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found or not owned by company")

        # Prevent duplicate tx_hash entries
        existing = self.db.query(BlockchainEvent).filter(
            BlockchainEvent.transaction_hash == req.transaction_hash
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="Transaction hash already recorded")

        # Save the blockchain event record
        event = BlockchainEvent(
            company_id=company_id,
            product_id=req.product_id,
            transaction_hash=req.transaction_hash,
            event_type=req.event_type,
            status=BlockchainEventStatusEnum.CONFIRMED,
        )
        self.db.add(event)

        # Update the product: mark as REGISTERED and store the tx_hash
        product.blockchain_hash = req.transaction_hash
        product.status = ProductStatusEnum.REGISTERED

        self.db.commit()
        self.db.refresh(event)
        return event

    def get_events(
        self,
        company_id: uuid.UUID,
        product_id: Optional[uuid.UUID] = None,
        page: int = 1,
        limit: int = 50
    ):
        query = self.db.query(BlockchainEvent).filter(
            BlockchainEvent.company_id == company_id
        )
        if product_id:
            query = query.filter(BlockchainEvent.product_id == product_id)
        query = query.order_by(BlockchainEvent.created_at.desc())
        offset = (page - 1) * limit
        return query.offset(offset).limit(limit).all()

    def get_event(self, transaction_hash: str):
        event = self.db.query(BlockchainEvent).filter(
            BlockchainEvent.transaction_hash == transaction_hash
        ).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event
