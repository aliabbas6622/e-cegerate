import React from 'react';
import { 
  X, 
  Lock, 
  BarChart3, 
  ShoppingBag, 
  Sliders, 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles, 
  AlertCircle, 
  TrendingUp,
  Link2,
  Copy
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Product, Category, Order, SiteSettings } from '../types';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  settings: SiteSettings;
  orders: Order[];
  accentColor: string;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateSettings: (settings: SiteSettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  settings,
  orders,
  accentColor,
  onUpdateProducts,
  onUpdateSettings
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [passcode, setPasscode] = React.useState('');
  const [actualPasscode, setActualPasscode] = React.useState(() => localStorage.getItem('aesthete_admin_passcode') || 'admin123');
  const [authError, setAuthError] = React.useState('');

  // Active Tab
  const [activeTab, setActiveTab] = React.useState<'overview' | 'products' | 'settings' | 'media'>('overview');

  // Product Management Form States
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = React.useState(false);
  const [prodForm, setProdForm] = React.useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: '',
    stock: 10,
    categoryId: 'audio',
    imageUrl: '',
    modelUrl: '',
    featured: false
  });
  const [submittingProduct, setSubmittingProduct] = React.useState(false);

  // AI Generator state
  const [generatingAI, setGeneratingAI] = React.useState(false);

  // Site Settings Form States
  const [settingsForm, setSettingsForm] = React.useState({
    heroTitle: '',
    heroSubtitle: '',
    heroCtaText: '',
    heroImage: '',
    heroModelActive: true,
    heroModelUrl: '',
    accentColor: '#3b82f6',
    announcementText: '',
    promoActive: true,
    adminPhone: '',
    newPasscode: ''
  });
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [settingsSuccess, setSettingsSuccess] = React.useState(false);

  // Copy helper
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  // Sample templates library
  const SAMPLE_ASSETS = [
    { name: 'Red Sneakers 3D Model (GLB)', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb', type: 'model' },
    { name: 'Damaged Helmet 3D Model (GLB)', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb', type: 'model' },
    { name: 'Retro Water Bottle 3D Model (GLB)', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb', type: 'model' },
    { name: 'Classic Lantern 3D Model (GLB)', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb', type: 'model' },
    { name: 'Unsplash - Minimal Headset', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800', type: 'image' },
    { name: 'Unsplash - Retro Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800', type: 'image' },
    { name: 'Unsplash - Amber Light Lamp', url: 'https://images.unsplash.com/photo-1507646227500-4d389b0012be?auto=format&fit=crop&q=80&w=800', type: 'image' }
  ];

  // Sync settings form on mount or settings change
  React.useEffect(() => {
    if (isOpen) {
      setSettingsForm({
        heroTitle: settings.heroTitle || '',
        heroSubtitle: settings.heroSubtitle || '',
        heroCtaText: settings.heroCtaText || '',
        heroImage: settings.heroImage || '',
        heroModelActive: settings.heroModelActive !== false,
        heroModelUrl: settings.heroModelUrl || '',
        accentColor: settings.accentColor || '#3b82f6',
        announcementText: settings.announcementText || '',
        promoActive: settings.promoActive !== false,
        adminPhone: settings.adminPhone || '',
        newPasscode: ''
      });
    }
  }, [isOpen, settings]);

  // Calculate Overview Metrics
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStockProducts = products.filter(p => p.stock <= 3).length;

  // Chart Data compilation (last 7 days of sales)
  const chartData = React.useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      days[label] = 0;
    }

    orders.forEach((ord) => {
      if (ord.status !== 'cancelled') {
        const ordDate = new Date(ord.createdAt);
        const label = ordDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (days[label] !== undefined) {
          days[label] += ord.total;
        }
      }
    });

    return Object.entries(days).map(([name, sales]) => ({ name, sales }));
  }, [orders]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === actualPasscode) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect passcode. Please try again.');
    }
  };

  // Handle Product Add or Edit Submit
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name || prodForm.price <= 0 || !prodForm.imageUrl) {
      alert("Please complete all required fields.");
      return;
    }

    setSubmittingProduct(true);
    try {
      const finalProductData = {
        name: prodForm.name,
        description: prodForm.description,
        price: Number(prodForm.price),
        originalPrice: prodForm.originalPrice ? Number(prodForm.originalPrice) : undefined,
        stock: Number(prodForm.stock),
        categoryId: prodForm.categoryId,
        images: [prodForm.imageUrl],
        modelUrl: prodForm.modelUrl || undefined,
        featured: prodForm.featured,
        createdAt: editingProduct ? editingProduct.createdAt : Date.now()
      };

      if (editingProduct) {
        // Edit Mode
        const updatedProducts = products.map(p => p.id === editingProduct.id ? { ...finalProductData, id: p.id } : p);
        onUpdateProducts(updatedProducts);
        setEditingProduct(null);
      } else {
        // Add Mode
        const newDocId = `prod-${Date.now()}`;
        const newProducts = [{ ...finalProductData, id: newDocId }, ...products];
        onUpdateProducts(newProducts);
        setIsAddingProduct(false);
      }

      // Reset Form
      setProdForm({
        name: '',
        description: '',
        price: 0,
        originalPrice: '',
        stock: 10,
        categoryId: 'audio',
        imageUrl: '',
        modelUrl: '',
        featured: false
      });
    } catch (err) {
      console.error("Failed to save product:", err);
    } finally {
      setSubmittingProduct(false);
    }
  };

  // AI Description Generator
  const handleAIGenerateDescription = async () => {
    if (!prodForm.name) {
      alert("Please enter a product name first before generating a description.");
      return;
    }

    setGeneratingAI(true);
    try {
      const res = await fetch("/api/gemini/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: prodForm.name,
          category: categories.find(c => c.id === prodForm.categoryId)?.name || 'Retail',
          features: prodForm.description
        })
      });
      const data = await res.json();
      if (data.description) {
        setProdForm(prev => ({ ...prev, description: data.description }));
      } else {
        alert(data.error || "Could not generate description.");
      }
    } catch (err) {
      console.error("AI Generation request failed:", err);
    } finally {
      setGeneratingAI(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = (prodId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const updatedProducts = products.filter(p => p.id !== prodId);
    onUpdateProducts(updatedProducts);
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const updatedSettings = {
        id: 'main',
        heroTitle: settingsForm.heroTitle,
        heroSubtitle: settingsForm.heroSubtitle,
        heroCtaText: settingsForm.heroCtaText,
        heroImage: settingsForm.heroImage,
        heroModelActive: settingsForm.heroModelActive,
        heroModelUrl: settingsForm.heroModelUrl,
        accentColor: settingsForm.accentColor,
        announcementText: settingsForm.announcementText,
        promoActive: settingsForm.promoActive,
        adminPhone: settingsForm.adminPhone
      };

      onUpdateSettings(updatedSettings);

      // Save New Passcode if provided
      if (settingsForm.newPasscode.trim()) {
        localStorage.setItem('aesthete_admin_passcode', settingsForm.newPasscode.trim());
        setActualPasscode(settingsForm.newPasscode.trim());
      }

      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Could not update site settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Start Edit Product
  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setIsAddingProduct(false);
    setProdForm({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      stock: product.stock,
      categoryId: product.categoryId,
      imageUrl: product.images[0] || '',
      modelUrl: product.modelUrl || '',
      featured: product.featured || false
    });
  };

  // Copy to clipboard helper
  const handleCopyUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/50 backdrop-blur-xs" id="admin-modal-root">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 animate-scale-in border border-gray-100">
        
        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-base font-display font-semibold tracking-wide">AESTHETE — Admin Studio</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/50">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-100/60 text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-display font-bold text-gray-950">Enter passcode to unlock</h3>
                <p className="text-xs text-gray-400 mt-1">Please enter your store controller passcode to verify clearance.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  placeholder="Passcode (Default: admin123)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-gray-400 rounded-xl text-center font-mono font-bold tracking-widest text-lg outline-none transition-colors"
                  id="admin-passcode-input"
                  autoFocus
                />
                {authError && (
                  <p className="text-xs text-rose-500 font-medium flex items-center justify-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {authError}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 bg-gray-900 text-white font-semibold text-xs tracking-widest uppercase rounded-xl hover:bg-gray-800 cursor-pointer active:scale-95 duration-150 transition-all shadow-sm"
                >
                  Authorize Console
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            <aside className="w-full md:w-56 bg-gray-50 border-r border-gray-100 p-4 space-y-2 flex flex-row md:flex-col shrink-0 overflow-x-auto md:overflow-x-visible">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left py-2.5 px-4 text-xs font-semibold tracking-wider uppercase rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Overview & Orders
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full text-left py-2.5 px-4 text-xs font-semibold tracking-wider uppercase rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Package className="w-4 h-4" /> Products
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left py-2.5 px-4 text-xs font-semibold tracking-wider uppercase rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Sliders className="w-4 h-4" /> Site Settings
              </button>
              <button
                onClick={() => setActiveTab('media')}
                className={`w-full text-left py-2.5 px-4 text-xs font-semibold tracking-wider uppercase rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'media'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Link2 className="w-4 h-4" /> Assets Library
              </button>
            </aside>

            <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
              
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl relative overflow-hidden">
                      <TrendingUp className="absolute right-4 top-4 w-10 h-10 text-gray-200" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Revenue</span>
                      <p className="text-2xl font-bold font-display text-gray-950 mt-1.5">${totalRevenue.toFixed(2)}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">Valid COD sales</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl relative overflow-hidden">
                      <ShoppingBag className="absolute right-4 top-4 w-10 h-10 text-gray-200" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Orders</span>
                      <p className="text-2xl font-bold font-display text-gray-950 mt-1.5">{orders.length}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">Recorded orders</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl relative overflow-hidden">
                      <div className="absolute right-4 top-4 w-3.5 h-3.5 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Pending Orders</span>
                      <p className="text-2xl font-bold font-display text-gray-950 mt-1.5">{pendingOrders}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">Awaiting confirmation</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl relative overflow-hidden">
                      <Package className="absolute right-4 top-4 w-10 h-10 text-gray-200" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Low Stock Items</span>
                      <p className="text-2xl font-bold font-display text-gray-950 mt-1.5">{lowStockProducts}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">Stock level &le; 3</p>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Sales Performance (Last 7 Days)</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="name" tickLine={false} style={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'monospace' }} />
                          <YAxis tickLine={false} style={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'monospace' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111827', borderRadius: 12, border: 'none', color: '#ffffff', fontSize: 12 }} 
                            labelClassName="font-bold text-[11px]"
                          />
                          <Line type="monotone" dataKey="sales" stroke={accentColor || '#3b82f6'} strokeWidth={3} dot={{ r: 4, strokeWidth: 1 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recorded Orders Catalog</h4>
                      <span className="text-xs text-gray-400 font-mono">List count: {orders.length}</span>
                    </div>

                    {orders.length > 0 ? (
                      <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 select-none">
                              <th className="py-3 px-4">Order ID</th>
                              <th className="py-3 px-4">Customer</th>
                              <th className="py-3 px-4">Items / Total</th>
                              <th className="py-3 px-4">Address</th>
                              <th className="py-3 px-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {orders.map((ord) => (
                              <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-4 font-mono font-semibold text-gray-600">{ord.id}</td>
                                <td className="py-4 px-4">
                                  <p className="font-bold text-gray-900">{ord.customerName}</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">{ord.customerPhone}</p>
                                  <p className="text-[10px] text-gray-400">{ord.customerEmail}</p>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="max-w-xs truncate text-gray-600 font-medium">
                                    {ord.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                                  </div>
                                  <p className="font-bold text-gray-950 mt-1 text-sm">${ord.total.toFixed(2)}</p>
                                </td>
                                <td className="py-4 px-4 text-gray-500 font-medium">
                                  <p className="truncate max-w-[150px]">{ord.customerAddress}</p>
                                  <p className="text-[10px] uppercase tracking-wider">{ord.customerCity}</p>
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] tracking-wider uppercase border ${
                                      ord.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                      ord.status === 'processing' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                      ord.status === 'shipped' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                                      ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                      'bg-gray-50 text-gray-400 border-gray-200'
                                    }`}>
                                    {ord.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl text-gray-400">
                        No orders recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="text-sm font-display font-bold text-gray-950">Store Products Controller</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Add, customize, delete or AI-generate product details.</p>
                    </div>
                    
                    {!isAddingProduct && !editingProduct && (
                      <button
                        onClick={() => {
                          setEditingProduct(null);
                          setIsAddingProduct(true);
                          setProdForm({
                            name: '',
                            description: '',
                            price: 0,
                            originalPrice: '',
                            stock: 10,
                            categoryId: 'audio',
                            imageUrl: '',
                            modelUrl: '',
                            featured: false
                          });
                        }}
                        className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold tracking-wider uppercase rounded-full flex items-center gap-1.5 hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Product
                      </button>
                    )}
                  </div>

                  {(isAddingProduct || editingProduct) && (
                    <form onSubmit={handleProductSubmit} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100/80 grid grid-cols-1 md:grid-cols-12 gap-6 relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingProduct(false);
                          setEditingProduct(null);
                        }}
                        className="absolute top-4 right-4 p-1.5 bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 cursor-pointer"
                        title="Cancel Form"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <h4 className="md:col-span-12 font-bold text-xs text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-gray-600" />
                        {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Product'}
                      </h4>

                      <div className="md:col-span-6 space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. AeroPods Premium"
                          value={prodForm.name}
                          onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200/80 rounded-xl text-xs font-medium outline-none text-gray-800 focus:border-gray-400 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-6 space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category Category *</label>
                        <select
                          value={prodForm.categoryId}
                          onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200/80 rounded-xl text-xs font-medium outline-none text-gray-700 focus:border-gray-400 cursor-pointer transition-colors"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-12 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description & Copywriting *</label>
                          <button
                            type="button"
                            onClick={handleAIGenerateDescription}
                            disabled={generatingAI}
                            className="text-[10px] font-bold text-gray-800 hover:text-gray-950 flex items-center gap-1 bg-white border border-gray-200 shadow-xs px-2.5 py-1 rounded-full cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            {generatingAI ? 'AI Copywriting...' : 'AI Generate (Gemini)'}
                          </button>
                        </div>
                        <textarea
                          rows={4}
                          required
                          placeholder="Write key specs, comfort traits and acoustics..."
                          value={prodForm.description}
                          onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200/80 rounded-xl text-xs font-medium outline-none text-gray-800 focus:border-gray-400 transition-colors resize-none leading-relaxed"
                        />
                      </div>

                      <div className="md:col-span-4 space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price ($) *</label>
                        <input
                          type="number"
                          required
                          min={1}
                          placeholder="299"
                          value={prodForm.price || ''}
                          onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200/80 rounded-xl text-xs font-medium outline-none text-gray-800 focus:border-gray-400 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-4 space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Original Price ($) (Optional)</label>
                        <input
                          type="number"
                          placeholder="349 (For showing discount)"
                          value={prodForm.originalPrice}
                          onChange={(e) => setProdForm({ ...prodForm, originalPrice: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200/80 rounded-xl text-xs font-medium outline-none text-gray-800 focus:border-gray-400 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-4 space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stock Inventory *</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={prodForm.stock}
                          onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200/80 rounded-xl text-xs font-medium outline-none text-gray-800 focus:border-gray-400 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-6 space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Image URL *</label>
                        <input
                          type="url"
                          required
                          placeholder="Paste image link..."
                          value={prodForm.imageUrl}
                          onChange={(e) => setProdForm({ ...prodForm, imageUrl: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200/80 rounded-xl text-xs font-medium outline-none text-gray-800 focus:border-gray-400 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-6 space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product 3D Model GLB URL (Optional)</label>
                        <input
                          type="url"
                          placeholder="Paste link to GLB file..."
                          value={prodForm.modelUrl}
                          onChange={(e) => setProdForm({ ...prodForm, modelUrl: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200/80 rounded-xl text-xs font-medium outline-none text-gray-800 focus:border-gray-400 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-12 flex items-center gap-2 pt-1 select-none">
                        <input
                          type="checkbox"
                          id="featured-checkbox"
                          checked={prodForm.featured}
                          onChange={(e) => setProdForm({ ...prodForm, featured: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="featured-checkbox" className="text-xs font-semibold text-gray-700 cursor-pointer">
                          Mark as Featured
                        </label>
                      </div>

                      <div className="md:col-span-12 flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingProduct(false);
                            setEditingProduct(null);
                          }}
                          className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold tracking-wider uppercase rounded-full cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingProduct}
                          className="px-6 py-2.5 text-white text-xs font-semibold tracking-wider uppercase rounded-full cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm"
                          style={{ backgroundColor: accentColor || '#3b82f6' }}
                        >
                          {submittingProduct ? 'Saving...' : (editingProduct ? 'Save Product' : 'Create Product')}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-150 pb-2">Active Catalog list</h4>

                    {products.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((prod) => (
                          <div 
                            key={prod.id} 
                            className="bg-white border border-gray-100/60 hover:border-gray-200 rounded-2xl overflow-hidden p-4 flex gap-4 shadow-xs"
                          >
                            <img 
                              src={prod.images[0]} 
                              alt={prod.name} 
                              referrerPolicy="no-referrer"
                              className="w-16 h-16 rounded-xl object-cover border border-gray-50" 
                            />
                            
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <h5 className="font-semibold text-xs text-gray-950 truncate">{prod.name}</h5>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Stock: {prod.stock}</p>
                                <p className="text-xs font-bold text-gray-900 mt-1">${prod.price}</p>
                              </div>

                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => startEdit(prod)}
                                  className="p-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="p-1.5 rounded-lg bg-rose-50 border border-rose-100/50 text-rose-500 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl text-gray-400">
                        No products inside the catalog.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-6 animate-fade-in" id="settings-tab-form">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="text-sm font-display font-bold text-gray-950">Modify Site Identity & Presentation</h3>
                    </div>
                  </div>

                  {settingsSuccess && (
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl border border-emerald-100 text-xs font-semibold flex items-center gap-1.5 animate-scale-in">
                      <Check className="w-4.5 h-4.5" /> Site configuration changes successfully deployed!
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-8 space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Top Banner Announcement message</label>
                      <input
                        type="text"
                        value={settingsForm.announcementText}
                        onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-gray-400 rounded-xl text-xs font-medium outline-none text-gray-800"
                      />
                    </div>

                    <div className="md:col-span-4 flex items-center pt-6 select-none">
                      <input
                        type="checkbox"
                        id="settings-promo-active"
                        checked={settingsForm.promoActive}
                        onChange={(e) => setSettingsForm({ ...settingsForm, promoActive: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer mr-2"
                      />
                      <label htmlFor="settings-promo-active" className="text-xs font-semibold text-gray-700 cursor-pointer">
                        Enable Announcement Banner
                      </label>
                    </div>

                    <div className="md:col-span-4 space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admin WhatsApp Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. 1234567890"
                        value={settingsForm.adminPhone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, adminPhone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-gray-400 rounded-xl text-xs font-medium outline-none text-gray-800"
                      />
                    </div>

                    <div className="md:col-span-4 space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Theme Accent Color</label>
                      <input
                        type="color"
                        value={settingsForm.accentColor}
                        onChange={(e) => setSettingsForm({ ...settingsForm, accentColor: e.target.value })}
                        className="w-10 h-10 border border-gray-200 rounded-xl cursor-pointer"
                      />
                    </div>

                    <div className="md:col-span-12 space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hero Headline Title</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.heroTitle}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-gray-400 rounded-xl text-xs font-semibold outline-none text-gray-800"
                      />
                    </div>

                    <div className="md:col-span-12 space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hero Subtitle</label>
                      <textarea
                        rows={2}
                        required
                        value={settingsForm.heroSubtitle}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-gray-400 rounded-xl text-xs font-medium outline-none text-gray-800 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="md:col-span-4 space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hero CTA text</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.heroCtaText}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroCtaText: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-gray-400 rounded-xl text-xs font-semibold outline-none text-gray-800"
                      />
                    </div>

                    <div className="md:col-span-8 space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fallback Static Hero Image URL</label>
                      <input
                        type="url"
                        required
                        value={settingsForm.heroImage}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroImage: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-gray-400 rounded-xl text-xs font-semibold outline-none text-gray-800"
                      />
                    </div>

                    <div className="md:col-span-12 border-t border-gray-100 pt-6 space-y-1.5">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Change Passcode</label>
                      <input
                        type="text"
                        placeholder="Type new passcode..."
                        value={settingsForm.newPasscode}
                        onChange={(e) => setSettingsForm({ ...settingsForm, newPasscode: e.target.value })}
                        className="w-full max-w-xs px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-gray-400 rounded-xl text-xs font-mono font-bold outline-none text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="px-6 py-3 text-white text-xs font-semibold tracking-wider uppercase rounded-full cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                      style={{ backgroundColor: accentColor || '#3b82f6' }}
                    >
                      {savingSettings ? 'Deploying...' : 'Deploy Changes'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'media' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-sm font-display font-bold text-gray-950">Store Template Assets Library</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SAMPLE_ASSETS.map((asset, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-100/60 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{asset.name}</p>
                          <p className="text-[10px] text-gray-400 truncate mt-1 font-mono">{asset.url}</p>
                        </div>

                        <button
                          onClick={() => handleCopyUrl(asset.url, idx)}
                          className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                            copiedIndex === idx
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </main>
          </div>
        )}

      </div>
    </div>
  );
};
