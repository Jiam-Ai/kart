export interface Review {
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface VariantOption {
  name: string; // e.g., 'Red', 'Large'
  price: number;
  stock: number;
}

export interface Variant {
  type: string; // e.g., 'Color', 'Size'
  options: VariantOption[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number; // This will now be the SALE price if on sale
  originalPrice?: number; // The price before discount
  stock?: number; // Available stock count
  saleEndDate?: string; // ISO date string for flash deals
  images: string[];
  category: string;
  rating: number;
  reviewsCount: number;
  vendor: string;
  sellerId: string;
  variants?: Variant[];
  reviews?: Review[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: { [key: string]: string }; // e.g., { Color: 'Red', Size: 'M' }
  cartItemId: string; // Unique identifier for product + variant combo
}

export type Language = 'en' | 'krio';
export type Theme = 'light' | 'dark';

export interface Seller {
  id: string;
  email: string;
  password: string; // In a real app, this would be a hash
  storeName: string;
}

export interface Buyer {
  id: string;
  email: string;
  password: string; // In a real app, this would be a hash
  fullName: string;
  phoneNumber: string;
}

export interface BuyerInfo {
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
}

export interface Order {
  id: string;
  date: string;
  buyerInfo: BuyerInfo;
  items: CartItem[];
  total: number;
  buyerId?: string; // Link order to a registered buyer
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export type View =
  | 'shop'
  | 'seller'
  | 'auth'
  | 'help-center'
  | 'how-to-buy'
  | 'track-order'
  | 'returns-refunds'
  | 'about-us'
  | 'careers'
  | 'terms-conditions'
  | 'privacy-policy'
  | 'vendor-hub'
  | 'success-stories'
  | 'buyer-dashboard';