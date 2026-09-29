from sqlalchemy.orm import Session
from app.models.domain import User, Company
from app.schemas.auth import SignupRequest, LoginRequest, SignupResponse, LoginResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from fastapi import HTTPException, status

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def signup(self, req: SignupRequest) -> SignupResponse:
        # Check if email exists
        if self.db.query(User).filter(User.email == req.email).first():
            raise HTTPException(status_code=409, detail="Email already registered")
        
        # Create company
        new_company = Company(name=req.company_name)
        self.db.add(new_company)
        self.db.flush()

        # Create user
        new_user = User(
            company_id=new_company.id,
            email=req.email,
            hashed_password=get_password_hash(req.password),
            role=req.role
        )
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)

        # Generate token
        token = create_access_token(subject=new_user.id, role=new_user.role, company_id=new_company.id)
        
        return SignupResponse(
            user_id=new_user.id,
            company_id=new_company.id,
            token=token
        )

    def login(self, req: LoginRequest) -> LoginResponse:
        user = self.db.query(User).filter(User.email == req.email).first()
        if not user or not verify_password(req.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        
        token = create_access_token(subject=user.id, role=user.role, company_id=user.company_id)
        return LoginResponse(
            token=token,
            role=user.role,
            company_id=user.company_id
        )
