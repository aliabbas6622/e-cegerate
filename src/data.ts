import { Product, Category, SiteSettings } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'audio', name: 'Audio & Sound', slug: 'audio' },
  { id: 'wearables', name: 'Wearables', slug: 'wearables' },
  { id: 'home', name: 'Home Living', slug: 'home' }
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'AeroPods Premium',
    description: 'Experience pure sonic bliss with hybrid active noise cancellation, spatial audio tracking, and up to 40 hours of high-fidelity wireless playback. Crafted with polished aluminum earcups and breathable knit mesh canopy.',
    price: 299,
    originalPrice: 349,
    categoryId: 'audio',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'],
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
    stock: 15,
    featured: true,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000
  },
  {
    id: 'prod-2',
    name: 'Horizon Chronograph',
    description: 'A timeless smartwatch featuring an ultra-slim titanium casing, a bright always-on sapphire glass AMOLED screen, and modular medical-grade biometrics tracking.',
    price: 399,
    originalPrice: 449,
    categoryId: 'wearables',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'],
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb',
    stock: 8,
    featured: true,
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000
  },
  {
    id: 'prod-3',
    name: 'Lumina Smart Lamp',
    description: 'Breathe life into your workspace with a beautiful ambient lamp that syncs to your circadian rhythm. Emits full-spectrum, eye-friendly light with seamless touch gestures and smartphone integration.',
    price: 149,
    categoryId: 'home',
    images: ['https://images.unsplash.com/photo-1507646227500-4d389b0012be?auto=format&fit=crop&q=80&w=800'],
    stock: 25,
    featured: true,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
  },
  {
    id: 'prod-6',
    name: 'Apex Mechanical Keyboard',
    description: 'Precision-engineered mechanical keyboard with hot-swappable tactile switches, per-key RGB backlighting, and a solid CNC-machined aluminum frame for ultimate durability and typing comfort.',
    price: 179,
    originalPrice: 199,
    categoryId: 'home',
    images: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800'],
    stock: 12,
    featured: false,
    createdAt: Date.now() - 2.5 * 24 * 60 * 60 * 1000
  },
  {
    id: 'prod-7',
    name: 'Nova Noise-Cancelling Buds',
    description: 'Ultra-lightweight true wireless earbuds with custom-tuned 11mm drivers, advanced adaptive ANC, and 6-microphone system for crystal-clear calls in any environment.',
    price: 159,
    categoryId: 'audio',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800'],
    stock: 35,
    featured: true,
    createdAt: Date.now() - 2.2 * 24 * 60 * 60 * 1000
  },
  {
    id: 'prod-8',
    name: 'Zenith Charging Hub',
    description: 'The ultimate power station for your ecosystem. Delivers 100W GaN fast charging across 3 USB-C ports and a dedicated 15W MagSafe-compatible wireless pad.',
    price: 99,
    originalPrice: 129,
    categoryId: 'home',
    images: ['https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&q=80&w=800'],
    stock: 50,
    featured: false,
    createdAt: Date.now() - 1.5 * 24 * 60 * 60 * 1000
  },
  {
    id: 'prod-9',
    name: 'Vanguard Field Watch',
    description: 'Rugged elegance meets modern utility. Features a scratch-resistant DLC-coated stainless steel case, hybrid analog-digital movement, and a durable FKM rubber strap.',
    price: 249,
    categoryId: 'wearables',
    images: ['https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=800'],
    stock: 20,
    featured: true,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000
  },
  {
    id: 'prod-4',
    name: 'Soma Premium Stand',
    description: 'A minimalist oakwood charging stand designed to mount your phone, watch, and earbuds in a singular, sculptural profile. Includes certified fast wireless charging coils.',
    price: 89,
    originalPrice: 110,
    categoryId: 'home',
    images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800'],
    stock: 30,
    featured: false,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000
  },
  {
    id: 'prod-5',
    name: 'Echo Pro Earbuds',
    description: 'Immersive sound packed in a water-resistant, pocket-sized capsule. Includes smart touch controls and advanced dual-beamforming microphones for crystal clear audio quality.',
    price: 129,
    originalPrice: 159,
    categoryId: 'audio',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800'],
    stock: 40,
    featured: false,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000
  }
];

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 'main',
  heroTitle: 'Designed for perfection, built for daily living.',
  heroSubtitle: 'Discover our limited collection of premium minimalist devices engineered with high-end materials and flawless acoustic tuning.',
  heroCtaText: 'Explore Collection',
  heroImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200',
  heroModelActive: true,
  heroModelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
  accentColor: '#3b82f6',
  announcementText: '✨ FREE SHIPPING WORLDWIDE ON ORDERS OVER $150',
  promoActive: true,
  adminPhone: '1234567890'
};
