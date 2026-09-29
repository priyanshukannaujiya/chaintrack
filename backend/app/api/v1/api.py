from fastapi import APIRouter, Depends
from app.api.v1 import auth, users, companies, products, shipments, blockchain
from app.api.deps import get_current_user

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"], dependencies=[Depends(get_current_user)])
api_router.include_router(companies.router, prefix="/companies", tags=["companies"], dependencies=[Depends(get_current_user)])
api_router.include_router(products.router, prefix="/products", tags=["products"], dependencies=[Depends(get_current_user)])
api_router.include_router(shipments.router, prefix="/shipments", tags=["shipments"], dependencies=[Depends(get_current_user)])
api_router.include_router(blockchain.router, prefix="/blockchain", tags=["blockchain"], dependencies=[Depends(get_current_user)])
