import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def create_admin_user():
    """Make the test user an admin"""
    try:
        # Update the test user to be admin
        result = await db.users.update_one(
            {"email": "test@saahaz.com"},
            {"$set": {"is_admin": True}}
        )
        
        if result.modified_count > 0:
            print("✅ User test@saahaz.com is now an admin")
        else:
            print("❌ User not found or already admin")
            
        # Verify the change
        user = await db.users.find_one({"email": "test@saahaz.com"})
        if user:
            print(f"User status: is_admin = {user.get('is_admin', False)}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(create_admin_user())