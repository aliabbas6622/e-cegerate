import React from 'react';
import { ShoppingBag, Shield, Menu, X } from 'lucide-react';
import { SiteSettings } from '../types';

interface NavbarProps {
  settings: SiteSettings;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  activeCategory: string;
  categories: Array<{ id: string; name: string }>;
  onSelectCategory: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  activeCategory,
  categories,
  onSelectCategory
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md transition-all duration-200 border-b border-gray-100">
      {/* Announcement Bar */}
      {settings.promoActive && settings.announcementText && (
        <div 
          className="w-full text-center py-2 px-4 text-xs font-medium tracking-wider text-white select-none transition-all duration-300"
          style={{ backgroundColor: settings.accentColor || '#3b82f6' }}
          id="announcement-bar"
        >
          {settings.announcementText}
        </div>
      )}

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <button 
            onClick={() => onSelectCategory('all')}
            className="text-xl font-display font-bold tracking-tight text-gray-900 cursor-pointer flex items-center gap-1.5"
            id="logo-button"
          >
            <span 
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: settings.accentColor || '#3b82f6' }}
            ></span>
            AESTHETE
          </button>

          {/* Desktop Category Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onSelectCategory('all')}
              className={`text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                activeCategory === 'all' 
                  ? 'text-gray-950 font-semibold' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Shop All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                  activeCategory === cat.id 
                    ? 'text-gray-950 font-semibold' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Action Utilities */}
        <div className="flex items-center gap-3">
          {/* Admin Dashboard Trigger */}
          <button
            onClick={onOpenAdmin}
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-50 cursor-pointer flex items-center gap-1.5 text-xs font-medium border border-gray-100"
            title="Admin Console"
            id="admin-trigger"
          >
            <Shield className="w-4 h-4 text-gray-500" />
            <span className="hidden sm:inline text-gray-600">Admin</span>
          </button>

          {/* Cart Bag Trigger */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 text-gray-700 hover:text-gray-900 transition-all rounded-full hover:bg-gray-50 cursor-pointer border border-gray-100 flex items-center"
            id="cart-trigger"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {cartCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-scale-in"
                style={{ backgroundColor: settings.accentColor || '#3b82f6' }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-900 cursor-pointer"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md px-4 py-3 space-y-2 flex flex-col transition-all duration-300">
          <button
            onClick={() => {
              onSelectCategory('all');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 text-sm font-medium rounded-lg ${
              activeCategory === 'all' 
                ? 'bg-gray-50 text-gray-950 font-semibold' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Shop All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 text-sm font-medium rounded-lg ${
                activeCategory === cat.id 
                  ? 'bg-gray-50 text-gray-950 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
