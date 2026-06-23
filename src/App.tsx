import React from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  Hero 
} from './components/Hero';
import { 
  ProductCatalog 
} from './components/ProductCatalog';
import { 
  ProductDetailModal 
} from './components/ProductDetailModal';
import { 
  CartDrawer 
} from './components/CartDrawer';
import { 
  AdminDashboard 
} from './components/AdminDashboard';
import { 
  Product, 
  Category, 
  Order, 
  SiteSettings 
} from './types';
import { 
  db, 
  seedDatabase 
} from './firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc 
} from 'firebase/firestore';
import { RefreshCw } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function App() {
  // DB States
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [settings, setSettings] = React.useState<SiteSettings | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Navigation / UI States
  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);

  // Shopping Bag State
  const [cart, setCart] = React.useState<CartItem[]>([]);

  // 1. Initial Seeding and Database Listeners Setup
  React.useEffect(() => {
    let unsubscribeProducts = () => {};
    let unsubscribeCategories = () => {};
    let unsubscribeSettings = () => {};
    let unsubscribeOrders = () => {};

    const initApp = async () => {
      try {
        // Run database seeding if empty
        await seedDatabase();

        // Subscribe to products list (newest first)
        const qProd = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        unsubscribeProducts = onSnapshot(qProd, (snapshot) => {
          const items: Product[] = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as Product);
          });
          setProducts(items);
        }, (err) => console.error("Error listening to products:", err));

        // Subscribe to categories list
        const qCat = query(collection(db, 'categories'), orderBy('name', 'asc'));
        unsubscribeCategories = onSnapshot(qCat, (snapshot) => {
          const items: Category[] = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as Category);
          });
          setCategories(items);
        }, (err) => console.error("Error listening to categories:", err));

        // Subscribe to site settings
        const settingsRef = doc(db, 'site_settings', 'main');
        unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
          if (docSnap.exists()) {
            setSettings(docSnap.data() as SiteSettings);
          }
        }, (err) => console.error("Error listening to settings:", err));

        // Subscribe to orders (newest first)
        const qOrd = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        unsubscribeOrders = onSnapshot(qOrd, (snapshot) => {
          const items: Order[] = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as Order);
          });
          setOrders(items);
        }, (err) => console.error("Error listening to orders:", err));

      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initApp();

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeSettings();
      unsubscribeOrders();
    };
  }, []);

  // 2. Load Cart from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('aesthete_cart_bag');
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (_) {}
    }
  }, []);

  // 3. Sync Cart state with localStorage and keep product quantities accurate
  React.useEffect(() => {
    if (products.length > 0 && cart.length > 0) {
      // Sync cart item stocks if changed in backend
      const updatedCart = cart.map((item) => {
        const freshProd = products.find((p) => p.id === item.product.id);
        if (freshProd) {
          // Adjust quantity if stock is lower now
          const adjustedQty = Math.min(item.quantity, freshProd.stock);
          return {
            product: freshProd,
            quantity: adjustedQty
          };
        }
        return item;
      }).filter((item) => products.some((p) => p.id === item.product.id) && item.product.stock > 0); // Remove deleted or out of stock items

      if (JSON.stringify(updatedCart) !== JSON.stringify(cart)) {
        setCart(updatedCart);
        localStorage.setItem('aesthete_cart_bag', JSON.stringify(updatedCart));
      }
    }
  }, [products]);

  // Cart operations helpers
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('aesthete_cart_bag', JSON.stringify(newCart));
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let newCart = [...cart];

    if (existingIndex > -1) {
      // Increment existing quantity within stock limits
      const updatedQty = Math.min(product.stock, newCart[existingIndex].quantity + quantity);
      newCart[existingIndex].quantity = updatedQty;
    } else {
      // Add fresh new item
      newCart.push({ product, quantity: Math.min(product.stock, quantity) });
    }

    saveCart(newCart);
  };

  const handleQuickAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering open modal
    handleAddToCart(product, 1);
    setCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    const newCart = cart.map((item) => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity: Math.min(item.product.stock, quantity)
        };
      }
      return item;
    });

    saveCart(newCart);
  };

  const handleRemoveCartItem = (productId: string) => {
    const newCart = cart.filter((item) => item.product.id !== productId);
    saveCart(newCart);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  const handleExploreClick = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Aesthete Store Studio</span>
      </div>
    );
  }

  const accentColor = settings.accentColor || '#3b82f6';
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col antialiased">
      {/* 1. Header Navigation */}
      <Navbar
        settings={settings}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        activeCategory={activeCategory}
        categories={categories}
        onSelectCategory={setActiveCategory}
      />

      {/* 2. Visual Hero split screen */}
      <Hero
        settings={settings}
        onExploreClick={handleExploreClick}
      />

      {/* 3. Product Catalog Grid */}
      <ProductCatalog
        products={products}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onProductClick={setSelectedProduct}
        onAddToCart={handleQuickAddToCart}
        accentColor={accentColor}
      />

      {/* 4. Elegant Minimalist Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          <div className="md:col-span-6 space-y-4">
            <h4 className="text-sm font-display font-bold tracking-wider text-gray-950 uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
              AESTHETE STUDIO
            </h4>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed font-sans">
              Designing sensory products engineered with sustainable premium materials and clean acoustics. Built for daily living, styled for elegance.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Support</h5>
            <ul className="space-y-2 text-xs font-semibold text-gray-500 font-sans">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Cash on Delivery Info</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Warranty & Service</a></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store Console</h5>
            <button
              onClick={() => setAdminOpen(true)}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer block"
            >
              Access Admin Studio
            </button>
            <p className="text-[10px] text-gray-400 mt-1">Authorized controller console access.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-100/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} Aesthete Retail Brand. All rights reserved. Registered COD Fulfilment.
          </p>
          <div className="flex gap-4 text-[10px] text-gray-400 font-medium">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* 5. Product Detail Slide-over drawer */}
      <ProductDetailModal
        product={selectedProduct}
        categories={categories}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        accentColor={accentColor}
      />

      {/* 6. Shopping Bag & Checkout Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        settings={settings}
      />

      {/* 7. Fully unlocked Admin dashboard panel */}
      <AdminDashboard
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        products={products}
        categories={categories}
        settings={settings}
        orders={orders}
        onRefreshData={() => {}} // Firestore listeners handle this automatically in real-time!
        accentColor={accentColor}
      />
    </div>
  );
}
