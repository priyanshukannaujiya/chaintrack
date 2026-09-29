from pydantic import BaseModel, EmailStr
from uuid import UUID
from app.models.domain import RoleEnum

class CompanyResponse(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    role: RoleEnum
    company_id: UUID

    class Config:
        from_attributes = True
