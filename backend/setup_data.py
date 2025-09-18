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

# Sample data
categories_data = [
    {
        "id": "cat_1",
        "name": "Shirts",
        "description": "Stylish shirts for every occasion",
        "image": "https://images.unsplash.com/photo-1562157873-818bc0726f68?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85"
    },
    {
        "id": "cat_2",
        "name": "Pants",
        "description": "Comfortable and trendy pants",
        "image": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw0fHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85"
    },
    {
        "id": "cat_3",
        "name": "Accessories",
        "description": "Complete your look with premium accessories",
        "image": "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85"
    }
]

products_data = [
    {
        "id": "prod_1",
        "name": "Classic Cotton Shirt",
        "description": "Premium cotton shirt perfect for any occasion. Made with high-quality breathable fabric.",
        "price": 2500,
        "category_id": "cat_1",
        "images": [
            "https://images.unsplash.com/photo-1562157873-818bc0726f68?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85",
            "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw0fHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85"
        ],
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": ["White", "Blue", "Black", "Navy"],
        "inventory": 50,
        "featured": True
    },
    {
        "id": "prod_2",
        "name": "Slim Fit Denim Jeans",
        "description": "Comfortable slim-fit denim jeans with premium stretch fabric for all-day comfort.",
        "price": 3500,
        "category_id": "cat_2",
        "images": [
            "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw0fHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85",
            "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85"
        ],
        "sizes": ["28", "30", "32", "34", "36"],
        "colors": ["Blue", "Black", "Dark Blue"],
        "inventory": 30,
        "featured": True
    },
    {
        "id": "prod_3",
        "name": "Premium Leather Wallet",
        "description": "Genuine leather wallet with multiple compartments for cards and cash. Crafted with precision.",
        "price": 1500,
        "category_id": "cat_3",
        "images": [
            "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85"
        ],
        "sizes": ["One Size"],
        "colors": ["Brown", "Black", "Tan"],
        "inventory": 25,
        "featured": False
    },
    {
        "id": "prod_4",
        "name": "Formal Dress Shirt",
        "description": "Elegant formal dress shirt perfect for office and special occasions. Wrinkle-resistant fabric.",
        "price": 3200,
        "category_id": "cat_1",
        "images": [
            "https://images.unsplash.com/photo-1562157873-818bc0726f68?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85"
        ],
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["White", "Light Blue", "Pink"],
        "inventory": 40,
        "featured": True
    },
    {
        "id": "prod_5",
        "name": "Cargo Pants",
        "description": "Versatile cargo pants with multiple pockets. Perfect for casual and outdoor activities.",
        "price": 2800,
        "category_id": "cat_2",
        "images": [
            "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw0fHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85"
        ],
        "sizes": ["30", "32", "34", "36", "38"],
        "colors": ["Khaki", "Olive", "Black"],
        "inventory": 35,
        "featured": False
    },
    {
        "id": "prod_6",
        "name": "Designer Watch",
        "description": "Stylish designer watch with premium materials. Perfect accessory for any outfit.",
        "price": 4500,
        "category_id": "cat_3",
        "images": [
            "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85"
        ],
        "sizes": ["One Size"],
        "colors": ["Silver", "Gold", "Black"],
        "inventory": 15,
        "featured": True
    }
]

async def setup_initial_data():
    """Setup initial categories and products"""
    try:
        # Clear existing data
        await db.categories.delete_many({})
        await db.products.delete_many({})
        
        # Insert categories
        await db.categories.insert_many(categories_data)
        print(f"Inserted {len(categories_data)} categories")
        
        # Insert products
        await db.products.insert_many(products_data)
        print(f"Inserted {len(products_data)} products")
        
        print("Initial data setup completed successfully!")
        
    except Exception as e:
        print(f"Error setting up data: {e}")

if __name__ == "__main__":
    asyncio.run(setup_initial_data())