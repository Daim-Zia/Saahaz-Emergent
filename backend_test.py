import requests
import sys
import json
from datetime import datetime

class SaahazAPITester:
    def __init__(self, base_url="https://clothing-shop-15.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.admin_user_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Use admin token if specified and available
        if use_admin and self.admin_token:
            headers['Authorization'] = f'Bearer {self.admin_token}'
        elif self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())}")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if response.text and response.status_code < 500 else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test("API Root", "GET", "", 200)
        return success

    def test_register_user(self, email, password, name, is_admin=False):
        """Test user registration"""
        user_data = {
            "email": email,
            "password": password,
            "name": name,
            "address": "Test Address, Lahore",
            "phone": "+92 300 1234567"
        }
        
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, user_data)
        
        if success and 'access_token' in response:
            if is_admin:
                self.admin_token = response['access_token']
                self.admin_user_id = response['user']['id']
            else:
                self.token = response['access_token']
                self.user_id = response['user']['id']
            print(f"   Token received: {response['access_token'][:20]}...")
            return True
        return False

    def test_login_user(self, email, password, is_admin=False):
        """Test user login"""
        login_data = {
            "email": email,
            "password": password
        }
        
        success, response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        
        if success and 'access_token' in response:
            if is_admin:
                self.admin_token = response['access_token']
                self.admin_user_id = response['user']['id']
            else:
                self.token = response['access_token']
                self.user_id = response['user']['id']
            print(f"   Token received: {response['access_token'][:20]}...")
            return True
        return False

    def test_get_categories(self):
        """Test getting categories"""
        success, response = self.run_test("Get Categories", "GET", "categories", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} categories")
            for cat in response[:3]:  # Show first 3 categories
                print(f"   - {cat.get('name', 'Unknown')}: {cat.get('description', 'No description')}")
        return success

    def test_get_products(self):
        """Test getting all products"""
        success, response = self.run_test("Get All Products", "GET", "products", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} products")
            for prod in response[:3]:  # Show first 3 products
                print(f"   - {prod.get('name', 'Unknown')}: PKR {prod.get('price', 0)}")
        return success

    def test_get_featured_products(self):
        """Test getting featured products"""
        success, response = self.run_test("Get Featured Products", "GET", "products?featured=true", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} featured products")
        return success

    def test_get_products_by_category(self, category_id):
        """Test getting products by category"""
        success, response = self.run_test(
            "Get Products by Category", 
            "GET", 
            f"products?category_id={category_id}", 
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} products in category")
        return success

    def test_user_profile(self):
        """Test getting user profile"""
        success, response = self.run_test("Get User Profile", "GET", "profile", 200)
        if success:
            print(f"   User: {response.get('name', 'Unknown')} ({response.get('email', 'No email')})")
        return success

    def test_create_order(self):
        """Test creating an order"""
        # First get a product to order
        success, products = self.run_test("Get Products for Order", "GET", "products", 200)
        if not success or not products:
            print("❌ Cannot test order creation - no products available")
            return False

        product = products[0]
        order_data = {
            "items": [
                {
                    "product_id": product['id'],
                    "quantity": 2,
                    "size": product['sizes'][0] if product['sizes'] else None,
                    "color": product['colors'][0] if product['colors'] else None
                }
            ],
            "delivery_address": "Test Delivery Address, Lahore, Pakistan",
            "phone": "+92 300 1234567"
        }
        
        success, response = self.run_test("Create Order", "POST", "orders", 200, order_data)
        if success:
            print(f"   Order created with ID: {response.get('id', 'Unknown')}")
            print(f"   Total amount: PKR {response.get('total_amount', 0)}")
        return success

    def test_get_orders(self):
        """Test getting user orders"""
        success, response = self.run_test("Get User Orders", "GET", "orders", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} orders")
        return success

    def test_admin_create_category(self):
        """Test admin creating a category"""
        category_data = {
            "name": "Test Category",
            "description": "A test category created by admin",
            "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxmYXNoaW9ufGVufDB8fHx8MTc1ODA1OTk4NHww&ixlib=rb-4.1.0&q=85"
        }
        
        success, response = self.run_test(
            "Admin Create Category", 
            "POST", 
            "categories", 
            200, 
            category_data, 
            use_admin=True
        )
        return success

    def test_admin_create_product(self, category_id):
        """Test admin creating a product"""
        product_data = {
            "name": "Test Product",
            "description": "A test product created by admin",
            "price": 2999.0,
            "category_id": category_id,
            "images": ["https://images.unsplash.com/photo-1562157873-818bc0726f68?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85"],
            "sizes": ["S", "M", "L", "XL"],
            "colors": ["Red", "Blue", "Green"],
            "inventory": 100,
            "featured": True
        }
        
        success, response = self.run_test(
            "Admin Create Product", 
            "POST", 
            "products", 
            200, 
            product_data, 
            use_admin=True
        )
        return success

def main():
    print("🚀 Starting Saahaz.com API Testing...")
    print("=" * 60)
    
    tester = SaahazAPITester()
    
    # Test API connectivity
    print("\n📡 Testing API Connectivity...")
    if not tester.test_api_root():
        print("❌ API is not accessible. Stopping tests.")
        return 1

    # Test user registration and authentication
    print("\n👤 Testing User Authentication...")
    test_email = f"test_user_{datetime.now().strftime('%H%M%S')}@test.com"
    admin_email = f"admin_user_{datetime.now().strftime('%H%M%S')}@test.com"
    test_password = "TestPass123!"
    
    if not tester.test_register_user(test_email, test_password, "Test User"):
        print("❌ User registration failed. Stopping user tests.")
        return 1
    
    # Test login with the same user
    if not tester.test_login_user(test_email, test_password):
        print("❌ User login failed.")
    
    # Test user profile
    tester.test_user_profile()

    # Test product and category endpoints
    print("\n🛍️ Testing Product & Category Endpoints...")
    tester.test_get_categories()
    tester.test_get_products()
    tester.test_get_featured_products()
    
    # Get a category ID for testing
    success, categories = tester.run_test("Get Categories for Testing", "GET", "categories", 200)
    if success and categories:
        category_id = categories[0]['id']
        tester.test_get_products_by_category(category_id)

    # Test order functionality
    print("\n📦 Testing Order Functionality...")
    tester.test_create_order()
    tester.test_get_orders()

    # Test admin functionality
    print("\n👑 Testing Admin Functionality...")
    
    # Register admin user (in real app, admin would be created differently)
    if tester.test_register_user(admin_email, test_password, "Admin User", is_admin=True):
        # Note: In the current implementation, users are not admin by default
        # This test will likely fail for admin-only endpoints
        tester.test_admin_create_category()
        
        if success and categories:
            tester.test_admin_create_product(categories[0]['id'])

    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        failed_tests = tester.tests_run - tester.tests_passed
        print(f"⚠️  {failed_tests} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())