import React from 'react';
import { X, ShoppingBag, Check, ShieldCheck, Heart, Sparkles, RefreshCw, Play } from 'lucide-react';
import { Product, Category } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  accentColor: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  categories,
  onClose,
  onAddToCart,
  accentColor
}) => {
  const [quantity, setQuantity] = React.useState(1);
  const [added, setAdded] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'details' | 'specs'>('details');
  const [activeImage, setActiveImage] = React.useState(0);
  const [modelLoading, setModelLoading] = React.useState(true);
  const [modelError, setModelError] = React.useState(false);

  // Reset state when product changes
  React.useEffect(() => {
    setQuantity(1);
    setAdded(false);
    setActiveImage(0);
    setModelLoading(true);
    setModelError(false);
  }, [product]);

  if (!product) return null;

  const categoryName = categories.find((c) => c.id === product.categoryId)?.name || 'Retail Product';
  const hasModel = !!product.modelUrl;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="detail-drawer-root">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white flex flex-col shadow-2xl animate-slide-in relative border-l border-gray-100">
          
          {/* Close trigger */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full cursor-pointer z-20 border border-gray-100"
            id="detail-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable content panel */}
          <div className="flex-1 overflow-y-auto px-6 py-12 md:p-10 space-y-8">
            
            {/* Visual Header / Media Section */}
            <div className="space-y-4">
              {/* Image & 3D Stage */}
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center relative shadow-xs">
                {hasModel && !modelError ? (
                  // Render model-viewer inside details
                  <div className="w-full h-full relative">
                    <model-viewer
                      src={product.modelUrl}
                      poster={product.images[activeImage]}
                      alt={product.name}
                      auto-rotate
                      camera-controls
                      touch-action="pan-y"
                      shadow-intensity="1"
                      exposure="1.1"
                      style={{ width: '100%', height: '100%' }}
                      loading="lazy"
                      id="detail-3d-model"
                      onError={() => setModelError(true)}
                      onLoad={() => setModelLoading(false)}
                    />
                    {modelLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-xs pointer-events-none">
                        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                        <span className="text-xs text-gray-400 mt-2 font-medium">Loading 3D Canvas...</span>
                      </div>
                    )}
                    {!modelLoading && (
                      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-semibold text-gray-400 flex items-center gap-1 border border-gray-100 pointer-events-none uppercase tracking-wider">
                        <Play className="w-3 h-3 text-gray-400 fill-current" /> Explore Interactive 3D Model
                      </div>
                    )}
                  </div>
                ) : (
                  // Simple Static Gallery View
                  <img 
                    src={product.images[activeImage]} 
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-all duration-300"
                    id="detail-main-image"
                  />
                )}
              </div>

              {/* Gallery Thumbnails List */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 scroll-thin">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border cursor-pointer flex-shrink-0 ${
                        activeImage === idx 
                          ? 'border-gray-900 ring-2 ring-gray-100' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Core Info Block */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest uppercase text-gray-400 font-sans">
                  {categoryName}
                </span>
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    <Check className="w-3.5 h-3.5" /> In Stock ({product.stock})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                    Sold Out
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-950 tracking-tight leading-tight">
                {product.name}
              </h2>

              {/* Price Details */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl font-display font-bold text-gray-950">
                  ${product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through font-sans">
                      ${product.originalPrice}
                    </span>
                    <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                      SAVE ${product.originalPrice - product.price}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Segmented Tab Controls */}
            <div className="border-b border-gray-100 flex gap-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer ${
                  activeTab === 'details'
                    ? 'border-gray-950 text-gray-950'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer ${
                  activeTab === 'specs'
                    ? 'border-gray-950 text-gray-950'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Specs & Sustainability
              </button>
            </div>

            {/* Tab content panel */}
            <div className="font-sans text-sm text-gray-500 leading-relaxed min-h-[100px]">
              {activeTab === 'details' ? (
                <p className="whitespace-pre-line">{product.description}</p>
              ) : (
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Materials</h4>
                    <p className="text-gray-700 font-medium">Aircraft-grade aluminum, recycled bio-plastics</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Warranty</h4>
                    <p className="text-gray-700 font-medium">2 Year Limited Global Warranty</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">In the Box</h4>
                    <p className="text-gray-700 font-medium">Product capsule, USB-C braided cable, user guide</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sustainability</h4>
                    <p className="text-gray-700 font-medium">100% carbon-neutral offset shipping</p>
                  </div>
                </div>
              )}
            </div>

            {/* Security Guarantee Pills */}
            <div className="grid grid-cols-2 gap-4 py-4 px-5 bg-gray-50 rounded-xl border border-gray-100/50">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="text-xs font-bold text-gray-800 leading-tight">Secured Ordering</h4>
                  <p className="text-[10px] text-gray-400 font-medium leading-none mt-0.5">Pay with cash on delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="text-xs font-bold text-gray-800 leading-tight">Fast Fulfilment</h4>
                  <p className="text-[10px] text-gray-400 font-medium leading-none mt-0.5">Ships within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Action footer buy bar */}
          <div className="border-t border-gray-100 p-6 bg-white flex items-center gap-4">
            {/* Quantity Picker */}
            {product.stock > 0 && (
              <div className="flex items-center border border-gray-200 rounded-full h-12 overflow-hidden bg-white select-none">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-50 text-gray-600 text-lg transition-colors cursor-pointer"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-3 text-sm font-semibold text-gray-800 min-w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 hover:bg-gray-50 text-gray-600 text-lg transition-colors cursor-pointer"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            )}

            {/* Main Action trigger */}
            {product.stock > 0 ? (
              <button
                onClick={handleAddToCart}
                disabled={added}
                className="flex-1 h-12 rounded-full font-semibold text-sm tracking-wide text-white transition-all transform active:scale-95 duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                style={{ 
                  backgroundColor: added ? '#059669' : (accentColor || '#3b82f6')
                }}
                id="detail-add-to-cart-btn"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-white" />
                    Add to Bag — ${(product.price * quantity).toFixed(2)}
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="flex-1 h-12 rounded-full font-semibold text-sm tracking-wide text-white bg-gray-300 cursor-not-allowed flex items-center justify-center"
              >
                Sold Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
