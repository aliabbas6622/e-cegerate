import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  writeBatch,
  query,
  limit
} from 'firebase/firestore';
import config from '../firebase-applet-config.json';
import { Product, Category, SiteSettings } from './types';

const app = initializeApp(config);
export const db = getFirestore(app);

// Pre-packaged placeholder premium assets (high-quality clean tech/minimal products)
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'audio', name: 'Audio & Sound', slug: 'audio' },
  { id: 'wearables', name: 'Wearables', slug: 'wearables' },
  { id: 'home', name: 'Home Living', slug: 'home' }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'AeroPods Premium',
    description: 'Experience pure sonic bliss with hybrid active noise cancellation, spatial audio tracking, and up to 40 hours of high-fidelity wireless playback. Crafted with polished aluminum earcups and breathable knit mesh canopy.',
    price: 299,
    originalPrice: 349,
    categoryId: 'audio',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'],
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb', // A valid fallback model for sample
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
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb', // A valid fallback model for sample
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

const DEFAULT_SETTINGS: SiteSettings = {
  id: 'main',
  heroTitle: 'Designed for perfection, built for daily living.',
  heroSubtitle: 'Discover our limited collection of premium minimalist devices engineered with high-end materials and flawless acoustic tuning.',
  heroCtaText: 'Explore Collection',
  heroImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200',
  heroModelActive: true,
  heroModelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
  accentColor: '#3b82f6', // Premium Light Blue
  announcementText: '✨ FREE SHIPPING WORLDWIDE ON ORDERS OVER $150',
  promoActive: true
};

export async function seedDatabase() {
  try {
    const categoriesSnap = await getDocs(query(collection(db, 'categories'), limit(1)));
    if (categoriesSnap.empty) {
      console.log('Database empty, seeding default categories, products, and site settings...');
      
      const batch = writeBatch(db);

      // Seed categories
      DEFAULT_CATEGORIES.forEach((cat) => {
        const docRef = doc(db, 'categories', cat.id);
        batch.set(docRef, cat);
      });

      // Seed products
      DEFAULT_PRODUCTS.forEach((prod) => {
        const docRef = doc(db, 'products', prod.id);
        batch.set(docRef, prod);
      });

      // Seed settings
      const settingsRef = doc(db, 'site_settings', 'main');
      batch.set(settingsRef, DEFAULT_SETTINGS);

      // Seed a default admin passcode
      const authRef = doc(db, 'admin_auth', 'config');
      batch.set(authRef, { passcode: 'admin123' });

      await batch.commit();
      console.log('Seeding completed successfully!');
    } else {
      console.log('Database already has data, skipping seeding.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}
