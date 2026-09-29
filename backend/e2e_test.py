import uuid
import sys
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_e2e.db"
engine_test = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

Base.metadata.drop_all(bind=engine_test)
Base.metadata.create_all(bind=engine_test)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_full_journey():
    print("1. Health Check...")
    resp = client.get("/health")
    assert resp.status_code == 200, f"Health check failed: {resp.text}"

    print("2. Signup...")
    email = f"test_{uuid.uuid4()}@company.com"
    resp = client.post("/api/v1/auth/signup", json={
        "email": email,
        "password": "securepassword",
        "company_name": "Test Company",
        "role": "ADMIN"
    })
    assert resp.status_code == 200, f"Signup failed: {resp.text}"
    token = resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("3. Create Product...")
    resp = client.post("/api/v1/products", json={
        "name": "Widget A",
        "quantity": 100,
        "description": "High quality widget"
    }, headers=headers)
    assert resp.status_code == 200, f"Create product failed: {resp.text}"
    product_id = resp.json()["id"]

    print("4. Fetch Products...")
    resp = client.get("/api/v1/products", headers=headers)
    assert resp.status_code == 200, f"Fetch products failed: {resp.text}"
    assert len(resp.json()) == 1, "Expected 1 product"

    print("5. Import CSV...")
    csv_content = "name,quantity,description\nWidget B,50,Test desc\nWidget C,10,Another desc"
    resp = client.post(
        "/api/v1/products/import",
        files={"file": ("test.csv", csv_content, "text/csv")},
        headers=headers
    )
    assert resp.status_code == 200, f"Import CSV failed: {resp.text}"
    assert resp.json()["success_count"] == 2, "Expected 2 products imported"

    print("6. Creating Partner Company...")
    resp2 = client.post("/api/v1/auth/signup", json={
        "email": f"partner_{uuid.uuid4()}@company.com",
        "password": "securepassword",
        "company_name": "Partner Company",
        "role": "ADMIN"
    })
    partner_company_id = resp2.json()["company_id"]

    print("7. Create Shipment...")
    resp = client.post("/api/v1/shipments", json={
        "product_id": product_id,
        "to_company_id": partner_company_id,
        "quantity": 20
    }, headers=headers)
    assert resp.status_code == 200, f"Create shipment failed: {resp.text}"
    shipment_id = resp.json()["id"]

    print("8. Transfer Shipment...")
    resp = client.post(f"/api/v1/shipments/{shipment_id}/transfer", headers=headers)
    assert resp.status_code == 200, f"Transfer shipment failed: {resp.text}"
    assert resp.json()["status"] == "SHIPPED", "Shipment status should be SHIPPED"

    print("9. Track Shipment (Simulated API)...")
    # This might take 0.8 seconds due to asyncio.sleep in the logistics service
    resp = client.get(f"/api/v1/shipments/{shipment_id}/tracking", headers=headers)
    assert resp.status_code == 200, f"Track shipment failed: {resp.text}"
    assert "tracking_number" in resp.json(), "Missing tracking number"
    
    print("✅ All E2E tests passed successfully!")

if __name__ == "__main__":
    test_full_journey()
