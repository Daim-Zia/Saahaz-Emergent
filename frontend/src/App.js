import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
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
  ShoppingCart as ShoppingCartIcon, 
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
              <ShoppingCartIcon className="h-5 w-5" />
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
          <ShoppingCartIcon className="mr-2 h-4 w-4" />
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
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    images: [''],
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'White'],
    inventory: '',
    featured: false
  });

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category_id: '',
      images: [''],
      sizes: ['S', 'M', 'L'],
      colors: ['Black', 'White'],
      inventory: '',
      featured: false
    });
  };

  const handleAddProduct = async () => {
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        inventory: parseInt(productForm.inventory),
        images: productForm.images.filter(img => img.trim() !== '')
      };

      const response = await axios.post(`${API}/products`, productData);
      setProducts([...products, response.data]);
      setIsAddingProduct(false);
      resetForm();
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEditProduct = async () => {
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        inventory: parseInt(productForm.inventory),
        images: productForm.images.filter(img => img.trim() !== '')
      };

      const response = await axios.put(`${API}/products/${editingProduct.id}`, productData);
      setProducts(products.map(p => p.id === editingProduct.id ? response.data : p));
      setEditingProduct(null);
      resetForm();
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`${API}/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      const updatedProduct = { ...product, featured: !product.featured };
      const response = await axios.put(`${API}/products/${product.id}`, {
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        category_id: updatedProduct.category_id,
        images: updatedProduct.images,
        sizes: updatedProduct.sizes,
        colors: updatedProduct.colors,
        inventory: updatedProduct.inventory,
        featured: updatedProduct.featured
      });
      setProducts(products.map(p => p.id === product.id ? response.data : p));
      alert(`Product ${updatedProduct.featured ? 'marked as featured' : 'unmarked as featured'}!`);
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Error updating product: ' + (error.response?.data?.detail || error.message));
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category_id: product.category_id,
      images: product.images.length > 0 ? product.images : [''],
      sizes: product.sizes,
      colors: product.colors,
      inventory: product.inventory.toString(),
      featured: product.featured
    });
  };

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
          <AdminProductCard 
            key={product.id} 
            product={product} 
            categories={categories}
            onEdit={() => startEdit(product)}
            onDelete={() => handleDeleteProduct(product.id)}
            onToggleFeatured={() => handleToggleFeatured(product)}
          />
        ))}
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddingProduct || editingProduct !== null} onOpenChange={(open) => {
        if (!open) {
          setIsAddingProduct(false);
          setEditingProduct(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <Input
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows="3"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price (PKR)</label>
                <Input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  placeholder="2500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Inventory</label>
                <Input
                  type="number"
                  value={productForm.inventory}
                  onChange={(e) => setProductForm({...productForm, inventory: e.target.value})}
                  placeholder="50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full p-2 border rounded-md"
                value={productForm.category_id}
                onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <Input
                value={productForm.images[0] || ''}
                onChange={(e) => setProductForm({...productForm, images: [e.target.value]})}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sizes (comma separated)</label>
              <Input
                value={productForm.sizes.join(', ')}
                onChange={(e) => setProductForm({...productForm, sizes: e.target.value.split(',').map(s => s.trim())})}
                placeholder="S, M, L, XL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Colors (comma separated)</label>
              <Input
                value={productForm.colors.join(', ')}
                onChange={(e) => setProductForm({...productForm, colors: e.target.value.split(',').map(c => c.trim())})}
                placeholder="Black, White, Blue"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={productForm.featured}
                onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
              />
              <label className="text-sm font-medium">Featured Product</label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={editingProduct ? handleEditProduct : handleAddProduct} className="flex-1">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
              <Button variant="outline" onClick={() => {
                setIsAddingProduct(false);
                setEditingProduct(null);
                resetForm();
              }} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Admin Categories Tab
const AdminCategoriesTab = ({ categories, setCategories }) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: ''
  });

  const resetForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      image: ''
    });
  };

  const handleAddCategory = async () => {
    try {
      const response = await axios.post(`${API}/categories`, categoryForm);
      setCategories([...categories, response.data]);
      setIsAddingCategory(false);
      resetForm();
      alert('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEditCategory = async () => {
    try {
      const response = await axios.put(`${API}/categories/${editingCategory.id}`, categoryForm);
      setCategories(categories.map(c => c.id === editingCategory.id ? response.data : c));
      setEditingCategory(null);
      resetForm();
      alert('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await axios.delete(`${API}/categories/${categoryId}`);
      setCategories(categories.filter(c => c.id !== categoryId));
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category: ' + (error.response?.data?.detail || error.message));
    }
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      image: category.image || ''
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Categories Management</h2>
        <Button onClick={() => setIsAddingCategory(true)}>
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
                <Button variant="outline" size="sm" onClick={() => startEdit(category)}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteCategory(category.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isAddingCategory || editingCategory !== null} onOpenChange={(open) => {
        if (!open) {
          setIsAddingCategory(false);
          setEditingCategory(null);
          resetForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category Name</label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                placeholder="Enter category description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <Input
                value={categoryForm.image}
                onChange={(e) => setCategoryForm({...categoryForm, image: e.target.value})}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={editingCategory ? handleEditCategory : handleAddCategory} className="flex-1">
                {editingCategory ? 'Update Category' : 'Add Category'}
              </Button>
              <Button variant="outline" onClick={() => {
                setIsAddingCategory(false);
                setEditingCategory(null);
                resetForm();
              }} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Admin Orders Tab
const AdminOrdersTab = ({ orders, setOrders }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status?status=${newStatus}`);
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));
      alert(`Order status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status: ' + (error.response?.data?.detail || error.message));
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

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
                    <td className="p-4">{order.user_id?.slice(0, 8)}...</td>
                    <td className="p-4">{order.items.length} items</td>
                    <td className="p-4 font-semibold">PKR {order.total_amount.toLocaleString()}</td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="p-1 border rounded text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm" onClick={() => viewOrderDetails(order)}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={selectedOrder !== null} onOpenChange={(open) => {
        if (!open) setSelectedOrder(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Order ID:</label>
                  <p className="font-mono text-sm">{selectedOrder.id}</p>
                </div>
                <div>
                  <label className="font-semibold">Status:</label>
                  <p className="capitalize">{selectedOrder.status}</p>
                </div>
                <div>
                  <label className="font-semibold">Total Amount:</label>
                  <p className="font-semibold text-orange-500">PKR {selectedOrder.total_amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-semibold">Payment Method:</label>
                  <p className="capitalize">{selectedOrder.payment_method}</p>
                </div>
              </div>

              <div>
                <label className="font-semibold">Delivery Address:</label>
                <p>{selectedOrder.delivery_address}</p>
              </div>

              <div>
                <label className="font-semibold">Phone:</label>
                <p>{selectedOrder.phone}</p>
              </div>

              <div>
                <label className="font-semibold">Items:</label>
                <div className="space-y-2 mt-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">Product ID: {item.product_id.slice(0, 8)}...</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                          {item.size && ` | Size: ${item.size}`}
                          {item.color && ` | Color: ${item.color}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Created: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                {selectedOrder.updated_at && (
                  <p>Updated: {new Date(selectedOrder.updated_at).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
const AdminProductCard = ({ product, categories, onEdit, onDelete, onToggleFeatured }) => {
  const category = categories.find(c => c.id === product.category_id);
  
  return (
    <Card>
      <CardContent className="p-4">
        <img src={product.images[0]} alt={product.name} className="w-full h-32 object-cover rounded mb-4" />
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{category?.name}</p>
        <p className="font-bold text-orange-500 mb-2">PKR {product.price.toLocaleString()}</p>
        <p className="text-sm mb-4">Stock: {product.inventory}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>
          <Button variant="outline" size="sm" className="text-red-600" onClick={onDelete}>Delete</Button>
          <Button 
            variant={product.featured ? "default" : "outline"} 
            size="sm" 
            onClick={onToggleFeatured}
          >
            {product.featured ? "Featured ✓" : "Mark Featured"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Product Details Component
const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart, user } = useAppContext();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API}/products/${productId}`);
        setProduct(response.data);
        setSelectedSize(response.data.sizes[0] || '');
        setSelectedColor(response.data.colors[0] || '');
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }
    addToCart(product.id, quantity, selectedSize, selectedColor);
    alert('Product added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-skeleton w-32 h-32 rounded-full mx-auto mb-4"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-lg">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-2xl font-bold text-orange-500">PKR {product.price.toLocaleString()}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Quantity</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 border rounded">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stock Info */}
            <div className="text-sm text-muted-foreground">
              {product.inventory > 0 ? (
                <span className="text-green-600">✓ In Stock ({product.inventory} available)</span>
              ) : (
                <span className="text-red-600">✗ Out of Stock</span>
              )}
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={handleAddToCart}
                disabled={product.inventory === 0}
              >
                <ShoppingCartIcon className="mr-2 h-5 w-5" />
                Add to Cart - PKR {(product.price * quantity).toLocaleString()}
              </Button>
              
              {user && (
                <Button variant="outline" size="lg" className="w-full">
                  <Heart className="mr-2 h-5 w-5" />
                  Add to Wishlist
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shopping Cart Component
const ShoppingCart = () => {
  const { cart, updateCartQuantity, removeFromCart, getCartTotal } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartProducts = async () => {
      try {
        const productPromises = cart.map(item =>
          axios.get(`${API}/products/${item.product_id}`)
        );
        const responses = await Promise.all(productPromises);
        setProducts(responses.map(response => response.data));
      } catch (error) {
        console.error('Error fetching cart products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (cart.length > 0) {
      fetchCartProducts();
    } else {
      setLoading(false);
    }
  }, [cart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-skeleton w-32 h-32 rounded-full mx-auto mb-4"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCartIcon className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-6">Add some products to get started!</p>
          <Button onClick={() => window.location.href = '/'}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => {
              const product = products.find(p => p.id === item.product_id);
              if (!product) return null;

              return (
                <Card key={`${item.product_id}-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' | '}
                          {item.color && `Color: ${item.color}`}
                        </p>
                        <p className="font-bold text-orange-500">PKR {product.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-3 py-1 border rounded">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">PKR {(product.price * item.quantity).toLocaleString()}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 mt-2"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>PKR {getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>PKR {getCartTotal().toLocaleString()}</span>
                </div>
                <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600">
                  Proceed to Checkout
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Cash on Delivery Available
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Customer Orders Component
const CustomerOrders = () => {
  const { user } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API}/orders`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="mb-4">You need to login to view your orders.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-skeleton w-32 h-32 rounded-full mx-auto mb-4"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here!</p>
            <Button onClick={() => window.location.href = '/'}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{order.id.slice(0, 8)}...</h3>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium">Items</h4>
                      <p className="text-sm text-muted-foreground">{order.items.length} items</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Total</h4>
                      <p className="text-sm font-bold text-orange-500">PKR {order.total_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Payment</h4>
                      <p className="text-sm text-muted-foreground">Cash on Delivery</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Delivery Address:</h4>
                    <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                    <p className="text-sm text-muted-foreground">Phone: {order.phone}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Customer Settings Component
const CustomerSettings = () => {
  const { user, logout } = useAppContext();
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      await axios.put(`${API}/profile`, profileForm);
      alert('Profile updated successfully!');
      setIsEditing(false);
      // Refresh user data would go here
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="mb-4">You need to login to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  value={profileForm.email}
                  disabled={true} // Email cannot be changed
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex gap-2 pt-4">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleUpdateProfile}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/orders'}>
                <Package className="mr-2 h-4 w-4" />
                View My Orders
              </Button>
              
              <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/cart'}>
                <ShoppingCartIcon className="mr-2 h-4 w-4" />
                View Shopping Cart
              </Button>

              <Separator />

              <Button variant="outline" className="w-full justify-start text-red-600" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
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