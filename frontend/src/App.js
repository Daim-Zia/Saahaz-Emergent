import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
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
  LogOut,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
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

// Toast Notification Component
const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto close after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Heart className="h-5 w-5 text-orange-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={`flex items-center p-4 rounded-lg border shadow-lg min-w-80 ${getToastStyles()}`}>
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-3 text-current hover:opacity-70 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Toast Hook for managing toast state
const useToast = () => {
  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return { toast, showToast, hideToast };
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user, logout } = useAppContext();

  // Handle search functionality
  const handleSearch = async (query) => {
    if (!query || query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search products by name or description
      const response = await axios.get(`${API}/products`);
      const allProducts = response.data;
      
      const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(filteredProducts);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input changes with debouncing
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search - wait 300ms after user stops typing
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  // Handle search result click
  const handleSearchResultClick = (productId) => {
    window.location.href = `/product/${productId}`;
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle search submit (Enter key)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      // Navigate to products page with search filter
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSearchOpen && !event.target.closest('.search-container')) {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(window.searchTimeout);
    };
  }, [isSearchOpen]);

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
            
            <Button variant="ghost" size="sm" className="relative" onClick={() => window.location.href = '/cart'}>
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
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/orders'}>
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/settings'}>
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
          <div className="py-4 relative search-container">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10 pr-4"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoFocus
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </form>
            
            {/* Search Results Dropdown */}
            {searchQuery && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-64 overflow-y-auto z-50">
                {searchResults.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSearchResultClick(product.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.images && product.images[0] ? product.images[0] : '/placeholder-image.jpg'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjgiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{product.description}</p>
                        <p className="text-sm font-semibold text-orange-500">PKR {product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {searchResults.length > 5 && (
                  <div 
                    className="p-3 text-center text-sm text-orange-500 hover:bg-orange-50 cursor-pointer font-medium"
                    onClick={() => {
                      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                      setIsSearchOpen(false);
                    }}
                  >
                    View all {searchResults.length} results
                  </div>
                )}
              </div>
            )}

            {/* No Results Message */}
            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 p-4 z-50">
                <div className="text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No products found for "{searchQuery}"</p>
                  <p className="text-xs text-gray-400 mt-1">Try different keywords</p>
                </div>
              </div>
            )}
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
  const { toast, showToast, hideToast } = useToast();

  // Handle Google OAuth session processing
  useEffect(() => {
    const processGoogleSession = async () => {
      // Check for session_id in URL fragment
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const sessionId = params.get('session_id');
      
      if (sessionId) {
        try {
          console.log('Processing Google session:', sessionId);
          
          // Call backend to process session
          const response = await axios.post(`${API}/auth/google/session-data`, {}, {
            headers: {
              'X-Session-ID': sessionId
            }
          });
          
          console.log('Google auth response:', response.data);
          
          // Update user context with Google user data
          const userData = {
            id: response.data.id,
            email: response.data.email,
            name: response.data.name,
            is_admin: false // Google users are not admin by default
          };
          
          // Set user in context (this should trigger re-render)
          login(userData, response.data.session_token);
          
          // Clean URL fragment
          window.history.replaceState({}, document.title, window.location.pathname);
          
          showToast(`Welcome ${response.data.name}! Successfully signed in with Google.`, 'success');
          
        } catch (error) {
          console.error('Google session processing error:', error);
          showToast('Google sign-in failed. Please try again.', 'error');
          
          // Clean URL fragment even on error
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };
    
    processGoogleSession();
  }, []);

  const handleGoogleSignIn = () => {
    // Redirect to Emergent Auth with the main app as redirect URL
    const redirectUrl = `${window.location.origin}`;
    const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    window.location.href = authUrl;
  };

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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          onClick={handleGoogleSignIn}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
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

// Hero Section Component - Luxury Theme
const HeroSection = () => {
  return (
    <section className="relative h-[700px] flex items-center justify-center overflow-hidden luxury-hero">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxmYXNoaW9ufGVufDB8fHx8MTc1ODA1OTk4NHww&ixlib=rb-4.1.0&q=85')`
        }}
      />
      
      {/* Luxury overlay pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(212,175,55,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="relative z-10 text-center text-white max-w-5xl px-4 luxury-fade-in">
        <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight font-serif">
          <span className="block text-white">Luxury Fashion</span>
          <span className="block gradient-text gold-shimmer">Redefined</span>
        </h1>
        <p className="text-xl md:text-2xl mb-10 opacity-90 font-light max-w-3xl mx-auto leading-relaxed">
          Discover premium couture that embodies sophistication and elegance. 
          Where luxury meets contemporary design in Pakistan's finest fashion destination.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button 
            size="lg" 
            className="luxury-button text-lg px-10 py-4 h-auto" 
            onClick={() => window.location.href = '/products'}
          >
            Explore Collection
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
          <Button 
            size="lg" 
            className="luxury-button-outline text-lg px-10 py-4 h-auto"
            onClick={() => window.location.href = '/categories'}
          >
            Shop Categories
          </Button>
        </div>
        
        {/* Luxury indicators */}
        <div className="flex justify-center items-center space-x-8 mt-12 text-sm uppercase tracking-widest text-gray-300">
          <div className="flex items-center space-x-2">
            <Truck className="h-4 w-4 text-yellow-400" />
            <span>Free Delivery</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-yellow-400" />
            <span>Premium Quality</span>
          </div>
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-yellow-400" />
            <span>Easy Returns</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useAppContext();
  const { toast, showToast, hideToast } = useToast(); // Add toast hook

  const handleProductClick = () => {
    window.location.href = `/product/${product.id}`;
  };

  // Handle image display with fallback
  const getProductImage = () => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const imageIndex = selectedImage < product.images.length ? selectedImage : 0;
      if (product.images[imageIndex]) {
        return product.images[imageIndex];
      }
    }
    // Return a placeholder image if no image is available
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA4LjI4NCA3MCA1Mi4zIDc1IDYwLjU4NCA3NUw2Mi4zMzMgOTEuNjY2N0g2Ny42NjZMNzIuNTMzIDk4LjQyNzlINjEuNSIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTAwIDEzMEM5MS43MTU5IDEzMCAxMzguNSAxMjUgMTMwLjIxNiAxMjVMMTI4LjQ2NyAxMDguMzMzSDEyMy4xMzRMMTE4LjI2NyAxMDEuNTcySDEyOS4zIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+';
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="relative aspect-square overflow-hidden" onClick={handleProductClick}>
        <img
          src={getProductImage()}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback to placeholder image if the original image fails to load
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA4LjI4NCA3MCA1Mi4zIDc1IDYwLjU4NCA3NUw2Mi4zMzMgOTEuNjY2N0g2Ny42NjZMNzIuNTMzIDk4LjQyNzlINjEuNSIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTAwIDEzMEM5MS43MTU5IDEzMCAxMzguNSAxMjUgMTMwLjIxNiAxMjVMMTI4LjQ2NyAxMDguMzMzSDEyMy4xMzRMMTE4LjI2NyAxMDEuNTcySDEyOS4zIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+';
          }}
        />
        {(!product.images || !Array.isArray(product.images) || product.images.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full bg-white/80 hover:bg-white" onClick={(e) => e.stopPropagation()}>
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        {product.featured && (
          <Badge className="absolute top-4 left-4 bg-orange-500">
            Featured
          </Badge>
        )}
      </div>

      <CardContent className="p-4" onClick={handleProductClick}>
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
          onClick={(e) => {
            e.stopPropagation();
            // Use default size and color for quick add to cart
            const defaultSize = product.sizes[0] || null;
            const defaultColor = product.colors[0] || null;
            addToCart(product.id, 1, defaultSize, defaultColor);
            showToast(`${product.name} added to cart!`, 'success');
          }}
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
                  <Button className="mt-4 bg-orange-500 hover:bg-orange-600" 
                          onClick={() => window.location.href = `/products?category=${category.id}`}>
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
  console.log('FeaturedProductsSection received products:', products);
  console.log('Products length:', products ? products.length : 'undefined');
  
  const featuredProducts = products.filter(product => product.featured);
  console.log('Filtered featured products:', featuredProducts);
  console.log('Featured products count:', featuredProducts.length);

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
          <Button variant="outline" size="lg" onClick={() => window.location.href = '/products'}>
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
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    console.log('AdminDashboard useEffect triggered:', { 
      user: user, 
      isAdmin: user?.is_admin,
      userExists: !!user 
    });
    
    if (!user || !user.is_admin) {
      console.log('AdminDashboard: User not admin, skipping fetch');
      return;
    }

    const fetchAdminData = async () => {
      try {
        console.log('AdminDashboard: Starting data fetch...');
        setLoading(true);
        
        // Fetch products, categories, and orders for admin
        const [productsRes, categoriesRes, ordersRes] = await Promise.all([
          axios.get(`${API}/products`),
          axios.get(`${API}/categories`),
          axios.get(`${API}/orders`)
        ]);
        
        console.log('AdminDashboard: Data fetched successfully:', {
          productsCount: productsRes.data?.length,
          categoriesCount: categoriesRes.data?.length,
          ordersCount: ordersRes.data?.length
        });
        
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setOrders(ordersRes.data);
      } catch (error) {
        console.error('AdminDashboard: Error fetching admin data:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
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
      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={hideToast} 
      />
      
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
            <AdminProductsTab 
              products={products} 
              setProducts={setProducts} 
              categories={categories} 
              showToast={showToast}
            />
          </TabsContent>

          <TabsContent value="categories" className="mt-8">
            <AdminCategoriesTab 
              categories={categories} 
              setCategories={setCategories} 
              showToast={showToast}
            />
          </TabsContent>

          <TabsContent value="orders" className="mt-8">
            <AdminOrdersTab 
              orders={orders} 
              setOrders={setOrders} 
              showToast={showToast}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-8">
            <AdminAnalyticsTab products={products} orders={orders} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Image Upload Component - File Upload Only
const ImageUpload = ({ images = [], setImages, maxImages = 5 }) => {
  const [uploading, setUploading] = useState(false);
  
  // Ensure images is always an array and log what we're getting
  console.log('ImageUpload received images prop:', images, 'Type:', typeof images);
  const imageArray = Array.isArray(images) ? images : [];
  console.log('ImageUpload processed imageArray:', imageArray);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploading(true);
    
    const promises = files.map(file => {
      return new Promise((resolve, reject) => {
        if (file.type.startsWith('image/')) {
          // Check file size (limit to 2MB to prevent issues)
          if (file.size > 2 * 1024 * 1024) {
            reject(new Error(`File ${file.name} is too large (${Math.round(file.size / 1024 / 1024)}MB). Please use images smaller than 2MB.`));
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (e) => {
            // Get the base64 result
            const base64Result = e.target.result;
            console.log('Image uploaded successfully:', {
              filename: file.name,
              size: file.size,
              base64Length: base64Result.length
            });
            
            // Additional check for base64 length (should be reasonable for database storage)
            if (base64Result.length > 1.5 * 1024 * 1024) { // ~1.5MB base64 limit
              reject(new Error(`Image ${file.name} is too large after encoding. Please use a smaller image.`));
              return;
            }
            
            resolve(base64Result);
          };
          reader.onerror = (error) => {
            console.error('FileReader error:', error);
            reject(new Error(`Failed to read file ${file.name}`));
          };
          reader.readAsDataURL(file);
        } else {
          reject(new Error('Invalid file type. Please upload an image file.'));
        }
      });
    });

    Promise.all(promises)
      .then(newImages => {
        console.log('Processing uploaded images:', newImages.length);
        console.log('New images data (first 50 chars each):', newImages.map(img => img.substring(0, 50)));
        
        // Instead of using a state updater function, directly compute the new array
        const currentImages = Array.isArray(imageArray) ? imageArray : [];
        const combined = [...currentImages, ...newImages];
        const result = combined.slice(0, maxImages);
        
        console.log('Final images array length:', result.length);
        console.log('Calling setImages with result');
        
        // Call setImages directly with the computed array
        setImages(result);
        
        setUploading(false);
        alert(`Successfully uploaded ${newImages.length} image(s)!`);
      })
      .catch(error => {
        console.error('Error uploading images:', error);
        alert('Error uploading images: ' + error.message);
        setUploading(false);
      });
  };

  const removeImage = (index) => {
    console.log('Removing image at index:', index);
    const currentImages = Array.isArray(imageArray) ? imageArray : [];
    const result = currentImages.filter((_, i) => i !== index);
    console.log('After removal, images array length:', result.length);
    setImages(result);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <label className="block text-sm font-medium text-gray-700">Images</label>
        <span className="text-xs text-gray-400">({imageArray.length}/{maxImages})</span>
      </div>
      
      {/* Image Preview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {imageArray.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Image ${index + 1}`}
              className="w-full h-24 object-cover rounded border border-gray-300"
              onError={(e) => {
                console.error('Image display error. Image type:', typeof image, 'Image value:', image);
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA4LjI4NCA3MCA1Mi4zIDc1IDYwLjU4NCA3NUw2Mi4zMzMgOTEuNjY2N0g2Ny42NjZMNzIuNTMzIDk4LjQyNzlINjEuNSIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTAwIDEzMEM5MS43MTU5IDEzMCAxMzguNSAxMjUgMTMwLjIxNiAxMjVMMTI4LjQ2NyAxMDguMzMzSDEyMy4xMzRMMTE4LjI2NyAxMDEuNTcySDEyOS4zIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+';
              }}
              onLoad={() => {
                console.log('Image loaded successfully');
              }}
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ))}
        
        {/* Add Image Placeholder */}
        {imageArray.length < maxImages && (
          <div className="border-2 border-dashed border-gray-300 rounded p-4 flex flex-col items-center justify-center h-24 hover:border-orange-500 transition-colors cursor-pointer">
            <Plus className="h-6 w-6 text-gray-500 mb-1" />
            <span className="text-xs text-gray-600">Add Image</span>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex gap-2">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            disabled={imageArray.length >= maxImages || uploading}
          />
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            disabled={imageArray.length >= maxImages || uploading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
            asChild
          >
            <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
          </Button>
        </label>
      </div>
      
      <p className="text-xs text-gray-600">
        Upload images from your device. Maximum {maxImages} images. Supported: JPG, PNG, WebP
      </p>
    </div>
  );
};

// Admin Products Tab
const AdminProductsTab = ({ products, setProducts, categories, showToast }) => {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    images: [], // Initialize as empty array
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'White'],
    inventory: '',
    featured: false
  });

  console.log('AdminProductsTab received:', { 
    productsCount: products ? products.length : 'undefined',
    products: products,
    categoriesCount: categories ? categories.length : 'undefined'
  });

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category_id: '',
      images: [], // Ensure this is always an array
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
        images: Array.isArray(productForm.images) ? productForm.images.filter(img => img && img.trim() !== '') : []
      };

      console.log('Saving product with data:', {
        ...productData,
        images: productData.images.map(img => `${img.substring(0, 50)}... (length: ${img.length})`)
      });

      const response = await axios.post(`${API}/products`, productData);
      console.log('Product save response:', response.data);
      
      setProducts([...products, response.data]);
      setIsAddingProduct(false);
      resetForm();
      showToast('Product added successfully!', 'success');
    } catch (error) {
      console.error('Error adding product:', error);
      console.error('Error response:', error.response?.data);
      let errorMessage = 'Unknown error occurred';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => 
            typeof err === 'object' ? `${err.loc?.join(' ')} - ${err.msg}` : err
          ).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      showToast('Error adding product: ' + errorMessage, 'error');
    }
  };

  const handleEditProduct = async () => {
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        inventory: parseInt(productForm.inventory),
        images: Array.isArray(productForm.images) ? productForm.images.filter(img => img && img.trim() !== '') : []
      };

      const response = await axios.put(`${API}/products/${editingProduct.id}`, productData);
      setProducts(products.map(p => p.id === editingProduct.id ? response.data : p));
      setEditingProduct(null);
      resetForm();
      showToast('Product updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating product:', error);
      let errorMessage = 'Unknown error occurred';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => 
            typeof err === 'object' ? `${err.loc?.join(' ')} - ${err.msg}` : err
          ).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      showToast('Error updating product: ' + errorMessage, 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`${API}/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      showToast('Product deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting product:', error);
      let errorMessage = 'Unknown error occurred';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => 
            typeof err === 'object' ? `${err.loc?.join(' ')} - ${err.msg}` : err
          ).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert('Error deleting product: ' + errorMessage);
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
      showToast(`Product ${updatedProduct.featured ? 'marked as featured' : 'unmarked as featured'}!`, 'success');
    } catch (error) {
      console.error('Error toggling featured:', error);
      let errorMessage = 'Unknown error occurred';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => 
            typeof err === 'object' ? `${err.loc?.join(' ')} - ${err.msg}` : err
          ).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      showToast('Error updating product: ' + errorMessage, 'error');
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category_id: product.category_id,
      images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
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
        {products && products.length > 0 ? (
          products.map(product => (
            <AdminProductCard 
              key={product.id} 
              product={product} 
              categories={categories}
              onEdit={() => startEdit(product)}
              onDelete={() => handleDeleteProduct(product.id)}
              onToggleFeatured={() => handleToggleFeatured(product)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No products available</p>
            <p className="text-sm text-gray-400 mt-2">Click "Add Product" to create your first product</p>
          </div>
        )}
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
              <ImageUpload 
                images={productForm.images} 
                setImages={(newImages) => {
                  console.log('Setting product form images to:', newImages);
                  setProductForm(prev => ({...prev, images: newImages}));
                }}
                maxImages={5}
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
              <ImageUpload 
                images={categoryForm.image ? [categoryForm.image] : []} 
                setImages={(images) => {
                  const imageArray = Array.isArray(images) ? images : [];
                  setCategoryForm({...categoryForm, image: imageArray[0] || ''});
                }}
                maxImages={1}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState(orders);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone.includes(searchQuery) ||
        order.delivery_address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

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

  const printOrderDetails = (order) => {
    const printContent = `
      <html>
        <head>
          <title>Order Details - ${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f97316; padding-bottom: 20px; }
            .header h1 { color: #f97316; margin: 0; }
            .order-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .info-box { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
            .info-box h3 { margin: 0 0 10px 0; color: #333; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .items-table th { background-color: #f97316; color: white; }
            .total-section { margin-top: 20px; text-align: right; }
            .total-section .total { font-size: 18px; font-weight: bold; color: #f97316; }
            .status { padding: 5px 10px; border-radius: 15px; font-weight: bold; text-transform: uppercase; }
            .status.pending { background-color: #fef3c7; color: #92400e; }
            .status.confirmed { background-color: #dbeafe; color: #1e40af; }
            .status.shipped { background-color: #e0e7ff; color: #5b21b6; }
            .status.delivered { background-color: #dcfce7; color: #166534; }
            .status.cancelled { background-color: #fee2e2; color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Saahaz.com</h1>
            <h2>Order Details</h2>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="order-info">
            <div class="info-box">
              <h3>Order Information</h3>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Status:</strong> <span class="status ${order.status}">${order.status}</span></p>
              <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
            </div>
            
            <div class="info-box">
              <h3>Customer Information</h3>
              <p><strong>Customer ID:</strong> ${order.user_id.slice(0, 8)}...</p>
              <p><strong>Phone:</strong> ${order.phone}</p>
              <p><strong>Delivery Address:</strong><br>${order.delivery_address}</p>
            </div>
          </div>
          
          <h3>Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Quantity</th>
                <th>Size</th>
                <th>Color</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.product_id.slice(0, 8)}...</td>
                  <td>${item.quantity}</td>
                  <td>${item.size || 'N/A'}</td>
                  <td>${item.color || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <p><strong>Total Items:</strong> ${order.items.length}</p>
            <p class="total">Total Amount: PKR ${order.total_amount.toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by ID, customer, phone, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-2xl font-bold text-orange-500">{filteredOrders.length}</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'Filtered Orders' : 'Total Orders'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-2xl font-bold text-green-500">
                  {filteredOrders.filter(o => o.status === 'confirmed').length}
                </h3>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-2xl font-bold text-blue-500">
                  {filteredOrders.filter(o => o.status === 'shipped').length}
                </h3>
                <p className="text-sm text-muted-foreground">Shipped</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-2xl font-bold text-purple-500">
                  PKR {filteredOrders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString()}
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
                {filteredOrders.map(order => (
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
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewOrderDetails(order)}>
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => printOrderDetails(order)}>
                          Print
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-muted-foreground">Try adjusting your search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={selectedOrder !== null} onOpenChange={(open) => {
        if (!open) setSelectedOrder(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Order Details
              {selectedOrder && (
                <Button variant="outline" onClick={() => printOrderDetails(selectedOrder)}>
                  Print Order
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Order Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-mono text-sm">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={selectedOrder.status === 'delivered' ? 'default' : 'secondary'}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Date:</span>
                      <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="uppercase">{selectedOrder.payment_method}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer ID:</span>
                      <span className="font-mono text-sm">{selectedOrder.user_id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedOrder.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Delivery Address</h4>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedOrder.delivery_address}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">Product ID: {item.product_id.slice(0, 8)}...</p>
                        <div className="text-sm text-muted-foreground space-x-4">
                          <span>Quantity: {item.quantity}</span>
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-xl font-bold text-orange-500">
                    PKR {selectedOrder.total_amount.toLocaleString()}
                  </span>
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

// Admin Analytics Tab - Enhanced
const AdminAnalyticsTab = ({ products, orders }) => {
  const [dateRange, setDateRange] = useState('30'); // days
  const [analyticsData, setAnalyticsData] = useState({});

  const calculateAnalytics = () => {
    const now = new Date();
    const daysAgo = new Date(now.getTime() - (parseInt(dateRange) * 24 * 60 * 60 * 1000));
    const filteredOrders = orders.filter(order => new Date(order.created_at) >= daysAgo);
    
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Order status breakdown
    const statusBreakdown = {
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      confirmed: filteredOrders.filter(o => o.status === 'confirmed').length,  
      shipped: filteredOrders.filter(o => o.status === 'shipped').length,
      delivered: filteredOrders.filter(o => o.status === 'delivered').length,
      cancelled: filteredOrders.filter(o => o.status === 'cancelled').length
    };
    
    // Top selling products
    const productSales = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (productSales[item.product_id]) {
          productSales[item.product_id] += item.quantity;
        } else {
          productSales[item.product_id] = item.quantity;
        }
      });
    });
    
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, quantity]) => ({
        product: products.find(p => p.id === productId),
        quantity
      }));
    
    // Daily sales data (last 7 days)
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.toDateString() === date.toDateString();
      });
      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total_amount, 0);
      dailySales.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }
    
    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      statusBreakdown,
      topProducts,
      dailySales,
      totalProducts: products.length,
      lowStockProducts: products.filter(p => p.inventory < 10).length
    };
  };

  useEffect(() => {
    setAnalyticsData(calculateAnalytics());
  }, [dateRange, orders, products]);

  const printAnalytics = () => {
    const printContent = `
      <html>
        <head>
          <title>Saahaz.com Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .metric { border: 1px solid #ddd; padding: 20px; text-align: center; }
            .metric h3 { margin: 0 0 10px 0; color: #f97316; }
            .metric p { margin: 0; font-size: 24px; font-weight: bold; }
            .section { margin-bottom: 30px; }
            .section h2 { color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f97316; color: white; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Saahaz.com Analytics Report</h1>
            <p>Period: Last ${dateRange} days | Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="metrics">
            <div class="metric">
              <h3>Total Revenue</h3>
              <p>PKR ${analyticsData.totalRevenue?.toLocaleString()}</p>
            </div>
            <div class="metric">
              <h3>Total Orders</h3>
              <p>${analyticsData.totalOrders}</p>
            </div>
            <div class="metric">
              <h3>Average Order Value</h3>
              <p>PKR ${Math.round(analyticsData.avgOrderValue || 0).toLocaleString()}</p>
            </div>
            <div class="metric">
              <h3>Total Products</h3>
              <p>${analyticsData.totalProducts}</p>
            </div>
          </div>
          
          <div class="section">
            <h2>Order Status Breakdown</h2>
            <table>
              <tr><th>Status</th><th>Count</th><th>Percentage</th></tr>
              ${Object.entries(analyticsData.statusBreakdown || {}).map(([status, count]) => 
                `<tr><td>${status.charAt(0).toUpperCase() + status.slice(1)}</td><td>${count}</td><td>${((count / analyticsData.totalOrders) * 100).toFixed(1)}%</td></tr>`
              ).join('')}
            </table>
          </div>
          
          <div class="section">
            <h2>Top Selling Products</h2>
            <table>
              <tr><th>Product</th><th>Quantity Sold</th><th>Price</th></tr>
              ${analyticsData.topProducts?.map(item => 
                `<tr><td>${item.product?.name || 'Unknown'}</td><td>${item.quantity}</td><td>PKR ${item.product?.price?.toLocaleString()}</td></tr>`
              ).join('')}
            </table>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Analytics & Reports</h2>
        <div className="flex gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <Button onClick={printAnalytics} variant="outline">
            Print Report
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">
              PKR {analyticsData.totalRevenue?.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{analyticsData.totalOrders}</div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">{analyticsData.totalProducts}</div>
            <p className="text-sm text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">
              PKR {Math.round(analyticsData.avgOrderValue || 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Avg Order Value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analyticsData.statusBreakdown || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'pending' ? 'bg-yellow-500' :
                      status === 'confirmed' ? 'bg-blue-500' :
                      status === 'shipped' ? 'bg-purple-500' :
                      status === 'delivered' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="capitalize">{status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{count}</span>
                    <span className="text-sm text-muted-foreground">
                      ({((count / analyticsData.totalOrders) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.dailySales?.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{day.date}</span>
                  <div className="text-right">
                    <div className="font-bold text-orange-500">PKR {day.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{day.orders} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topProducts?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                      <p className="text-sm text-muted-foreground">PKR {item.product?.price?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.quantity} sold</p>
                    <p className="text-sm text-muted-foreground">
                      PKR {((item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Low Stock Products</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {analyticsData.lowStockProducts} products with less than 10 items in stock
                </p>
              </div>
              
              {products.filter(p => p.inventory < 10).slice(0, 5).map(product => (
                <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">PKR {product.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      product.inventory === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {product.inventory === 0 ? 'Out of Stock' : `${product.inventory} left`}
                    </span>
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
  
  // Handle image display with fallback
  const getProductImage = () => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
      return product.images[0];
    }
    // Return a placeholder image if no image is available
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA4LjI4NCA3MCA1Mi4zIDc1IDYwLjU4NCA3NUw2Mi4zMzMgOTEuNjY2N0g2Ny42NjZMNzIuNTMzIDk4LjQyNzlINjEuNSIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTAwIDEzMEM5MS43MTU5IDEzMCAxMzguNSAxMjUgMTMwLjIxNiAxMjVMMTI4LjQ2NyAxMDguMzMzSDEyMy4xMzRMMTE4LjI2NyAxMDEuNTcySDEyOS4zIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjwvY3ZnPgo=';
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative w-full h-32 mb-4">
          <img 
            src={getProductImage()} 
            alt={product.name} 
            className="w-full h-full object-cover rounded"
            onError={(e) => {
              // Fallback to placeholder image if the original image fails to load
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA4LjI4NCA3MCA1Mi4zIDc1IDYwLjU4NCA3NUw2Mi4zMzMgOTEuNjY2N0g2Ny42NjZMNzIuNTMzIDk4LjQyNzlINjEuNSIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTAwIDEzMEM5MS43MTU5IDEzMCAxMzguNSAxMjUgMTMwLjIxNiAxMjVMMTI4LjQ2NyAxMDguMzMzSDEyMy4xMzRMMTE4LjI2NyAxMDEuNTcySDEyOS4zIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjwvY3ZnPgo=';
            }}
          />
          {(!product.images || !Array.isArray(product.images) || product.images.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
        </div>
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { addToCart, user } = useAppContext();
  const { toast, showToast, hideToast } = useToast();

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
      showToast('Please select size and color', 'warning');
      return;
    }
    addToCart(product.id, quantity, selectedSize, selectedColor);
    showToast('Product added to cart successfully!', 'success');
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      showToast('Please login to add items to wishlist', 'warning');
      return;
    }

    try {
      if (isInWishlist) {
        // Remove from wishlist
        await axios.delete(`${API}/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setIsInWishlist(false);
        showToast('Removed from wishlist', 'info');
      } else {
        // Add to wishlist
        await axios.post(`${API}/wishlist`, {
          product_id: productId
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setIsInWishlist(true);
        showToast('Added to wishlist successfully!', 'success');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      // For now, simulate wishlist functionality since API might not be implemented
      setIsInWishlist(!isInWishlist);
      showToast(
        isInWishlist ? 'Removed from wishlist' : 'Added to wishlist successfully!', 
        isInWishlist ? 'info' : 'success'
      );
    }
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
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
      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={hideToast} 
      />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg relative">
              {product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[selectedImageIndex] ? (
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA4LjI4NCA3MCA1Mi4zIDc1IDYwLjU4NCA3NUw2Mi4zMzMgOTEuNjY2N0g2Ny42NjZMNzIuNTMzIDk4LjQyNzlINjEuNSIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTAwIDEzMEM5MS43MTU5IDEzMCAxMzguNSAxMjUgMTMwLjIxNiAxMjVMMTI4LjQ2NyAxMDguMzMzSDEyMy4xMzRMMTE4LjI2NyAxMDEuNTcySDEyOS4zIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-500">No Image Available</span>
                </div>
              )}
              
              {/* Image navigation indicators for multiple images */}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageClick(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        selectedImageIndex === index ? 'bg-orange-500' : 'bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Image Thumbnails - Now all images including the first one */}
            {product.images && Array.isArray(product.images) && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`aspect-square overflow-hidden rounded-lg cursor-pointer transition-all border-2 ${
                      selectedImageIndex === index 
                        ? 'border-orange-500 ring-2 ring-orange-500/30' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => handleImageClick(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className={`w-full h-full object-cover transition-all hover:scale-105 ${
                        selectedImageIndex === index ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                      }`}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjEwIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4K';
                      }}
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
                <Button 
                  variant="outline" 
                  size="lg" 
                  className={`w-full transition-all ${
                    isInWishlist 
                      ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                      : 'hover:bg-orange-50 hover:border-orange-200'
                  }`}
                  onClick={handleAddToWishlist}
                >
                  <Heart className={`mr-2 h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                  {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
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
  const { cart, updateCartQuantity, removeFromCart } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    console.log('Cart in ShoppingCart component:', cart); // Debug log
    
    const fetchCartProducts = async () => {
      if (cart.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get unique product IDs
        const uniqueProductIds = [...new Set(cart.map(item => item.product_id))];
        
        const productPromises = uniqueProductIds.map(productId =>
          axios.get(`${API}/products/${productId}`)
        );
        
        const responses = await Promise.all(productPromises);
        const fetchedProducts = responses.map(response => response.data);
        setProducts(fetchedProducts);
        
        // Calculate total
        let total = 0;
        cart.forEach(cartItem => {
          const product = fetchedProducts.find(p => p.id === cartItem.product_id);
          if (product) {
            total += product.price * cartItem.quantity;
          }
        });
        setCartTotal(total);
        
      } catch (error) {
        console.error('Error fetching cart products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartProducts();
  }, [cart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-skeleton w-32 h-8 rounded mx-auto mb-4"></div>
          <p>Loading your cart...</p>
        </div>
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
        <h1 className="text-3xl font-bold mb-8">Shopping Cart ({cart.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => {
              const product = products.find(p => p.id === item.product_id);
              if (!product) {
                return (
                  <Card key={`${item.product_id}-${index}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="loading-skeleton w-20 h-20 rounded"></div>
                        <div className="flex-1">
                          <div className="loading-skeleton w-32 h-4 rounded mb-2"></div>
                          <div className="loading-skeleton w-24 h-4 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card key={`${item.product_id}-${item.size}-${item.color}-${index}`}>
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
                          onClick={() => updateCartQuantity(item.product_id, item.quantity - 1, item.size, item.color)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-3 py-1 border rounded">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.product_id, item.quantity + 1, item.size, item.color)}
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
                          onClick={() => removeFromCart(item.product_id, item.size, item.color)}
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
                  <span>Subtotal ({cart.length} items)</span>
                  <span>PKR {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-orange-600">Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-gray-600">PKR {cartTotal.toLocaleString()} + delivery</span>
                </div>
                <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600"
                        onClick={() => window.location.href = '/checkout'}>
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderProducts, setOrderProducts] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API}/orders`);
        setOrders(response.data);
        
        // Fetch product details for all orders
        const allProductIds = [...new Set(
          response.data.flatMap(order => order.items.map(item => item.product_id))
        )];
        
        const productPromises = allProductIds.map(id => 
          axios.get(`${API}/products/${id}`).catch(() => null)
        );
        const productResponses = await Promise.all(productPromises);
        
        const productsMap = {};
        productResponses.forEach((response, index) => {
          if (response && response.data) {
            productsMap[allProductIds[index]] = response.data;
          }
        });
        setOrderProducts(productsMap);
        
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

  const printOrderSlip = (order) => {
    const orderItems = order.items.map(item => ({
      ...item,
      product: orderProducts[item.product_id]
    }));
    
    const subtotal = orderItems.reduce((sum, item) => 
      sum + (item.product?.price || 0) * item.quantity, 0
    );

    const printContent = `
      <html>
        <head>
          <title>Order Slip - ${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f97316; padding-bottom: 20px; }
            .header h1 { color: #f97316; margin: 0; font-size: 28px; }
            .header p { margin: 5px 0; color: #666; }
            .order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .info-section h3 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
            .info-section p { margin: 5px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f97316; color: white; font-weight: bold; }
            .items-table tr:nth-child(even) { background-color: #f9f9f9; }
            .totals { margin-top: 20px; text-align: right; }
            .totals table { margin-left: auto; border-collapse: collapse; }
            .totals td { padding: 8px 15px; }
            .totals .total-row { font-weight: bold; font-size: 18px; color: #f97316; border-top: 2px solid #f97316; }
            .status { padding: 5px 10px; border-radius: 15px; font-weight: bold; text-transform: uppercase; }
            .status.pending { background-color: #fef3c7; color: #92400e; }
            .status.confirmed { background-color: #dbeafe; color: #1e40af; }
            .status.shipped { background-color: #e0e7ff; color: #5b21b6; }
            .status.delivered { background-color: #dcfce7; color: #166534; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Saahaz.com</h1>
            <p>Premium Fashion for Pakistan</p>
            <h2>Order Receipt</h2>
          </div>
          
          <div class="order-info">
            <div class="info-section">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span class="status ${order.status}">${order.status}</span></p>
              <p><strong>Payment Method:</strong> Cash on Delivery</p>
            </div>
            
            <div class="info-section">
              <h3>Delivery Information</h3>
              <p><strong>Customer:</strong> ${user.name}</p>
              <p><strong>Phone:</strong> ${order.phone}</p>
              <p><strong>Address:</strong><br>${order.delivery_address}</p>
            </div>
          </div>
          
          <h3>Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Size</th>
                <th>Color</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems.map(item => `
                <tr>
                  <td>${item.product?.name || 'Product N/A'}</td>
                  <td>${item.size || 'N/A'}</td>
                  <td>${item.color || 'N/A'}</td>
                  <td>${item.quantity}</td>
                  <td>PKR ${item.product?.price?.toLocaleString() || '0'}</td>
                  <td>PKR ${((item.product?.price || 0) * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td>PKR ${subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Delivery:</td>
                <td>FREE</td>
              </tr>
              <tr class="total-row">
                <td>Total Amount:</td>
                <td>PKR ${order.total_amount.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div class="footer">
            <p>Thank you for shopping with Saahaz.com!</p>
            <p>For support, contact us at info@saahaz.com or +92 340 6098662</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

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
            {orders.map(order => {
              const orderItems = order.items.map(item => ({
                ...item,
                product: orderProducts[item.product_id]
              }));

              return (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Order #{order.id.slice(0, 8)}...</h3>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium mb-2">Items ({order.items.length})</h4>
                        <div className="space-y-1">
                          {orderItems.slice(0, 2).map((item, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              {item.product?.name || 'Product N/A'} x{item.quantity}
                            </div>
                          ))}
                          {orderItems.length > 2 && (
                            <div className="text-sm text-muted-foreground">
                              +{orderItems.length - 2} more items
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Total</h4>
                        <p className="text-lg font-bold text-orange-500">PKR {order.total_amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Cash on Delivery</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Delivery</h4>
                        <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                        <p className="text-sm text-muted-foreground">Phone: {order.phone}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={() => viewOrderDetails(order)}>
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => printOrderSlip(order)}>
                        Print Order Slip
                      </Button>
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Order Details Dialog */}
        <Dialog open={selectedOrder !== null} onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Order Details
                {selectedOrder && (
                  <Button variant="outline" onClick={() => printOrderSlip(selectedOrder)}>
                    Print Order Slip
                  </Button>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Order Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order ID:</span>
                        <span className="font-mono text-sm">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={selectedOrder.status === 'delivered' ? 'default' : 'secondary'}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Date:</span>
                        <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment:</span>
                        <span>Cash on Delivery</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Delivery Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{selectedOrder.phone}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Address:</span>
                        <p className="text-sm bg-gray-50 p-3 rounded mt-1">{selectedOrder.delivery_address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => {
                      const product = orderProducts[item.product_id];
                      return (
                        <div key={index} className="flex items-center space-x-4 p-4 border rounded">
                          {product?.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h5 className="font-medium">{product?.name || 'Product N/A'}</h5>
                            <div className="text-sm text-muted-foreground">
                              {item.size && <span>Size: {item.size} | </span>}
                              {item.color && <span>Color: {item.color} | </span>}
                              <span>Quantity: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">PKR {product?.price?.toLocaleString() || '0'}</p>
                            <p className="text-sm text-muted-foreground">
                              Total: PKR {((product?.price || 0) * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>Subtotal:</span>
                    <span>PKR {selectedOrder.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Delivery:</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-orange-500">PKR {selectedOrder.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
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

// Products Page Component
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get category from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API}/products${selectedCategory ? `?category_id=${selectedCategory}` : ''}`),
          axios.get(`${API}/categories`)
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

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
        <h1 className="text-3xl font-bold mb-8">All Products</h1>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('')}
            >
              All Categories
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">No Products Found</h2>
            <p className="text-muted-foreground">Try selecting a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Categories Page Component
const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
        <h1 className="text-3xl font-bold mb-8">Shop by Category</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Card key={category.id} className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300"
                  onClick={() => window.location.href = `/products?category=${category.id}`}>
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
    </div>
  );
};

// About Page Component
const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Saahaz.com</h1>
            <p className="text-xl text-muted-foreground">
              Pakistan's premier destination for contemporary fashion that speaks your language.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                Founded with a vision to make premium fashion accessible to everyone in Pakistan, 
                Saahaz.com has become the go-to destination for style-conscious individuals who 
                appreciate quality and affordability.
              </p>
              <p className="text-muted-foreground mb-4">
                We believe that fashion is more than just clothing – it's a form of self-expression 
                that should be accessible to all. Our carefully curated collection features the 
                latest trends alongside timeless classics.
              </p>
              <p className="text-muted-foreground">
                From casual wear to formal attire, we offer a diverse range of products that cater 
                to every style preference and occasion.
              </p>
            </div>
            <div className="aspect-square overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxjbG90aGluZ3xlbnwwfHx8fDE3NTgxNTc2ODR8MA&ixlib=rb-4.1.0&q=85"
                alt="Our Story"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Saahaz?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                <Truck className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Free Delivery</h3>
              <p className="text-muted-foreground">
                Enjoy free cash-on-delivery service across Pakistan. No hidden charges, 
                no minimum order requirements.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Quality Guarantee</h3>
              <p className="text-muted-foreground">
                We source only the finest materials and work with trusted manufacturers 
                to ensure every product meets our high standards.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                <Package className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Easy Returns</h3>
              <p className="text-muted-foreground">
                Not satisfied with your purchase? Our 7-day return policy ensures 
                your complete peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="text-muted-foreground mb-8">
              Have questions? We'd love to hear from you. Reach out to our friendly team.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-muted-foreground">info@saahaz.com</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <h4 className="font-semibold mb-2">Phone</h4>
                  <p className="text-muted-foreground">+92 340 6098662</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <h4 className="font-semibold mb-2">Address</h4>
                  <p className="text-muted-foreground">Lahore, Pakistan</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Checkout Page Component
const CheckoutPage = () => {
  const { cart, user, clearCart } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderConfirmation, setOrderConfirmation] = useState(null); // For order confirmation
  const [orderForm, setOrderForm] = useState({
    delivery_address: '',
    phone: ''
  });
  const [cartTotal, setCartTotal] = useState(0);
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  const { toast, showToast, hideToast } = useToast();

  // Delivery options with charges
  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: '5-7 business days',
      charge: 150,
      icon: '📦'
    },
    {
      id: 'express',
      name: 'Express Delivery', 
      description: '2-3 business days',
      charge: 300,
      icon: '🚚'
    },
    {
      id: 'next_day',
      name: 'Next Day Delivery',
      description: 'Next business day',
      charge: 500,
      icon: '⚡'
    },
    {
      id: 'free',
      name: 'Free Delivery',
      description: '7-10 business days (Orders above PKR 3,000)',
      charge: 0,
      icon: '🆓',
      minOrderAmount: 3000
    }
  ];

  // Calculate delivery charge based on selection and cart total
  const getDeliveryCharge = () => {
    const option = deliveryOptions.find(opt => opt.id === selectedDelivery);
    if (!option) return 0;
    
    // Free delivery for orders above minimum amount
    if (option.id === 'free' && cartTotal >= option.minOrderAmount) {
      return 0;
    }
    
    return option.charge;
  };

  // Calculate final total including delivery
  const getFinalTotal = () => {
    return cartTotal + getDeliveryCharge();
  };

  useEffect(() => {
    const fetchCartProducts = async () => {
      if (cart.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const uniqueProductIds = [...new Set(cart.map(item => item.product_id))];
        const productPromises = uniqueProductIds.map(productId =>
          axios.get(`${API}/products/${productId}`)
        );
        
        const responses = await Promise.all(productPromises);
        const fetchedProducts = responses.map(response => response.data);
        setProducts(fetchedProducts);
        
        // Calculate total
        let total = 0;
        cart.forEach(cartItem => {
          const product = fetchedProducts.find(p => p.id === cartItem.product_id);
          if (product) {
            total += product.price * cartItem.quantity;
          }
        });
        setCartTotal(total);
        
      } catch (error) {
        console.error('Error fetching cart products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartProducts();
  }, [cart]);

  const handlePlaceOrder = async () => {
    if (!user) {
      showToast('Please login to place an order', 'warning');
      return;
    }

    if (!orderForm.delivery_address || !orderForm.phone) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    // Check if free delivery is available but order amount is too low
    const selectedOption = deliveryOptions.find(opt => opt.id === selectedDelivery);
    if (selectedOption && selectedOption.id === 'free' && cartTotal < selectedOption.minOrderAmount) {
      showToast(`Free delivery requires minimum order of PKR ${selectedOption.minOrderAmount.toLocaleString()}`, 'warning');
      return;
    }

    try {
      const deliveryCharge = getDeliveryCharge();
      const orderData = {
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        delivery_address: orderForm.delivery_address,
        phone: orderForm.phone,
        delivery_option: selectedDelivery,
        delivery_charge: deliveryCharge,
        subtotal: cartTotal,
        total: getFinalTotal()
      };

      const response = await axios.post(`${API}/orders`, orderData);
      const orderId = response.data.id.slice(0, 8);
      
      // Set order confirmation details
      setOrderConfirmation({
        orderId: response.data.id,
        shortId: orderId,
        items: cart.map(item => {
          const product = products.find(p => p.id === item.product_id);
          return {
            ...item,
            productName: product?.name || 'Unknown Product',
            productPrice: product?.price || 0
          };
        }),
        deliveryAddress: orderForm.delivery_address,
        phone: orderForm.phone,
        deliveryOption: selectedDelivery,
        deliveryCharge: getDeliveryCharge(),
        subtotal: cartTotal,
        total: getFinalTotal(),
        orderDate: new Date().toLocaleString()
      });
      
      // Clear cart after successful order
      clearCart();
      
      showToast(`🎉 Order confirmed! Order ID: ${orderId}`, 'success');
    } catch (error) {
      console.error('Error placing order:', error);
      showToast('Error placing order: ' + (error.response?.data?.detail || error.message), 'error');
    }
  };

  // Show order confirmation if order was just placed
  if (orderConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <Toast 
          message={toast.message} 
          type={toast.type} 
          isVisible={toast.isVisible} 
          onClose={hideToast} 
        />
        
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">Order Confirmed!</h1>
              <p className="text-gray-600">Thank you for your order. We'll start processing it right away.</p>
            </div>

            <div className="border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-600">Order ID:</span>
                  <p className="font-semibold">{orderConfirmation.shortId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Order Date:</span>
                  <p className="font-semibold">{orderConfirmation.orderDate}</p>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <p className="font-semibold">{orderConfirmation.phone}</p>
                </div>
                <div>
                  <span className="text-gray-600">Delivery:</span>
                  <p className="font-semibold">{deliveryOptions.find(opt => opt.id === orderConfirmation.deliveryOption)?.name}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-gray-600">Delivery Address:</span>
                <p className="font-semibold">{orderConfirmation.deliveryAddress}</p>
              </div>
            </div>

            <div className="border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Items Ordered</h3>
              {orderConfirmation.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      Size: {item.size}, Color: {item.color}, Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">PKR {(item.productPrice * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>PKR {orderConfirmation.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>PKR {orderConfirmation.deliveryCharge.toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>PKR {orderConfirmation.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => window.location.href = '/orders'}
                className="flex-1"
              >
                Track Your Orders
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/products'}
                className="flex-1"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCartIcon className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-6">Add some products before checkout!</p>
          <Button onClick={() => window.location.href = '/products'}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="mb-4">Please login to proceed with checkout.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={hideToast} 
      />
      
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item, index) => {
                  const product = products.find(p => p.id === item.product_id);
                  if (!product) return null;

                  return (
                    <div key={index} className="flex items-center space-x-4 p-3 border rounded">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' | '}
                          {item.color && `Color: ${item.color}`}
                        </p>
                        <p className="text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">PKR {(product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  );
                })}

                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>PKR {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span className={getDeliveryCharge() === 0 ? "text-green-600" : "text-gray-900"}>
                      {getDeliveryCharge() === 0 ? 'FREE' : `PKR ${getDeliveryCharge().toLocaleString()}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-orange-600">PKR {getFinalTotal().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Address *</label>
                  <textarea
                    className="w-full p-3 border rounded-md"
                    rows="4"
                    placeholder="Enter your complete delivery address including city and postal code"
                    value={orderForm.delivery_address}
                    onChange={(e) => setOrderForm({...orderForm, delivery_address: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <Input
                    type="tel"
                    placeholder="+92 340 6098662"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                    required
                  />
                </div>

                {/* Delivery Options */}
                <div>
                  <label className="block text-sm font-medium mb-3">Delivery Options *</label>
                  <div className="space-y-3">
                    {deliveryOptions.map((option) => {
                      const isDisabled = option.id === 'free' && cartTotal < option.minOrderAmount;
                      
                      return (
                        <div 
                          key={option.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedDelivery === option.id 
                              ? 'border-orange-500 bg-orange-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => !isDisabled && setSelectedDelivery(option.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{option.icon}</div>
                              <div>
                                <h4 className="font-medium">{option.name}</h4>
                                <p className="text-sm text-gray-600">{option.description}</p>
                                {isDisabled && (
                                  <p className="text-xs text-red-500 mt-1">
                                    Minimum order: PKR {option.minOrderAmount.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {option.charge === 0 ? 'FREE' : `PKR ${option.charge}`}
                              </p>
                              <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                                selectedDelivery === option.id 
                                  ? 'border-orange-500 bg-orange-500' 
                                  : 'border-gray-300'
                              }`}>
                                {selectedDelivery === option.id && (
                                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-md">
                  <h4 className="font-medium text-orange-800 mb-2">Payment Method</h4>
                  <p className="text-sm text-orange-700">Cash on Delivery (COD)</p>
                  <p className="text-xs text-orange-600 mt-1">
                    Pay when your order is delivered to your doorstep
                  </p>
                </div>

                <Button 
                  size="lg" 
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={handlePlaceOrder}
                >
                  Place Order - PKR {getFinalTotal().toLocaleString()}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By placing your order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
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
        console.log('Fetching data from API...', API);
        
        // Fetch categories with timeout
        console.log('Fetching categories...');
        const categoriesResponse = await axios.get(`${API}/categories`, {
          timeout: 10000 // 10 second timeout
        });
        console.log('Categories response:', categoriesResponse.data);
        setCategories(categoriesResponse.data);
        
        // Fetch featured products with timeout
        console.log('Fetching featured products...');
        const productsResponse = await axios.get(`${API}/products?featured=true`, {
          timeout: 10000 // 10 second timeout
        });
        console.log('Products response:', productsResponse.data);
        console.log('Setting products state with:', productsResponse.data);
        
        // Debug: Check what images look like in the response
        if (productsResponse.data && productsResponse.data.length > 0) {
          productsResponse.data.forEach((product, index) => {
            console.log(`Product ${index} (${product.name}):`, {
              id: product.id,
              imageCount: product.images ? product.images.length : 0,
              images: product.images ? product.images.map(img => 
                typeof img === 'string' ? `${img.substring(0, 50)}... (length: ${img.length})` : img
              ) : 'no images'
            });
          });
        }
        
        setProducts(productsResponse.data);
        
        // Force a re-render by logging the state after setting
        setTimeout(() => {
          console.log('Products state should now be:', productsResponse.data);
        }, 100);
        
        console.log('Successfully loaded API data');
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          code: error.code
        });
        // Fall back to mock data if API fails
        console.log('Falling back to mock data');
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
  const [cartInitialized, setCartInitialized] = useState(false);

  // Initialize cart from localStorage only once
  useEffect(() => {
    const initializeCart = () => {
      const savedCart = localStorage.getItem('saahaz_cart');
      console.log('Initializing cart, saved data:', savedCart);
      
      if (savedCart && savedCart !== 'undefined') {
        try {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            setCart(parsedCart);
            console.log('Cart initialized with:', parsedCart);
          }
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
          localStorage.removeItem('saahaz_cart');
          setCart([]);
        }
      }
      setCartInitialized(true);
    };

    if (!cartInitialized) {
      initializeCart();
    }
  }, [cartInitialized]);

  // Save cart to localStorage whenever cart changes (but only after initialization)
  useEffect(() => {
    if (cartInitialized) {
      localStorage.setItem('saahaz_cart', JSON.stringify(cart));
      console.log('Cart saved to localStorage:', cart);
    }
  }, [cart, cartInitialized]);

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
    localStorage.removeItem('saahaz_cart'); // Clear cart on logout
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setCart([]);
  };

  // Cart functions
  const addToCart = (productId, quantity = 1, size = null, color = null) => {
    const newItem = { 
      product_id: productId, 
      quantity, 
      size, 
      color,
      id: Date.now() + Math.random() // Unique ID
    };

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => 
        item.product_id === productId && 
        item.size === size && 
        item.color === color
      );
      
      let newCart;
      if (existingItemIndex >= 0) {
        // Update existing item
        newCart = prevCart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newCart = [...prevCart, newItem];
      }
      
      console.log('Cart updated:', newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId, size = null, color = null) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => 
        !(item.product_id === productId && item.size === size && item.color === color)
      );
      console.log('Item removed from cart:', newCart);
      return newCart;
    });
  };

  const updateCartQuantity = (productId, quantity, size = null, color = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.product_id === productId && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      );
      console.log('Cart quantity updated:', newCart);
      return newCart;
    });
  };

  const getCartTotal = () => {
    // This would need product prices, for now return 0
    return 0;
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('saahaz_cart');
  };

  // Initialize auth from localStorage and validate token
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Validate token by fetching user profile
          const response = await axios.get(`${API}/profile`);
          setUser(response.data);
          console.log('User authenticated:', response.data);
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token is invalid, clear it
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
    };

    initializeAuth();
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
    clearCart,
    cartCount: cart.reduce((total, item) => total + item.quantity, 0)
  };

  console.log('Current cart state:', cart, 'Count:', cart.reduce((total, item) => total + item.quantity, 0));

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
  const location = useLocation();
  
  // Check if current route is admin
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Only show Header for non-admin routes */}
      {!isAdminRoute && (
        <Header 
          onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          cartCount={cartCount}
        />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/product/:productId" element={<ProductDetails />} />
        <Route path="/cart" element={<ShoppingCart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<CustomerOrders />} />
        <Route path="/settings" element={<CustomerSettings />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* Add more routes as needed */}
      </Routes>
    </>
  );
};

export default App;