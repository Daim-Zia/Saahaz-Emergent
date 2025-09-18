import requests
import sys
import json
from datetime import datetime

class OrderTester:
    def __init__(self, base_url="https://clothing-shop-15.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.user_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Use appropriate token
        if use_admin and self.admin_token:
            headers['Authorization'] = f'Bearer {self.admin_token}'
        elif self.user_token:
            headers['Authorization'] = f'Bearer {self.user_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

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

    def test_order_creation(self):
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

    def test_user_orders(self):
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

    def test_admin_orders(self):
        """Test admin getting all orders"""
        if not self.admin_token:
            print("❌ No admin token available for admin orders test")
            return False
            
        success, response = self.run_test("Admin Get All Orders", "GET", "orders", 200, use_admin=True)
        if success and isinstance(response, list):
            print(f"   Admin found {len(response)} total orders")
            
            # Validate order structure for first few orders
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

def test_comprehensive_order_functionality():
    """Test order placement and retrieval functionality comprehensively"""
    print("🛒 COMPREHENSIVE ORDER FUNCTIONALITY TESTING")
    print("=" * 60)
    
    tester = OrderTester()
    
    # Test API connectivity
    print("\n📡 Step 1: Testing API Connectivity...")
    success, _ = tester.run_test("API Root", "GET", "", 200)
    if not success:
        print("❌ API is not accessible. Cannot proceed with order tests.")
        return False

    # Create test user
    print("\n👤 Step 2: Creating Test User...")
    test_email = f"order_test_user_{datetime.now().strftime('%H%M%S')}@saahaz.com"
    test_password = "OrderTest123!"
    
    user_data = {
        "email": test_email,
        "password": test_password,
        "name": "Order Test User",
        "address": "Test Address, Lahore",
        "phone": "+92 300 1234567"
    }
    
    success, response = tester.run_test("User Registration", "POST", "auth/register", 200, user_data)
    if not success:
        print("❌ User registration failed. Cannot proceed with order tests.")
        return False
    
    tester.user_token = response.get('access_token')
    print(f"   User token received: {tester.user_token[:20]}...")

    # Test order creation
    print("\n📦 Step 3: Testing Order Creation...")
    order_creation_success = tester.test_order_creation()
    if not order_creation_success:
        print("❌ Order creation failed")
        return False

    # Test user order retrieval
    print("\n📋 Step 4: Testing User Order Retrieval...")
    user_orders_success = tester.test_user_orders()
    if not user_orders_success:
        print("❌ User order retrieval failed")
        return False

    # Test admin authentication
    print("\n👑 Step 5: Testing Admin Authentication...")
    admin_login_success = False
    
    # Try different admin accounts
    admin_accounts = [
        ("m.admin@saahaz.com", "password"),
        ("m.admin@saahaz.com", "admin123"),
        ("test@saahaz.com", "password")
    ]
    
    for email, password in admin_accounts:
        print(f"   Trying {email}...")
        login_data = {"email": email, "password": password}
        success, response = tester.run_test(f"Admin Login ({email})", "POST", "auth/login", 200, login_data)
        
        if success and response.get('user', {}).get('is_admin'):
            tester.admin_token = response.get('access_token')
            admin_login_success = True
            print(f"   ✅ Admin login successful for {email}")
            break
        elif success:
            print(f"   ⚠️ Login successful but user is not admin: {email}")
        else:
            print(f"   ❌ Login failed for {email}")

    # Test admin order retrieval
    admin_orders_success = False
    if admin_login_success:
        print("\n🔍 Step 6: Testing Admin Order Retrieval...")
        admin_orders_success = tester.test_admin_orders()
    else:
        print("\n⚠️ Step 6: Skipping Admin Order Retrieval (no admin access)")

    # Create additional test order
    print("\n📦 Step 7: Creating Additional Test Order...")
    additional_order_success = tester.test_order_creation()
    if additional_order_success:
        print("✅ Additional order created successfully")

    # Final verification
    if admin_login_success:
        print("\n🔍 Step 8: Final Admin Order Count Verification...")
        tester.test_admin_orders()

    # Results summary
    print("\n" + "=" * 60)
    print("📊 ORDER FUNCTIONALITY TEST RESULTS:")
    print(f"✅ API Connectivity: Working")
    print(f"✅ User Registration: Working") 
    print(f"{'✅' if order_creation_success else '❌'} Order Creation: {'Working' if order_creation_success else 'Failed'}")
    print(f"{'✅' if user_orders_success else '❌'} User Order Retrieval: {'Working' if user_orders_success else 'Failed'}")
    print(f"{'✅' if admin_login_success else '⚠️'} Admin Authentication: {'Working' if admin_login_success else 'No admin access available'}")
    print(f"{'✅' if admin_orders_success else '⚠️'} Admin Order Retrieval: {'Working' if admin_orders_success else 'Skipped (no admin access)'}")
    
    # Determine overall success - admin functionality is optional for this test
    core_functionality_success = all([
        order_creation_success,
        user_orders_success
    ])
    
    if core_functionality_success:
        print("\n🎉 CORE ORDER FUNCTIONALITY TESTS PASSED!")
        if admin_login_success and admin_orders_success:
            print("🎉 ADMIN ORDER FUNCTIONALITY ALSO WORKING!")
        elif not admin_login_success:
            print("⚠️ Admin functionality could not be tested (no admin credentials)")
        return True
    else:
        print("\n❌ CORE ORDER FUNCTIONALITY TESTS FAILED!")
        return False

if __name__ == "__main__":
    print("🎯 RUNNING COMPREHENSIVE ORDER FUNCTIONALITY TEST")
    print("Testing order placement and retrieval functionality")
    print("=" * 70)
    
    success = test_comprehensive_order_functionality()
    
    print("\n" + "=" * 70)
    if success:
        print("✅ ORDER FUNCTIONALITY TEST COMPLETED SUCCESSFULLY")
    else:
        print("❌ ORDER FUNCTIONALITY TEST FAILED")
    
    sys.exit(0 if success else 1)