from sqlalchemy.orm import Session
from app.models.domain import Shipment, Product, ShipmentStatusEnum, Company, ProductStatusEnum
from app.schemas.shipment import ShipmentCreate
import uuid
from fastapi import HTTPException


class ShipmentService:
    def __init__(self, db: Session):
        self.db = db

    def get_shipments(self, company_id: uuid.UUID, page: int = 1, limit: int = 25, status: str = None):
        query = self.db.query(Shipment).filter(
            (Shipment.from_company_id == company_id) | (Shipment.to_company_id == company_id)
        )
        if status:
            query = query.filter(Shipment.status == status)
        offset = (page - 1) * limit
        return query.offset(offset).limit(limit).all()

    def create_shipment(self, company_id: uuid.UUID, req: ShipmentCreate):
        product = self.db.query(Product).filter(
            Product.id == req.product_id, Product.company_id == company_id
        ).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found or not owned by company")

        target_company = self.db.query(Company).filter(Company.id == req.to_company_id).first()
        if not target_company:
            raise HTTPException(status_code=404, detail="Destination company not found")

        if req.to_company_id == company_id:
            raise HTTPException(status_code=400, detail="Cannot ship to your own company")

        if product.quantity < req.quantity:
            raise HTTPException(status_code=400, detail="Insufficient quantity")

        # Deduct inventory immediately on shipment creation
        product.quantity -= req.quantity

        shipment = Shipment(
            company_id=company_id,
            product_id=req.product_id,
            from_company_id=company_id,
            to_company_id=req.to_company_id,
            quantity=req.quantity,
            status=ShipmentStatusEnum.PENDING,
        )
        self.db.add(shipment)
        self.db.commit()
        self.db.refresh(shipment)
        return shipment

    def transfer_shipment(self, company_id: uuid.UUID, shipment_id: uuid.UUID):
        shipment = self.db.query(Shipment).filter(
            Shipment.id == shipment_id, Shipment.from_company_id == company_id
        ).first()
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found or unauthorized")
        if shipment.status != ShipmentStatusEnum.PENDING:
            raise HTTPException(status_code=400, detail="Only pending shipments can be transferred")

        shipment.status = ShipmentStatusEnum.SHIPPED

        product = self.db.query(Product).filter(Product.id == shipment.product_id).first()
        if product:
            product.status = ProductStatusEnum.IN_TRANSIT

        self.db.commit()
        self.db.refresh(shipment)
        return shipment

    def receive_shipment(self, company_id: uuid.UUID, shipment_id: uuid.UUID):
        shipment = self.db.query(Shipment).filter(
            Shipment.id == shipment_id, Shipment.to_company_id == company_id
        ).first()
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found or unauthorized")
        if shipment.status != ShipmentStatusEnum.SHIPPED:
            raise HTTPException(status_code=400, detail="Only shipped shipments can be received")

        shipment.status = ShipmentStatusEnum.RECEIVED

        product = self.db.query(Product).filter(Product.id == shipment.product_id).first()
        if product:
            # Transfer ownership + add quantity to receiver's inventory
            product.company_id = company_id
            product.quantity += shipment.quantity
            product.status = ProductStatusEnum.DELIVERED

        self.db.commit()
        self.db.refresh(shipment)
        return shipment
