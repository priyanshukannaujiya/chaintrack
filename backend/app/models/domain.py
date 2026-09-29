from sqlalchemy import Column, String, Numeric, Enum, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime
from app.database import Base

class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    MANUFACTURER = "MANUFACTURER"
    WAREHOUSE = "WAREHOUSE"
    DISTRIBUTOR = "DISTRIBUTOR"
    RETAILER = "RETAILER"

class ProductStatusEnum(str, enum.Enum):
    DRAFT = "DRAFT"
    REGISTERED = "REGISTERED"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"

class RelationshipTypeEnum(str, enum.Enum):
    SUPPLIER = "SUPPLIER"
    DISTRIBUTOR = "DISTRIBUTOR"
    BUYER = "BUYER"

class ShipmentStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    SHIPPED = "SHIPPED"
    RECEIVED = "RECEIVED"
    CANCELLED = "CANCELLED"

class BlockchainEventStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    FAILED = "FAILED"
    SYNC_REQUIRED = "SYNC_REQUIRED"

class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users = relationship("User", back_populates="company")
    products = relationship("Product", back_populates="company")
    partners = relationship("Partner", foreign_keys="[Partner.company_id]", back_populates="company")
    shipments_from = relationship("Shipment", foreign_keys="[Shipment.from_company_id]", back_populates="from_company")
    shipments_to = relationship("Shipment", foreign_keys="[Shipment.to_company_id]", back_populates="to_company")

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company", back_populates="users")

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Numeric, nullable=False)
    status = Column(Enum(ProductStatusEnum), default=ProductStatusEnum.DRAFT, nullable=False)
    blockchain_hash = Column(String, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company", back_populates="products")
    shipments = relationship("Shipment", back_populates="product")
    blockchain_events = relationship("BlockchainEvent", back_populates="product")

class Partner(Base):
    __tablename__ = "partners"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), index=True, nullable=False)
    partner_company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    relationship_type = Column(Enum(RelationshipTypeEnum), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", foreign_keys=[company_id], back_populates="partners")
    partner_company = relationship("Company", foreign_keys=[partner_company_id])

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), index=True, nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), index=True, nullable=False)
    from_company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    to_company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    status = Column(Enum(ShipmentStatusEnum), default=ShipmentStatusEnum.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product", back_populates="shipments")
    from_company = relationship("Company", foreign_keys=[from_company_id], back_populates="shipments_from")
    to_company = relationship("Company", foreign_keys=[to_company_id], back_populates="shipments_to")

class BlockchainEvent(Base):
    __tablename__ = "blockchain_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), index=True, nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    transaction_hash = Column(String, unique=True, index=True, nullable=False)
    event_type = Column(String, nullable=False)
    status = Column(Enum(BlockchainEventStatusEnum), default=BlockchainEventStatusEnum.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="blockchain_events")
