from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app.schemas import shipment
import uuid
from app.models.domain import ShipmentStatusEnum, User, Shipment
from app.database import get_db
from app.api.deps import get_current_user
from app.services.shipment_service import ShipmentService
from app.services.logistics_service import LogisticsService

router = APIRouter()

@router.get("", response_model=List[shipment.ShipmentResponse])
def get_shipments(
    page: int = 1, 
    limit: int = 25, 
    status: Optional[ShipmentStatusEnum] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ShipmentService(db)
    return service.get_shipments(current_user.company_id, page, limit, status)

@router.post("", response_model=shipment.ShipmentResponse)
def create_shipment(
    req: shipment.ShipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ShipmentService(db)
    return service.create_shipment(current_user.company_id, req)

@router.post("/{id}/transfer", response_model=shipment.ShipmentResponse)
def transfer_shipment(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ShipmentService(db)
    return service.transfer_shipment(current_user.company_id, id)

@router.post("/{id}/receive", response_model=shipment.ShipmentResponse)
def receive_shipment(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ShipmentService(db)
    return service.receive_shipment(current_user.company_id, id)

@router.get("/{id}/tracking")
async def get_shipment_tracking(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shipment_obj = db.query(Shipment).filter(Shipment.id == id).first()
    if not shipment_obj or (shipment_obj.from_company_id != current_user.company_id and shipment_obj.to_company_id != current_user.company_id):
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    return await LogisticsService.get_tracking_info(id)
