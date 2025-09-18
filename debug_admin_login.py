#!/usr/bin/env python3

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import bcrypt
from passlib.context import CryptContext
import requests
import json

# Load environment variables
ROOT_DIR = Path(__file__).parent / "backend"
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def check_database_users():
    """Check what users exist in the database"""
    print("🔍 CHECKING DATABASE USERS")
    print("=" * 50)
    
    users_collection = "users"
    users = await db[users_collection].find().to_list(1000)
    
    print(f"Found {len(users)} users in database:")
    print()
    
    for i, user in enumerate(users, 1):
        print(f"{i}. Email: {user.get('email', 'N/A')}")
        print(f"   Name: {user.get('name', 'N/A')}")
        print(f"   Is Admin: {user.get('is_admin', False)}")
        print(f"   ID: {user.get('id', 'N/A')}")
        print(f"   Has Password Hash: {'Yes' if user.get('password_hash') else 'No'}")
        if user.get('password_hash'):
            print(f"   Password Hash: {user.get('password_hash')[:50]}...")
        print(f"   Created At: {user.get('created_at', 'N/A')}")
        print()
    
    return users

async def test_password_verification(email, test_passwords):
    """Test different passwords for a user"""
    print(f"🔐 TESTING PASSWORDS FOR {email}")
    print("=" * 50)
    
    users_collection = "users"
    user = await db[users_collection].find_one({"email": email})
    
    if not user:
        print(f"❌ User {email} not found in database")
        return False
    
    print(f"✅ User found: {user.get('name', 'Unknown')}")
    print(f"   Is Admin: {user.get('is_admin', False)}")
    
    stored_hash = user.get('password_hash', '')
    if not stored_hash:
        print("❌ No password hash stored for this user")
        return False
    
    print(f"   Stored Hash: {stored_hash[:50]}...")
    print()
    
    for password in test_passwords:
        print(f"Testing password: '{password}'")
        try:
            is_valid = pwd_context.verify(password, stored_hash)
            if is_valid:
                print(f"✅ PASSWORD MATCH! '{password}' is correct")
                return True
            else:
                print(f"❌ Password '{password}' is incorrect")
        except Exception as e:
            print(f"❌ Error verifying password '{password}': {str(e)}")
    
    print("❌ None of the tested passwords are correct")
    return False

async def create_test_admin_user():
    """Create a test admin user with known credentials"""
    print("👑 CREATING TEST ADMIN USER")
    print("=" * 50)
    
    users_collection = "users"
    
    # Check if test@saahaz.com already exists
    existing_user = await db[users_collection].find_one({"email": "test@saahaz.com"})
    
    if existing_user:
        print("✅ test@saahaz.com already exists")
        print("   Updating to ensure admin privileges and correct password...")
        
        # Hash the password 'password'
        hashed_password = pwd_context.hash("password")
        
        # Update the user
        result = await db[users_collection].update_one(
            {"email": "test@saahaz.com"},
            {
                "$set": {
                    "password_hash": hashed_password,
                    "is_admin": True,
                    "name": "Test Admin User"
                }
            }
        )
        
        if result.modified_count > 0:
            print("✅ User updated successfully")
            return True
        else:
            print("❌ Failed to update user")
            return False
    else:
        print("Creating new test@saahaz.com user...")
        
        # Create new admin user
        import uuid
        from datetime import datetime, timezone
        
        hashed_password = pwd_context.hash("password")
        
        new_user = {
            "id": str(uuid.uuid4()),
            "email": "test@saahaz.com",
            "name": "Test Admin User",
            "password_hash": hashed_password,
            "is_admin": True,
            "address": "Test Address",
            "phone": "+92 300 1234567",
            "created_at": datetime.now(timezone.utc)
        }
        
        result = await db[users_collection].insert_one(new_user)
        
        if result.inserted_id:
            print("✅ New admin user created successfully")
            return True
        else:
            print("❌ Failed to create new user")
            return False

def test_api_login(email, password):
    """Test login via API"""
    print(f"🌐 TESTING API LOGIN FOR {email}")
    print("=" * 50)
    
    api_url = "https://clothing-shop-15.preview.emergentagent.com/api"
    login_data = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(
            f"{api_url}/auth/login",
            json=login_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ LOGIN SUCCESSFUL!")
            print(f"   Access Token: {data.get('access_token', 'Not found')[:30]}...")
            
            user_data = data.get('user', {})
            print(f"   User ID: {user_data.get('id', 'Not found')}")
            print(f"   Email: {user_data.get('email', 'Not found')}")
            print(f"   Name: {user_data.get('name', 'Not found')}")
            print(f"   Is Admin: {user_data.get('is_admin', 'Not found')}")
            
            return True, data
        else:
            print("❌ LOGIN FAILED")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"   Raw response: {response.text}")
            
            return False, {}
            
    except Exception as e:
        print(f"❌ API request failed: {str(e)}")
        return False, {}

async def main():
    print("🚀 DEBUGGING ADMIN LOGIN FOR test@saahaz.com")
    print("=" * 70)
    
    # Step 1: Check what users exist
    users = await check_database_users()
    
    # Step 2: Test different passwords for test@saahaz.com
    test_passwords = [
        "password",
        "Password",
        "PASSWORD", 
        "password123",
        "Password123",
        "admin",
        "admin123",
        "test123",
        "saahaz123"
    ]
    
    password_found = await test_password_verification("test@saahaz.com", test_passwords)
    
    if not password_found:
        print("\n🔧 PASSWORD NOT FOUND - CREATING/UPDATING ADMIN USER")
        success = await create_test_admin_user()
        
        if success:
            print("\n🧪 TESTING API LOGIN AFTER UPDATE")
            api_success, api_data = test_api_login("test@saahaz.com", "password")
            
            if api_success:
                print("\n🎉 FINAL RESULT: ADMIN LOGIN WORKING!")
                print("✅ User: test@saahaz.com")
                print("✅ Password: password")
                print("✅ Admin privileges: True")
                print("✅ JWT token generated successfully")
            else:
                print("\n❌ FINAL RESULT: API LOGIN STILL FAILING")
        else:
            print("\n❌ FAILED TO CREATE/UPDATE ADMIN USER")
    else:
        print("\n🧪 TESTING API LOGIN WITH FOUND PASSWORD")
        api_success, api_data = test_api_login("test@saahaz.com", "password")
        
        if api_success:
            print("\n🎉 FINAL RESULT: ADMIN LOGIN WORKING!")
        else:
            print("\n❌ FINAL RESULT: API LOGIN FAILING DESPITE CORRECT PASSWORD")
    
    # Close database connection
    client.close()

if __name__ == "__main__":
    asyncio.run(main())