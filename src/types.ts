export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  images: string[];
  modelUrl?: string; // Optional 3D Model GLB/GLTF URL
  stock: number;
  featured: boolean;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod'; // Cash on delivery
  createdAt: number;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'model';
  createdAt: number;
}

export interface SiteSettings {
  id: string; // usually 'main'
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroImage: string; // Fallback image
  heroModelActive: boolean;
  heroModelUrl: string; // 3D model URL
  accentColor: string; // e.g. '#60a5fa' (light blue)
  announcementText: string;
  promoActive: boolean;
}
