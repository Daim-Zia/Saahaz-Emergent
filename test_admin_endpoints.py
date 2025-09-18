#!/usr/bin/env python3

import requests
import json

def test_admin_endpoints():
    """Test admin endpoints with the admin token"""
    print("🔐 TESTING ADMIN ENDPOINTS ACCESS")
    print("=" * 50)
    
    # First login to get admin token
    api_url = "https://clothing-shop-15.preview.emergentagent.com/api"
    login_data = {
        "email": "test@saahaz.com",
        "password": "password"
    }
    
    print("1️⃣ Getting admin token...")
    response = requests.post(f"{api_url}/auth/login", json=login_data)
    
    if response.status_code != 200:
        print("❌ Failed to get admin token")
        return
    
    data = response.json()
    token = data.get('access_token')
    user_data = data.get('user', {})
    
    print(f"✅ Token obtained for {user_data.get('email')}")
    print(f"   Is Admin: {user_data.get('is_admin')}")
    print(f"   Token: {token[:30]}...")
    
    # Test admin endpoints
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    print("\n2️⃣ Testing admin endpoints...")
    
    # Test 1: Get all orders (admin can see all orders)
    print("\n   Testing GET /api/orders (admin should see all orders)...")
    response = requests.get(f"{api_url}/orders", headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        orders = response.json()
        print(f"   ✅ Success - Found {len(orders)} orders")
    else:
        print(f"   ❌ Failed - {response.text}")
    
    # Test 2: Create category (admin only)
    print("\n   Testing POST /api/categories (admin only)...")
    category_data = {
        "name": "Test Admin Category",
        "description": "Created by admin test",
        "image": "https://example.com/test.jpg"
    }
    response = requests.post(f"{api_url}/categories", json=category_data, headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        category = response.json()
        print(f"   ✅ Success - Created category: {category.get('name')}")
    else:
        print(f"   ❌ Failed - {response.text}")
    
    # Test 3: Create product (admin only)
    print("\n   Testing POST /api/products (admin only)...")
    
    # First get a category ID
    categories_response = requests.get(f"{api_url}/categories")
    if categories_response.status_code == 200:
        categories = categories_response.json()
        if categories:
            category_id = categories[0]['id']
            
            product_data = {
                "name": "Test Admin Product",
                "description": "Created by admin test",
                "price": 1999.0,
                "category_id": category_id,
                "images": ["https://example.com/product.jpg"],
                "sizes": ["M", "L"],
                "colors": ["Red", "Blue"],
                "inventory": 50,
                "featured": True
            }
            
            response = requests.post(f"{api_url}/products", json=product_data, headers=headers)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                product = response.json()
                print(f"   ✅ Success - Created product: {product.get('name')}")
            else:
                print(f"   ❌ Failed - {response.text}")
        else:
            print("   ❌ No categories found to test product creation")
    else:
        print("   ❌ Could not get categories for product test")

if __name__ == "__main__":
    test_admin_endpoints()