export type Category = 
  | 'ביגוד'
  | 'הנעלה'
  | 'אקססוריז'
  | 'גיימינג'
  | 'אלקטרוניקה'
  | 'חדר ועיצוב'
  | 'אחר';

export type ItemCondition = 
  | 'חדש באריזה'
  | 'כחדש'
  | 'מצב מצוין'
  | 'משומש בקלות';

export type LanguageCode = 'he' | 'en' | 'ru' | 'ar' | 'fr';

export interface CartItem {
  item: Item;
  quantity: number;
  addedAt: number;
}

export type PaymentMethod = 'bit' | 'paybox' | 'apple_pay' | 'google_pay' | 'credit_card' | 'cash';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  shopName: string;
  bio: string;
  avatar: string;
  followersCount: number;
  following: string[];
  isVip: boolean;
  isFeaturedShop?: boolean;
  featuredShopExpiry?: number;
  createdAt: string;
  cart?: CartItem[];
}

export interface NativeAdData {
  id: string;
  title: string;
  brand: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  linkUrl: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  condition: ItemCondition;
  size?: string;
  imageUrl: string;
  sellerId: string;
  status: 'active' | 'sold';
  isFeatured: boolean;
  createdAt: number;
  likesCount: number;
  likes?: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  itemId?: string;
}

export interface ChatThread {
  id: string;
  participantIds: string[];
  lastMessage?: string;
  lastMessageTime: number;
  referencedItemId?: string;
  unreadCount?: number;
  messages: ChatMessage[];
}

export type TabType = 'profile' | 'feed' | 'add' | 'chat' | 'search';
export type FeedType = 'regular' | 'following';
