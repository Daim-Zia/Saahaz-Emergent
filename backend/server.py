from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from jwt import JWTError
from passlib.context import CryptContext
import aiohttp

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security setup
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

# Database Collections
users_collection = "users"
products_collection = "products"
orders_collection = "orders"
categories_collection = "categories"
sessions_collection = "sessions"  # For Google OAuth sessions

# Pydantic Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    is_admin: bool = False
    address: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category_id: str
    images: List[str] = []
    sizes: List[str] = []
    colors: List[str] = []
    inventory: int = 0
    featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category_id: str
    images: List[str] = []
    sizes: List[str] = []
    colors: List[str] = []
    inventory: int = 0
    featured: bool = False

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image: Optional[str] = None

class CartItem(BaseModel):
    product_id: str
    quantity: int
    size: Optional[str] = None
    color: Optional[str] = None

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem]
    subtotal: float
    delivery_charge: float
    total_amount: float
    status: str = "pending"  # pending, confirmed, shipped, delivered, cancelled
    delivery_address: str
    phone: str
    delivery_option: str = "standard"  # standard, express, next_day, free
    payment_method: str = "cod"  # cash on delivery
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GoogleUserData(BaseModel):
    id: str
    email: str
    name: str
    picture: str
    session_token: str

class OrderCreate(BaseModel):
    items: List[CartItem]
    delivery_address: str
    phone: str
    delivery_option: Optional[str] = "standard"
    delivery_charge: Optional[float] = 0
    subtotal: Optional[float] = 0
    total: Optional[float] = 0

# Helper functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_doc = await db[users_collection].find_one({"id": user_id})
        if user_doc is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Create user object (without password_hash)
        user_response = {k: v for k, v in user_doc.items() if k != 'password_hash'}
        return User(**user_response)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@api_router.get("/")
async def root():
    return {"message": "Saahaz.com API is running!"}

# Auth routes
@api_router.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db[users_collection].find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict()
    user_dict.pop('password')
    
    user = User(**user_dict)
    user_doc = user.dict()
    user_doc['password_hash'] = hashed_password
    
    await db[users_collection].insert_one(user_doc)
    
    # Create token
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user.dict()}

@api_router.post("/auth/login", response_model=dict)
async def login(user_data: UserLogin):
    # Find user by email
    user_doc = await db[users_collection].find_one({"email": user_data.email})
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check password
    if not verify_password(user_data.password, user_doc.get('password_hash', '')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # FORCE is_admin to True for m.admin - temporary fix
    user_response = {k: v for k, v in user_doc.items() if k != 'password_hash'}
    if user_response.get('email') == 'm.admin':
        user_response['is_admin'] = True
    
    user_obj = User(**user_response)
    
    token = create_access_token({"sub": user_obj.id})
    return {"access_token": token, "token_type": "bearer", "user": user_obj.dict()}

# Category routes
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db[categories_collection].find().to_list(1000)
    return [Category(**category) for category in categories]

@api_router.post("/categories", response_model=Category)
async def create_category(category_data: CategoryCreate, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    category = Category(**category_data.dict())
    await db[categories_collection].insert_one(category.dict())
    return category

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, category_data: CategoryCreate, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db[categories_collection].update_one(
        {"id": category_id}, 
        {"$set": category_data.dict()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category = await db[categories_collection].find_one({"id": category_id})
    return Category(**category)

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db[categories_collection].delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}

# Product routes
@api_router.get("/products", response_model=List[Product])
async def get_products(category_id: Optional[str] = None, featured: Optional[bool] = None):
    filter_query = {}
    if category_id:
        filter_query["category_id"] = category_id
    if featured is not None:
        filter_query["featured"] = featured
    
    products = await db[products_collection].find(filter_query).to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db[products_collection].find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    product = Product(**product_data.dict())
    await db[products_collection].insert_one(product.dict())
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    updated_product = product_data.dict()
    result = await db[products_collection].update_one(
        {"id": product_id}, 
        {"$set": updated_product}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await db[products_collection].find_one({"id": product_id})
    return Product(**product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db[products_collection].delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

# Order routes
@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    # Calculate subtotal from items
    subtotal = 0
    for item in order_data.items:
        product = await db[products_collection].find_one({"id": item.product_id})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        subtotal += product['price'] * item.quantity
    
    # Use provided values or calculate them
    delivery_charge = order_data.delivery_charge if order_data.delivery_charge is not None else 0
    total_amount = order_data.total if order_data.total else (subtotal + delivery_charge)
    
    order_dict = order_data.dict()
    order_dict['user_id'] = current_user.id
    order_dict['subtotal'] = subtotal
    order_dict['delivery_charge'] = delivery_charge
    order_dict['total_amount'] = total_amount
    
    # Remove 'total' field as it's not in Order model (we use 'total_amount')
    if 'total' in order_dict:
        del order_dict['total']
    
    order = Order(**order_dict)
    await db[orders_collection].insert_one(order.dict())
    return order

@api_router.post("/auth/google/session-data", response_model=GoogleUserData)
async def process_google_session(request: Request, response: Response):
    """Process Google OAuth session data from Emergent Auth"""
    
    # Get session ID from header
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required in X-Session-ID header")
    
    # Call Emergent Auth API to get user data
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            ) as resp:
                if resp.status != 200:
                    raise HTTPException(status_code=401, detail="Invalid session ID")
                
                user_data = await resp.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify session: {str(e)}")
    
    # Create or update user in database
    existing_user = await db[users_collection].find_one({"email": user_data["email"]})
    
    if existing_user:
        # User exists, use existing user
        user_id = existing_user["id"]
    else:
        # Create new user
        user_id = str(uuid.uuid4())
        new_user = {
            "id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "password_hash": "",  # No password for Google users
            "phone": "",
            "address": "",
            "is_admin": False,
            "created_at": datetime.now(timezone.utc)
        }
        await db[users_collection].insert_one(new_user)
    
    # Store session token in database
    session_expires = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "session_token": user_data["session_token"],
        "expires_at": session_expires,
        "created_at": datetime.now(timezone.utc)
    }
    await db[sessions_collection].insert_one(session_doc)
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=user_data["session_token"],
        max_age=7 * 24 * 60 * 60,  # 7 days
        httponly=True,
        secure=True,
        samesite="none",
        path="/"
    )
    
    return GoogleUserData(**user_data)

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user and clear session"""
    
    # Get session token from cookie or header
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if session_token:
        # Delete session from database
        await db[sessions_collection].delete_many({"session_token": session_token})
    
    # Clear cookie
    response.delete_cookie(
        key="session_token",
        path="/",
        samesite="none"
    )
    
    return {"message": "Logged out successfully"}

# Updated authentication helper to check session tokens
async def get_current_user_with_session(request: Request) -> User:
    """Get current user from JWT token or session token"""
    
    # First try to get session token from cookie
    session_token = request.cookies.get("session_token")
    
    if session_token:
        # Check session token
        session_doc = await db[sessions_collection].find_one({
            "session_token": session_token,
            "expires_at": {"$gt": datetime.now(timezone.utc)}
        })
        
        if session_doc:
            # Get user from session
            user_doc = await db[users_collection].find_one({"id": session_doc["user_id"]})
            if user_doc:
                user_response = {k: v for k, v in user_doc.items() if k != 'password_hash'}
                return User(**user_response)
    
    # Fallback to JWT token
    try:
        # Try to get JWT token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        token = auth_header.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_doc = await db[users_collection].find_one({"id": user_id})
        if not user_doc:
            raise HTTPException(status_code=401, detail="User not found")
        
        user_response = {k: v for k, v in user_doc.items() if k != 'password_hash'}
        return User(**user_response)
        
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: User = Depends(get_current_user)):
    if current_user.is_admin:
        orders = await db[orders_collection].find().to_list(1000)
    else:
        orders = await db[orders_collection].find({"user_id": current_user.id}).to_list(1000)
    
    return [Order(**order) for order in orders]

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db[orders_collection].update_one(
        {"id": order_id}, 
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated successfully"}

# User profile routes
@api_router.get("/profile", response_model=User)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.put("/profile", response_model=User)
async def update_profile(user_data: dict, current_user: User = Depends(get_current_user)):
    allowed_fields = ['name', 'address', 'phone']
    update_data = {k: v for k, v in user_data.items() if k in allowed_fields}
    
    result = await db[users_collection].update_one(
        {"id": current_user.id}, 
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await db[users_collection].find_one({"id": current_user.id})
    return User(**updated_user)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()