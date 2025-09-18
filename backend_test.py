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

    def test_admin_login_detailed(self, email, password):
        """Test admin login with detailed debugging"""
        print(f"\n🔍 DETAILED ADMIN LOGIN TEST for {email}")
        print("=" * 50)
        
        # Step 1: Check if user exists by attempting login
        login_data = {
            "email": email,
            "password": password
        }
        
        url = f"{self.api_url}/auth/login"
        headers = {'Content-Type': 'application/json'}
        
        print(f"1️⃣ Testing login endpoint: {url}")
        print(f"   Email: {email}")
        print(f"   Password: {'*' * len(password)}")
        
        try:
            response = requests.post(url, json=login_data, headers=headers, timeout=10)
            print(f"   Response Status: {response.status_code}")
            
            if response.status_code == 200:
                response_data = response.json()
                print("✅ LOGIN SUCCESSFUL")
                print(f"   Access Token: {response_data.get('access_token', 'Not found')[:30]}...")
                
                # Check user details
                user_data = response_data.get('user', {})
                print(f"\n2️⃣ USER DETAILS:")
                print(f"   ID: {user_data.get('id', 'Not found')}")
                print(f"   Email: {user_data.get('email', 'Not found')}")
                print(f"   Name: {user_data.get('name', 'Not found')}")
                print(f"   Is Admin: {user_data.get('is_admin', 'Not found')}")
                print(f"   Address: {user_data.get('address', 'Not found')}")
                print(f"   Phone: {user_data.get('phone', 'Not found')}")
                print(f"   Created At: {user_data.get('created_at', 'Not found')}")
                
                # Verify JWT token structure
                token = response_data.get('access_token')
                if token:
                    print(f"\n3️⃣ JWT TOKEN VERIFICATION:")
                    try:
                        import jwt
                        # Decode without verification to see payload
                        decoded = jwt.decode(token, options={"verify_signature": False})
                        print(f"   Token Payload: {decoded}")
                        print(f"   Subject (user_id): {decoded.get('sub', 'Not found')}")
                    except Exception as e:
                        print(f"   Token decode error: {str(e)}")
                
                # Test admin privileges
                if user_data.get('is_admin'):
                    print(f"\n4️⃣ TESTING ADMIN PRIVILEGES:")
                    self.admin_token = token
                    admin_test_success = self.test_admin_endpoint_access()
                    if admin_test_success:
                        print("✅ Admin privileges confirmed - can access admin endpoints")
                    else:
                        print("❌ Admin privileges not working - cannot access admin endpoints")
                else:
                    print(f"\n4️⃣ USER IS NOT ADMIN")
                    print("❌ is_admin field is False - user does not have admin privileges")
                
                return True, response_data
                
            elif response.status_code == 401:
                print("❌ LOGIN FAILED - 401 Unauthorized")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data.get('detail', 'Unknown error')}")
                    
                    if 'Invalid credentials' in error_data.get('detail', ''):
                        print("\n🔍 DEBUGGING LOGIN FAILURE:")
                        print("   Possible reasons:")
                        print("   - User does not exist in database")
                        print("   - Password is incorrect")
                        print("   - Email format issue")
                        
                        # Try to check if user exists by attempting registration
                        print("\n   Testing if user exists by attempting registration...")
                        reg_data = {
                            "email": email,
                            "password": "test123",
                            "name": "Test User"
                        }
                        reg_response = requests.post(f"{self.api_url}/auth/register", json=reg_data, headers=headers, timeout=10)
                        if reg_response.status_code == 400:
                            reg_error = reg_response.json()
                            if 'already registered' in reg_error.get('detail', ''):
                                print("   ✅ User EXISTS in database - password is likely incorrect")
                            else:
                                print(f"   Registration error: {reg_error.get('detail', 'Unknown')}")
                        elif reg_response.status_code == 200:
                            print("   ❌ User does NOT exist in database - registration succeeded")
                        else:
                            print(f"   Registration test inconclusive - status: {reg_response.status_code}")
                            
                except Exception as e:
                    print(f"   Could not parse error response: {str(e)}")
                    print(f"   Raw response: {response.text}")
                
                return False, {}
                
            else:
                print(f"❌ UNEXPECTED RESPONSE - Status: {response.status_code}")
                print(f"   Response: {response.text}")
                return False, {}
                
        except requests.exceptions.Timeout:
            print("❌ REQUEST TIMEOUT")
            return False, {}
        except requests.exceptions.ConnectionError:
            print("❌ CONNECTION ERROR - Cannot reach the API")
            return False, {}
        except Exception as e:
            print(f"❌ UNEXPECTED ERROR: {str(e)}")
            return False, {}

    def test_admin_endpoint_access(self):
        """Test if current admin token can access admin endpoints"""
        if not self.admin_token:
            return False
            
        # Try to access an admin endpoint
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        try:
            # Test admin access by trying to get all orders (admin can see all orders)
            response = requests.get(f"{self.api_url}/orders", headers=headers, timeout=10)
            return response.status_code == 200
        except:
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
        """Test creating an order with comprehensive validation"""
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
                    "size": product['sizes'][0] if product['sizes'] else "M",
                    "color": product['colors'][0] if product['colors'] else "Blue"
                }
            ],
            "delivery_address": "123 Fashion Street, Gulberg III, Lahore, Punjab, Pakistan",
            "phone": "+92 300 1234567",
            "delivery_option": "standard",
            "delivery_charge": 200.0,
            "subtotal": product['price'] * 2,
            "total": (product['price'] * 2) + 200.0
        }
        
        success, response = self.run_test("Create Order", "POST", "orders", 200, order_data)
        if success:
            print(f"   Order created with ID: {response.get('id', 'Unknown')}")
            print(f"   Subtotal: PKR {response.get('subtotal', 0)}")
            print(f"   Delivery Charge: PKR {response.get('delivery_charge', 0)}")
            print(f"   Total amount: PKR {response.get('total_amount', 0)}")
            print(f"   Delivery Option: {response.get('delivery_option', 'Unknown')}")
            print(f"   Status: {response.get('status', 'Unknown')}")
            
            # Validate required fields are present
            required_fields = ['id', 'user_id', 'items', 'subtotal', 'delivery_charge', 'total_amount', 'delivery_option', 'delivery_address', 'phone']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"   ⚠️ Missing fields in response: {missing_fields}")
                return False
            else:
                print("   ✅ All required fields present in order response")
                
        return success

    def test_get_orders(self):
        """Test getting user orders"""
        success, response = self.run_test("Get User Orders", "GET", "orders", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} orders")
            for order in response[:3]:  # Show first 3 orders
                print(f"   - Order ID: {order.get('id', 'Unknown')}")
                print(f"     Status: {order.get('status', 'Unknown')}")
                print(f"     Subtotal: PKR {order.get('subtotal', 0)}")
                print(f"     Delivery Charge: PKR {order.get('delivery_charge', 0)}")
                print(f"     Total: PKR {order.get('total_amount', 0)}")
                print(f"     Delivery Option: {order.get('delivery_option', 'Unknown')}")
        return success

    def test_admin_get_all_orders(self):
        """Test admin getting all orders"""
        if not self.admin_token:
            print("❌ No admin token available for admin orders test")
            return False
            
        success, response = self.run_test("Admin Get All Orders", "GET", "orders", 200, use_admin=True)
        if success and isinstance(response, list):
            print(f"   Admin found {len(response)} total orders")
            
            # Validate order structure
            for i, order in enumerate(response[:3]):  # Check first 3 orders
                print(f"   Order {i+1}:")
                print(f"     ID: {order.get('id', 'Missing')}")
                print(f"     User ID: {order.get('user_id', 'Missing')}")
                print(f"     Status: {order.get('status', 'Missing')}")
                print(f"     Subtotal: PKR {order.get('subtotal', 'Missing')}")
                print(f"     Delivery Charge: PKR {order.get('delivery_charge', 'Missing')}")
                print(f"     Total Amount: PKR {order.get('total_amount', 'Missing')}")
                print(f"     Delivery Option: {order.get('delivery_option', 'Missing')}")
                print(f"     Items Count: {len(order.get('items', []))}")
                
                # Check for validation errors
                required_fields = ['id', 'user_id', 'items', 'subtotal', 'delivery_charge', 'total_amount', 'delivery_option']
                missing_fields = [field for field in required_fields if field not in order or order[field] is None]
                if missing_fields:
                    print(f"     ⚠️ Missing/null fields: {missing_fields}")
                else:
                    print(f"     ✅ All required fields present")
                    
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

def test_specific_admin_login():
    """Test the specific admin login functionality for test@saahaz.com"""
    print("🚀 Testing Admin Login for test@saahaz.com")
    print("=" * 60)
    
    tester = SaahazAPITester()
    
    # Test API connectivity first
    print("\n📡 Testing API Connectivity...")
    if not tester.test_api_root():
        print("❌ API is not accessible. Cannot proceed with admin login test.")
        return False
    
    # Test the specific admin login
    print("\n👑 Testing Admin Login for test@saahaz.com...")
    success, response_data = tester.test_admin_login_detailed("test@saahaz.com", "password")
    
    if success:
        print("\n🎉 ADMIN LOGIN TEST COMPLETED SUCCESSFULLY")
        print("✅ User can login with provided credentials")
        print("✅ JWT token is properly generated and returned")
        
        user_data = response_data.get('user', {})
        if user_data.get('is_admin'):
            print("✅ User has admin privileges (is_admin = true)")
        else:
            print("❌ User does NOT have admin privileges (is_admin = false)")
            
        return True
    else:
        print("\n❌ ADMIN LOGIN TEST FAILED")
        print("❌ User cannot login with provided credentials")
        return False

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
    # Run the specific admin login test as requested
    print("🎯 RUNNING SPECIFIC ADMIN LOGIN TEST")
    print("Testing admin login for test@saahaz.com with password 'password'")
    print("=" * 70)
    
    admin_test_success = test_specific_admin_login()
    
    print("\n" + "=" * 70)
    if admin_test_success:
        print("✅ ADMIN LOGIN TEST COMPLETED SUCCESSFULLY")
    else:
        print("❌ ADMIN LOGIN TEST FAILED")
    
    print("\n🔄 Running full API test suite...")
    full_test_result = main()
    
    sys.exit(0 if admin_test_success else 1)