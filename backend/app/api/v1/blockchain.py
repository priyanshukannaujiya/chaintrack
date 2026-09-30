from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.schemas import blockchain
from typing import List, Optional
import uuid
from app.models.domain import User
from app.database import get_db
from app.api.deps import get_current_user
from app.services.blockchain_service import BlockchainService

router = APIRouter()

@router.get("/events", response_model=List[blockchain.BlockchainEventResponse])
def list_blockchain_events(
    product_id: Optional[uuid.UUID] = Query(None, description="Filter by product ID"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = BlockchainService(db)
    return service.get_events(current_user.company_id, product_id=product_id, page=page, limit=limit)

@router.post("/events", response_model=blockchain.BlockchainEventResponse)
def create_blockchain_event(
    req: blockchain.BlockchainEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = BlockchainService(db)
    return service.create_event(current_user.company_id, req)

@router.get("/events/{transaction_hash}", response_model=blockchain.BlockchainEventResponse)
def get_blockchain_event(
    transaction_hash: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = BlockchainService(db)
    return service.get_event(transaction_hash)
