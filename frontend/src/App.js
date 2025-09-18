import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import Shadcn components
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Separator } from './components/ui/separator';

// Import Lucide React icons
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X,
  Heart,
  Star,
  Plus,
  Minus,
  Truck,
  Shield,
  ArrowRight,
  Package,
  Settings,
  LogOut
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Context for authentication and cart
const AppContext = createContext();

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Mock data for initial display
const mockCategories = [
  { id: '1', name: 'Shirts', description: 'Stylish shirts for every occasion', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85' },
  { id: '2', name: 'Pants', description: 'Comfortable and trendy pants', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw0fHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85' },
  { id: '3', name: 'Accessories', description: 'Complete your look', image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85' }
];

const mockProducts = [
  {
    id: '1',
    name: 'Classic Cotton Shirt',
    description: 'Premium cotton shirt perfect for any occasion',
    price: 2500,
    category_id: '1',
    images: ['https://images.unsplash.com/photo-1562157873-818bc0726f68?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Blue', 'Black'],
    inventory: 50,
    featured: true
  },
  {
    id: '2',
    name: 'Denim Jeans',
    description: 'Comfortable slim-fit denim jeans',
    price: 3500,
    category_id: '2',
    images: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw0fHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85'],
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Blue', 'Black'],
    inventory: 30,
    featured: true
  },
  {
    id: '3',
    name: 'Leather Wallet',
    description: 'Genuine leather wallet with multiple compartments',
    price: 1500,
    category_id: '3',
    images: ['https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85'],
    sizes: ['One Size'],
    colors: ['Brown', 'Black'],
    inventory: 25,
    featured: false
  }
];

// Header Component
const Header = ({ onMenuClick, cartCount }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAppContext();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="md:hidden mr-2" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Saahaz.com
            </h1>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a href="/" className="transition-colors hover:text-orange-500">Home</a>
            <a href="/products" className="transition-colors hover:text-orange-500">Products</a>
            <a href="/categories" className="transition-colors hover:text-orange-500">Categories</a>
            <a href="/about" className="transition-colors hover:text-orange-500">About</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {user ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Account</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Separator />
                    <Button variant="outline" className="w-full justify-start">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">Login</Button>
                </DialogTrigger>
                <DialogContent>
                  <AuthDialog />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

// Auth Dialog Component
const AuthDialog = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    address: '',
    phone: ''
  });
  const { login, register } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>{isLogin ? 'Login' : 'Register'}</DialogTitle>
        <DialogDescription>
          {isLogin ? 'Welcome back to Saahaz.com' : 'Create your account to start shopping'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {!isLogin && (
          <Input
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        )}
        
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        
        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />

        {!isLogin && (
          <>
            <Input
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <Input
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </>
        )}

        <Button type="submit" className="w-full">
          {isLogin ? 'Login' : 'Register'}
        </Button>

        <p className="text-center text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="text-orange-500 hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </form>
    </div>
  );
};

// Hero Section Component
const HeroSection = () => {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxmYXNoaW9ufGVufDB8fHx8MTc1ODA1OTk4NHww&ixlib=rb-4.1.0&q=85')`
        }}
      />
      
      <div className="relative z-10 text-center text-white max-w-4xl px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Fashion That Speaks
          <span className="block text-orange-400">Your Language</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Discover premium apparel that defines your style. From casual elegance to formal sophistication.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
            Shop Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-black px-8 py-3">
            Explore Collections
          </Button>
        </div>
      </div>
    </section>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useAppContext();

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images[selectedImage] || product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full bg-white/80 hover:bg-white">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        {product.featured && (
          <Badge className="absolute top-4 left-4 bg-orange-500">
            Featured
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-orange-500 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-orange-500">
            PKR {product.price.toLocaleString()}
          </span>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
            ))}
            <span className="text-sm text-muted-foreground ml-1">(4.5)</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {product.sizes.slice(0, 4).map((size) => (
            <Badge key={size} variant="outline" className="text-xs">
              {size}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600" 
          onClick={() => addToCart(product.id, 1)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

// Categories Section Component
const CategoriesSection = ({ categories }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collections designed for every style and occasion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Card key={category.id} className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm opacity-90">{category.description}</p>
                  <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Featured Products Section
const FeaturedProductsSection = ({ products }) => {
  const featuredProducts = products.filter(product => product.featured);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked favorites that define contemporary fashion
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Products
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: <Truck className="h-8 w-8 text-orange-500" />,
      title: "Free Delivery",
      description: "Cash on Delivery available across Pakistan"
    },
    {
      icon: <Shield className="h-8 w-8 text-orange-500" />,
      title: "Quality Guarantee",
      description: "Premium materials and craftsmanship"
    },
    {
      icon: <Package className="h-8 w-8 text-orange-500" />,
      title: "Easy Returns",
      description: "7-day return policy for your peace of mind"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Saahaz?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.is_admin) {
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes, ordersRes] = await Promise.all([
          axios.get(`${API}/products`),
          axios.get(`${API}/categories`),
          axios.get(`${API}/orders`)
        ]);
        
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setOrders(ordersRes.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="mb-4">Please login to access the admin dashboard.</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Login</Button>
              </DialogTrigger>
              <DialogContent>
                <AuthDialog />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
            <p>You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-skeleton w-32 h-32 rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your e-commerce platform</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-8">
            <AdminProductsTab products={products} setProducts={setProducts} categories={categories} />
          </TabsContent>

          <TabsContent value="categories" className="mt-8">
            <AdminCategoriesTab categories={categories} setCategories={setCategories} />
          </TabsContent>

          <TabsContent value="orders" className="mt-8">
            <AdminOrdersTab orders={orders} setOrders={setOrders} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-8">
            <AdminAnalyticsTab products={products} orders={orders} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Admin Products Tab
const AdminProductsTab = ({ products, setProducts, categories }) => {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products Management</h2>
        <Button onClick={() => setIsAddingProduct(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <AdminProductCard key={product.id} product={product} categories={categories} />
        ))}
      </div>

      {/* Add Product Dialog would go here */}
    </div>
  );
};

// Admin Categories Tab
const AdminCategoriesTab = ({ categories, setCategories }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Categories Management</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <img src={category.image} alt={category.name} className="w-full h-32 object-cover rounded mb-4" />
              <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm" className="text-red-600">Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Admin Orders Tab
const AdminOrdersTab = ({ orders, setOrders }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders Management</h2>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-2xl font-bold text-orange-500">{orders.length}</h3>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-2xl font-bold text-green-500">
                  {orders.filter(o => o.status === 'confirmed').length}
                </h3>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-2xl font-bold text-blue-500">
                  {orders.filter(o => o.status === 'shipped').length}
                </h3>
                <p className="text-sm text-muted-foreground">Shipped</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-2xl font-bold text-purple-500">
                  PKR {orders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString()}
                </h3>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Order ID</th>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Items</th>
                  <th className="text-left p-4">Total</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b">
                    <td className="p-4 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                    <td className="p-4">{order.user_id}</td>
                    <td className="p-4">{order.items.length} items</td>
                    <td className="p-4 font-semibold">PKR {order.total_amount.toLocaleString()}</td>
                    <td className="p-4">
                      <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Analytics Tab
const AdminAnalyticsTab = ({ products, orders }) => {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Analytics & Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">
              PKR {totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{totalOrders}</div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">{totalProducts}</div>
            <p className="text-sm text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">
              PKR {Math.round(avgOrderValue).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Avg Order Value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{order.items.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">PKR {order.total_amount.toLocaleString()}</p>
                    <Badge variant="secondary">{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.filter(p => p.featured).slice(0, 5).map(product => (
                <div key={product.id} className="flex justify-between items-center p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">Stock: {product.inventory}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">PKR {product.price.toLocaleString()}</p>
                    {product.featured && <Badge>Featured</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Admin Product Card
const AdminProductCard = ({ product, categories }) => {
  const category = categories.find(c => c.id === product.category_id);
  
  return (
    <Card>
      <CardContent className="p-4">
        <img src={product.images[0]} alt={product.name} className="w-full h-32 object-cover rounded mb-4" />
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{category?.name}</p>
        <p className="font-bold text-orange-500 mb-2">PKR {product.price.toLocaleString()}</p>
        <p className="text-sm mb-4">Stock: {product.inventory}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Edit</Button>
          <Button variant="outline" size="sm" className="text-red-600">Delete</Button>
          {product.featured && <Badge>Featured</Badge>}
        </div>
      </CardContent>
    </Card>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-orange-400">Saahaz.com</h3>
            <p className="text-gray-400 mb-4">
              Your premium destination for contemporary fashion in Pakistan.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/about" className="hover:text-orange-400 transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-orange-400 transition-colors">Contact</a></li>
              <li><a href="/shipping" className="hover:text-orange-400 transition-colors">Shipping Info</a></li>
              <li><a href="/returns" className="hover:text-orange-400 transition-colors">Returns</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/shirts" className="hover:text-orange-400 transition-colors">Shirts</a></li>
              <li><a href="/pants" className="hover:text-orange-400 transition-colors">Pants</a></li>
              <li><a href="/accessories" className="hover:text-orange-400 transition-colors">Accessories</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <div className="text-gray-400 space-y-2">
              <p>Email: info@saahaz.com</p>
              <p>Phone: +92 XXX XXXXXXX</p>
              <p>Address: Lahore, Pakistan</p>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />
        
        <div className="text-center text-gray-400">
          <p>&copy; 2024 Saahaz.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Home Component
const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await axios.get(`${API}/categories`);
        setCategories(categoriesResponse.data);
        
        // Fetch featured products
        const productsResponse = await axios.get(`${API}/products?featured=true`);
        setProducts(productsResponse.data);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fall back to mock data if API fails
        setCategories(mockCategories);
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-skeleton w-32 h-32 rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Loading Saahaz.com...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroSection />
      <CategoriesSection categories={categories} />
      <FeaturedProductsSection products={products} />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

// App Provider Component
const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auth functions
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/auth/register`, userData);
      const { access_token, user: newUser } = response.data;
      
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(newUser);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setCart([]);
  };

  // Cart functions
  const addToCart = (productId, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product_id === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product_id: productId, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product_id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = mockProducts.find(p => p.id === item.product_id);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  // Initialize auth from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // In a real app, you'd validate the token with the backend
    }
  }, []);

  const value = {
    user,
    cart,
    loading,
    login,
    register,
    logout,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    cartCount: cart.reduce((total, item) => total + item.quantity, 0)
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Main App Component
function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AppProvider>
      <div className="App">
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </div>
    </AppProvider>
  );
}

// App Content Component (to access context)
const AppContent = () => {
  const { cartCount } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <Header 
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        cartCount={cartCount}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* Add more routes as needed */}
      </Routes>
    </>
  );
};

export default App;