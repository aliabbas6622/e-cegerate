import React from 'react';
import { Search, SlidersHorizontal, Plus, Sparkles } from 'lucide-react';
import { Product, Category } from '../types';

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  accentColor: string;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  activeCategory,
  onSelectCategory,
  onProductClick,
  onAddToCart,
  accentColor
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');

  // Filter & Sort Logic
  const filteredProducts = React.useMemo(() => {
    return products
      .filter((prod) => {
        const matchesCategory = activeCategory === 'all' || prod.categoryId === activeCategory;
        const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              prod.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return b.createdAt - a.createdAt;
        // Default: featured first, then newest
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.createdAt - a.createdAt;
      });
  }, [products, activeCategory, searchQuery, sortBy]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-12 animate-fade-in" id="catalog-section">
      {/* Title & Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-100 pb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight" id="catalog-header-title">
            Our Collection
          </h2>
          <p className="text-sm text-gray-400 mt-1 font-medium font-sans">
            Meticulously engineered products designed for minimalist everyday utility.
          </p>
        </div>

        {/* Dynamic Catalog Category Tabs for Desktop */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Utilities and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        {/* Search input */}
        <div className="relative md:col-span-8 flex items-center">
          <Search className="absolute left-4 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products, specifications, acoustic systems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-gray-400 rounded-xl text-sm font-medium transition-colors outline-none text-gray-800 placeholder-gray-400 font-sans"
            id="product-search-input"
          />
        </div>

        {/* Sort selector */}
        <div className="relative md:col-span-4 flex items-center">
          <SlidersHorizontal className="absolute left-4 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-gray-400 rounded-xl text-sm font-medium transition-colors outline-none text-gray-700 cursor-pointer appearance-none font-sans"
            id="product-sort-select"
          >
            <option value="featured">Featured Collection</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
          <div className="absolute right-4 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-400 w-0 h-0" />
        </div>
      </div>

      {/* Active filters count notification */}
      {searchQuery && (
        <div className="text-xs text-gray-400 mb-6 flex items-center gap-2">
          <span>Found {filteredProducts.length} results for "{searchQuery}"</span>
          <button 
            onClick={() => setSearchQuery('')}
            className="text-gray-600 hover:underline font-semibold"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Catalog Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" id="product-grid">
          {filteredProducts.map((prod) => {
            const isDiscounted = prod.originalPrice && prod.originalPrice > prod.price;
            const discountPercent = isDiscounted 
              ? Math.round(((prod.originalPrice! - prod.price) / prod.originalPrice!) * 100)
              : 0;

            return (
              <div
                key={prod.id}
                onClick={() => onProductClick(prod)}
                className="group flex flex-col justify-between bg-white rounded-2xl overflow-hidden border border-gray-100/50 hover:border-gray-200/80 hover:shadow-xl shadow-xs transition-all duration-300 cursor-pointer relative"
                id={`product-card-${prod.id}`}
              >
                <div>
                  {/* Image container */}
                  <div className="aspect-square w-full bg-gray-50/50 flex items-center justify-center overflow-hidden relative border-b border-gray-100/30">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                    />

                    {/* Left overlay labels: stock and discount */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                      {prod.featured && (
                        <span 
                          className="px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase text-white rounded-full flex items-center gap-1 shadow-sm"
                          style={{ backgroundColor: accentColor || '#3b82f6' }}
                        >
                          <Sparkles className="w-2.5 h-2.5" /> Featured
                        </span>
                      )}
                      {isDiscounted && (
                        <span className="bg-rose-500 text-white px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase rounded-full shadow-sm">
                          Save {discountPercent}%
                        </span>
                      )}
                    </div>

                    {/* Stock level indicators */}
                    {prod.stock === 0 ? (
                      <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-4 py-2 bg-gray-900 text-white text-xs font-bold tracking-wider uppercase rounded-full">
                          Sold Out
                        </span>
                      </div>
                    ) : prod.stock <= 3 ? (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-amber-500/90 text-white px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-md backdrop-blur-xs">
                          Only {prod.stock} Left
                        </span>
                      </div>
                    ) : null}

                    {/* Quick 3D Indicator Badge */}
                    {prod.modelUrl && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs p-1.5 rounded-full border border-gray-100 text-gray-500 hover:text-gray-900 hover:scale-110 transition-all shadow-xs" title="Includes interactive 3D model">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 11v5M4 8h16M4 12h16M4 16h16M4 20h16" />
                          <circle cx="12" cy="12" r="3" strokeWidth={2} />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Text Description Block */}
                  <div className="p-6">
                    {/* Category Category String */}
                    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 font-sans mb-1">
                      {categories.find((c) => c.id === prod.categoryId)?.name || 'Retail product'}
                    </p>

                    {/* Title */}
                    <h3 className="text-lg font-display font-semibold text-gray-950 tracking-tight leading-tight group-hover:text-gray-900 mb-2">
                      {prod.name}
                    </h3>

                    {/* Limited preview description */}
                    <p className="text-xs text-gray-400 font-sans line-clamp-2 leading-relaxed mb-4">
                      {prod.description}
                    </p>
                  </div>
                </div>

                {/* Footer price & Add to Cart button bar */}
                <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-gray-50/50">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-display font-bold text-gray-950">
                      ${prod.price}
                    </span>
                    {isDiscounted && (
                      <span className="text-xs text-gray-400 line-through font-sans">
                        ${prod.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart quick button */}
                  {prod.stock > 0 && (
                    <button
                      onClick={(e) => onAddToCart(prod, e)}
                      className="p-2.5 rounded-full bg-gray-50 border border-gray-100 text-gray-700 hover:text-white hover:border-transparent transition-all cursor-pointer shadow-xs active:scale-95 duration-200 flex items-center justify-center group/btn"
                      style={{ 
                        // Set background-color hover via custom dynamic inline rule
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = accentColor;
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.color = '#374151';
                      }}
                      title="Quick Add to Cart"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Empty catalog fallback
        <div className="flex flex-col items-center justify-center py-20 text-center" id="catalog-empty-fallback">
          <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-4 font-mono text-xl">?</div>
          <h3 className="text-lg font-display font-semibold text-gray-900 mb-1">No products found</h3>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            There are no products matching your active criteria. Try choosing a different category or clearing search keywords.
          </p>
        </div>
      )}
    </section>
  );
};
