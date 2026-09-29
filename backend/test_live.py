import httpx
import uuid
import time

base_url = "http://localhost:8000/api/v1"

def run_tests():
    print("1. Signing up to create an isolated test company...")
    email = f"test_{uuid.uuid4()}@company.com"
    resp = httpx.post(f"{base_url}/auth/signup", json={
        "email": email,
        "password": "securepassword",
        "company_name": "CSV Test Corp",
        "role": "ADMIN"
    })
    
    if resp.status_code != 200:
        print(f"Signup failed! {resp.status_code} - {resp.text}")
        return
        
    token = resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Signup success. Token acquired.")
    
    print("\n2. Testing valid CSV import...")
    with open("../samples/valid_products.csv", "rb") as f:
        files = {"file": ("valid_products.csv", f, "text/csv")}
        resp = httpx.post(f"{base_url}/products/import", headers=headers, files=files)
        
    print(f"Status Code: {resp.status_code}")
    print(f"Response: {resp.json()}")
    
    print("\n3. Testing invalid CSV import...")
    with open("../samples/invalid_products.csv", "rb") as f:
        files = {"file": ("invalid_products.csv", f, "text/csv")}
        resp = httpx.post(f"{base_url}/products/import", headers=headers, files=files)
        
    print(f"Status Code: {resp.status_code}")
    print(f"Response: {resp.json()}")
    
    print("\n4. Verifying database state...")
    resp = httpx.get(f"{base_url}/products", headers=headers)
    print(f"Total products found in DB for this company: {len(resp.json())}")
    for p in resp.json():
        print(f" - {p['name']} (Qty: {p['quantity']})")

if __name__ == "__main__":
    run_tests()
