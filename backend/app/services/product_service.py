from sqlalchemy.orm import Session
from app.models.domain import Product, ProductStatusEnum
from app.schemas.product import ProductCreate
import uuid

class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def get_products(self, company_id: uuid.UUID, page: int = 1, limit: int = 25, status: str = None):
        query = self.db.query(Product).filter(Product.company_id == company_id)
        if status:
            query = query.filter(Product.status == status)
        offset = (page - 1) * limit
        return query.offset(offset).limit(limit).all()

    def create_product(self, company_id: uuid.UUID, req: ProductCreate):
        product = Product(
            company_id=company_id,
            name=req.name,
            description=req.description,
            quantity=req.quantity,
            status=ProductStatusEnum.DRAFT
        )
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def get_product(self, company_id: uuid.UUID, product_id: uuid.UUID):
        return self.db.query(Product).filter(Product.company_id == company_id, Product.id == product_id).first()

    def import_products_csv(self, company_id: uuid.UUID, file):
        import csv
        import io
        content = file.file.read().decode('utf-8-sig')
        reader = csv.DictReader(io.StringIO(content))
        
        success_count = 0
        errors = []
        products_to_insert = []
        
        for row_num, row in enumerate(reader, start=1):
            name = row.get("name", "").strip()
            quantity_str = row.get("quantity", "").strip()
            description = row.get("description", "").strip()

            # Skip fully empty rows (e.g. trailing newline in CSV)
            if not any([name, quantity_str, description]):
                continue

            if not name:
                errors.append({"row_num": row_num, "error": "Missing name"})
                continue
            
            try:
                quantity = int(quantity_str)
                if quantity < 0:
                    raise ValueError
            except ValueError:
                errors.append({"row_num": row_num, "error": f"Invalid or negative quantity: '{quantity_str}'"})
                continue
                
            products_to_insert.append(
                (row_num, Product(
                    company_id=company_id,
                    name=name,
                    description=description,
                    quantity=quantity,
                    status=ProductStatusEnum.DRAFT
                ))
            )
        
        for row_num, product in products_to_insert:
            try:
                self.db.add(product)
                self.db.commit()
                self.db.refresh(product)
                success_count += 1
            except Exception as e:
                self.db.rollback()
                errors.append({"row_num": row_num, "error": f"DB error: {str(e)}"})

        return {"success_count": success_count, "errors": errors}
