from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import blockchain
import uuid
from app.models.domain import BlockchainEventStatusEnum, User
from app.database import get_db
from app.api.deps import get_current_user
from app.services.blockchain_service import BlockchainService

router = APIRouter()

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
