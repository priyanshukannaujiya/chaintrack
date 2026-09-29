from pydantic import BaseModel, EmailStr
from uuid import UUID
from app.models.domain import RoleEnum

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    company_name: str
    role: RoleEnum

class SignupResponse(BaseModel):
    user_id: UUID
    company_id: UUID
    token: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    token: str
    role: RoleEnum
    company_id: UUID
