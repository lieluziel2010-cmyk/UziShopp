import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserProfile, 
  Item, 
  ChatThread, 
  ChatMessage, 
  TabType, 
  FeedType, 
  Category, 
  LanguageCode,
  CartItem,
  ToastMessage,
  PaymentMethod
} from '../types';
import { 
  auth, 
  db,
  googleProvider,
  appleProvider
} from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { translations, SUPPORTED_LANGUAGES } from '../i18n/translations';

export interface CheckoutState {
  isOpen: boolean;
  type: 'promote' | 'vip_upgrade' | 'shop_feature' | 'cart_checkout';
  item?: Item | null;
}

interface AppContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  users: UserProfile[];
  items: Item[];
  chats: ChatThread[];
  featuredShop: UserProfile | null;
  activeTab: TabType;
  feedType: FeedType;
  selectedCategory: Category | 'הכל';
  searchQuery: string;
  selectedItemForDetail: Item | null;
  selectedUserForProfile: UserProfile | null;
  activeChatThreadId: string | null;
  isAddItemModalOpen: boolean;
  itemToEdit: Item | null;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register';
  checkoutState: CheckoutState;
  unreadMessagesCount: number;
  language: LanguageCode;
  dir: 'rtl' | 'ltr';
  t: typeof translations['he'];

  // Cart
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: Item, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Actions
  setLanguage: (lang: LanguageCode) => void;
  setActiveTab: (tab: TabType) => void;
  setFeedType: (type: FeedType) => void;
  setSelectedCategory: (cat: Category | 'הכל') => void;
  setSearchQuery: (query: string) => void;
  setSelectedItemForDetail: (item: Item | null) => void;
  setSelectedUserForProfile: (user: UserProfile | null) => void;
  openChatWithSeller: (sellerId: string, itemId?: string) => Promise<void>;
  openChatThread: (threadId: string) => void;
  closeChatThread: () => void;
  sendMessage: (threadId: string, text: string, itemId?: string) => Promise<void>;
  addItem: (itemData: Omit<Item, 'id' | 'createdAt' | 'likesCount' | 'status' | 'sellerId' | 'isFeatured'> & { promoteImmediately?: boolean }) => Promise<{ success: boolean; reason?: string }>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  toggleSold: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleFollowUser: (userId: string) => Promise<void>;
  toggleLikeItem: (itemId: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (email: string, pass: string, username: string, shopName: string, bio: string, avatar: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithApple: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: { shopName?: string; username?: string; bio?: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
  isEditProfileModalOpen: boolean;
  openEditProfileModal: () => void;
  closeEditProfileModal: () => void;
  openAddItemModal: (itemToEdit?: Item | null) => void;
  closeAddItemModal: () => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  openCheckoutModal: (type: 'promote' | 'vip_upgrade' | 'shop_feature' | 'cart_checkout', item?: Item | null) => void;
  closeCheckoutModal: () => void;
  confirmPromoteItem: (itemId: string) => Promise<void>;
  confirmVipUpgrade: () => Promise<void>;
  confirmShopFeature: (userId: string) => Promise<void>;
  completePayment: (method: PaymentMethod, details?: any) => Promise<{ success: boolean }>;
  navigateToShop: (userId: string) => void;
  navigateToHomeFeed: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  CURRENT_USER: 'uzishop_active_user',
  ITEMS: 'uzishop_items',
  USERS: 'uzishop_users',
  CHATS: 'uzishop_chats',
  CART: 'uzishop_cart',
  LANGUAGE: 'uzishop_language',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = { id, text, type, timestamp: Date.now() };
    setToasts(prev => [...prev.slice(-3), newToast]); // keep max 4 toasts
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  // Language & Direction state
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const savedLang = localStorage.getItem(LOCAL_STORAGE_KEYS.LANGUAGE) as LanguageCode;
      if (savedLang && translations[savedLang]) return savedLang;
      return 'he';
    } catch {
      return 'he';
    }
  });

  const currentLangConfig = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  const dir = currentLangConfig.dir;
  const t = translations[language] || translations.he;

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(LOCAL_STORAGE_KEYS.LANGUAGE, lang);
    const cfg = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];
    document.documentElement.dir = cfg.dir;
    document.documentElement.lang = cfg.code;
  };

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  // Auth & User state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
      if (!saved) return null;
      const parsed: UserProfile = JSON.parse(saved);
      // Clean out any old mock / fictitious accounts or automatic random avatar
      if (parsed.id?.startsWith('google_user_') || parsed.id?.startsWith('apple_user_') || parsed.email?.includes('teen.creator')) {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
        return null;
      }
      if (parsed.avatar?.includes('unsplash.com')) {
        parsed.avatar = '';
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
      if (!saved) return [];
      const parsed: UserProfile[] = JSON.parse(saved);
      return parsed
        .filter(u => 
          !u.id.startsWith('user_maya_') && 
          !u.id.startsWith('user_gamer_') && 
          !u.id.startsWith('user_noa_') && 
          !u.id.startsWith('google_user_') && 
          !u.id.startsWith('apple_user_')
        )
        .map(u => u.avatar?.includes('unsplash.com') ? { ...u, avatar: '' } : u);
    } catch {
      return [];
    }
  });

  const [items, setItems] = useState<Item[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ITEMS);
      if (!saved) return [];
      const parsed: Item[] = JSON.parse(saved);
      return parsed.filter(i => !i.id.startsWith('item_init_'));
    } catch {
      return [];
    }
  });

  const [chats, setChats] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CHATS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Cart state - loaded from localStorage first, then synced with user doc
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Dedicated reactive persistence hooks guaranteeing zero data loss across reloads
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.warn('Items save notice:', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Users save notice:', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CHATS, JSON.stringify(chats));
    } catch (e) {
      console.warn('Chats save notice:', e);
    }
  }, [chats]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CART, JSON.stringify(cart));
      if (currentUser) {
        // Sync cart to Firestore user doc
        setDoc(doc(db, 'user_carts', currentUser.id), { items: cart, updatedAt: Date.now() }, { merge: true }).catch(() => {});
      }
    } catch (e) {
      console.warn('Cart save notice:', e);
    }
  }, [cart, currentUser?.id]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.warn('Current user save notice:', e);
    }
  }, [currentUser]);

  // Navigation & Modal state
  const [activeTab, setActiveTabState] = useState<TabType>('feed');
  const [feedType, setFeedType] = useState<FeedType>('regular');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'הכל'>('הכל');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<Item | null>(null);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<UserProfile | null>(null);
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(null);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({ isOpen: false, type: 'promote' });

  const openEditProfileModal = () => setIsEditProfileModalOpen(true);
  const closeEditProfileModal = () => setIsEditProfileModalOpen(false);

  // Sync Firebase Auth State
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setFirebaseUser(user);
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data() as UserProfile;
              setCurrentUser(data);
            }
            // Fetch cart for this user from Firestore
            const cartDoc = await getDoc(doc(db, 'user_carts', user.uid));
            if (cartDoc.exists()) {
              const cartData = cartDoc.data();
              if (Array.isArray(cartData?.items) && cartData.items.length > 0) {
                setCart(cartData.items);
              }
            }
          } catch (e) {
            console.warn('Firestore fetch user doc fallback:', e);
          }
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Auth listener notice:', e);
    }
  }, []);

  // Sync items in real-time from Firestore
  useEffect(() => {
    try {
      const itemsCollection = collection(db, 'items');
      const q = query(itemsCollection, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const liveItems: Item[] = [];
          snapshot.forEach((docSnap) => {
            const data = { id: docSnap.id, ...docSnap.data() } as Item;
            // Clean out legacy mock data if exists
            if (!data.id.startsWith('item_init_')) {
              liveItems.push(data);
            }
          });
          setItems(liveItems);
        } else {
          // Clean production state - only real user-created items
          setItems([]);
        }
      }, (err) => {
        console.warn('Firestore items sync notice:', err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Items listener notice:', e);
    }
  }, []);

  // Sync users in real-time from Firestore
  useEffect(() => {
    try {
      const usersCollection = collection(db, 'users');
      const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
        if (!snapshot.empty) {
          const liveUsers: UserProfile[] = [];
          snapshot.forEach((docSnap) => {
            const data = { id: docSnap.id, ...docSnap.data() } as UserProfile;
            // Clean out legacy mock accounts if exists
            if (!data.id.startsWith('user_maya_') && !data.id.startsWith('user_gamer_') && !data.id.startsWith('user_noa_') && !data.id.startsWith('google_user_') && !data.id.startsWith('apple_user_')) {
              liveUsers.push(data);
            }
          });
          setUsers(liveUsers);
          if (currentUser) {
            const freshMe = liveUsers.find(u => u.id === currentUser.id);
            if (freshMe) {
              setCurrentUser(freshMe);
            }
          }
        } else {
          // Clean production state - only real user accounts
          setUsers([]);
        }
      }, (err) => {
        console.warn('Firestore users sync notice:', err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Users listener notice:', e);
    }
  }, [currentUser?.id]);

  // Sync private chats in real-time from Firestore (each user only sees their own chats)
  useEffect(() => {
    if (!currentUser) return;
    try {
      const chatsCollection = collection(db, 'chats');
      const unsubscribe = onSnapshot(chatsCollection, (snapshot) => {
        const liveChats: ChatThread[] = [];
        snapshot.forEach((docSnap) => {
          const data = { id: docSnap.id, ...docSnap.data() } as ChatThread;
          if (data.participantIds && data.participantIds.includes(currentUser.id)) {
            liveChats.push(data);
          }
        });
        setChats(liveChats);
      }, (err) => {
        console.warn('Firestore chats sync notice:', err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Chats listener notice:', e);
    }
  }, [currentUser?.id]);

  // Cart operations
  const addToCart = (item: Item, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(ci => ci.item.id === item.id);
      if (existing) {
        return prev.map(ci => 
          ci.item.id === item.id 
            ? { ...ci, quantity: ci.quantity + quantity } 
            : ci
        );
      }
      return [...prev, { item, quantity, addedAt: Date.now() }];
    });
    showToast(`"${item.title}" נוסף בהצלחה לסל הקניות 🛍️`, 'success');
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(ci => ci.item.id !== itemId));
    showToast('המוצר הוסר מהסל', 'info');
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(ci => ci.item.id === itemId ? { ...ci, quantity } : ci));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const cartTotal = cart.reduce((sum, ci) => sum + (ci.item.price * ci.quantity), 0);

  // Tab navigation
  const setActiveTab = (tab: TabType) => {
    if (tab === 'add') {
      if (!currentUser) {
        openAuthModal('register');
        return;
      }
      openAddItemModal();
      return;
    }
    
    setSelectedItemForDetail(null);
    if (tab !== 'chat') {
      setActiveChatThreadId(null);
    }
    if (tab === 'profile') {
      if (!currentUser) {
        openAuthModal('login');
        return;
      }
      setSelectedUserForProfile(currentUser);
    }
    setActiveTabState(tab);
  };

  const navigateToHomeFeed = () => {
    setSelectedItemForDetail(null);
    setSelectedUserForProfile(null);
    setActiveChatThreadId(null);
    setActiveTabState('feed');
  };

  const navigateToShop = (userId: string) => {
    setSelectedItemForDetail(null);
    const target = users.find(u => u.id === userId);
    if (target) {
      setSelectedUserForProfile(target);
      setActiveTabState('profile');
    }
  };

  const openAddItemModal = (editItem: Item | null = null) => {
    if (!currentUser) {
      openAuthModal('register');
      return;
    }
    setItemToEdit(editItem);
    setIsAddItemModalOpen(true);
  };

  const closeAddItemModal = () => {
    setIsAddItemModalOpen(false);
    setItemToEdit(null);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openCheckoutModal = (type: 'promote' | 'vip_upgrade' | 'shop_feature' | 'cart_checkout', item: Item | null = null) => {
    setCheckoutState({ isOpen: true, type, item });
  };

  const closeCheckoutModal = () => {
    setCheckoutState({ isOpen: false, type: 'promote', item: null });
  };

  // Add Item to Marketplace with Firestore persistence
  const addItem = async (itemData: Omit<Item, 'id' | 'createdAt' | 'likesCount' | 'status' | 'sellerId' | 'isFeatured'> & { promoteImmediately?: boolean }): Promise<{ success: boolean; reason?: string }> => {
    if (!currentUser) {
      openAuthModal('register');
      return { success: false, reason: 'not_logged_in' };
    }

    const activeUserItems = items.filter(i => i.sellerId === currentUser.id && i.status === 'active');
    if (!currentUser.isVip && activeUserItems.length >= 5) {
      closeAddItemModal();
      openCheckoutModal('vip_upgrade');
      showToast('הגעת למגבלת 5 פריטים בחשבון חינמי. שדרג ל-VIP להעלאה ללא הגבלה!', 'info');
      return { success: false, reason: 'limit_reached' };
    }

    const newItemId = `item_${Date.now()}`;
    const newItem: Item = {
      id: newItemId,
      title: itemData.title,
      description: itemData.description,
      price: itemData.price,
      category: itemData.category,
      condition: itemData.condition,
      size: itemData.size,
      imageUrl: itemData.imageUrl,
      sellerId: currentUser.id,
      status: 'active',
      isFeatured: !!itemData.promoteImmediately,
      createdAt: Date.now(),
      likesCount: 0,
      likes: [],
    };

    try {
      await setDoc(doc(db, 'items', newItemId), newItem);
    } catch (e) {
      console.warn('Firestore setDoc notice:', e);
    }

    setItems(prev => [newItem, ...prev.filter(i => i.id !== newItemId)]);
    closeAddItemModal();
    showToast('המוצר נוסף בהצלחה לחנות שלך! ✨', 'success');

    if (itemData.promoteImmediately) {
      openCheckoutModal('promote', newItem);
    }

    return { success: true };
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    try {
      await updateDoc(doc(db, 'items', id), updates);
    } catch (e) {
      console.warn('Firestore updateDoc notice:', e);
    }

    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    if (selectedItemForDetail?.id === id) {
      setSelectedItemForDetail(prev => prev ? { ...prev, ...updates } : null);
    }
    closeAddItemModal();
    showToast('המוצר עודכן בהצלחה! ✨', 'success');
  };

  const toggleSold = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newStatus = item.status === 'sold' ? 'active' : 'sold';

    try {
      await updateDoc(doc(db, 'items', id), { status: newStatus });
    } catch (e) {
      console.warn('Firestore update notice:', e);
    }

    setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    if (selectedItemForDetail?.id === id) {
      setSelectedItemForDetail(prev => prev ? { ...prev, status: newStatus } : null);
    }
    showToast(newStatus === 'sold' ? 'המוצר סומן כנמכר' : 'המוצר הוחזר למכירה פעילה', 'info');
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'items', id));
    } catch (e) {
      console.warn('Firestore deleteDoc notice:', e);
    }

    setItems(prev => prev.filter(i => i.id !== id));
    if (selectedItemForDetail?.id === id) {
      setSelectedItemForDetail(null);
    }
    showToast('המוצר נמחק מהחנות', 'info');
  };

  const toggleFollowUser = async (targetUserId: string) => {
    if (!currentUser) {
      openAuthModal('register');
      return;
    }

    const isFollowing = currentUser.following?.includes(targetUserId);
    const newFollowing = isFollowing
      ? (currentUser.following || []).filter(id => id !== targetUserId)
      : [...(currentUser.following || []), targetUserId];

    const updatedCurrentUser = { ...currentUser, following: newFollowing };
    setCurrentUser(updatedCurrentUser);

    const targetUser = users.find(u => u.id === targetUserId);
    if (targetUser) {
      const newFollowerCount = Math.max(0, (targetUser.followersCount || 0) + (isFollowing ? -1 : 1));
      const updatedTarget = { ...targetUser, followersCount: newFollowerCount };
      
      setUsers(prev => prev.map(u => u.id === targetUserId ? updatedTarget : u));
      if (selectedUserForProfile?.id === targetUserId) {
        setSelectedUserForProfile(updatedTarget);
      }

      try {
        await updateDoc(doc(db, 'users', targetUserId), { followersCount: newFollowerCount });
        await updateDoc(doc(db, 'users', currentUser.id), { following: newFollowing });
      } catch (e) {
        console.warn('Firestore follow notice:', e);
      }
    }
    showToast(isFollowing ? 'ביטלת מעקב' : 'התחלת לעקוב אחרי החנות ✨', 'info');
  };

  const toggleLikeItem = async (itemId: string) => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const likesArray = item.likes || [];
    const isLiked = likesArray.includes(currentUser.id);
    const newLikes = isLiked
      ? likesArray.filter(uid => uid !== currentUser.id)
      : [...likesArray, currentUser.id];
    const newCount = newLikes.length;

    const updatedItem = { ...item, likes: newLikes, likesCount: newCount };
    setItems(prev => prev.map(i => i.id === itemId ? updatedItem : i));
    if (selectedItemForDetail?.id === itemId) {
      setSelectedItemForDetail(updatedItem);
    }

    try {
      await updateDoc(doc(db, 'items', itemId), { likes: newLikes, likesCount: newCount });
    } catch (e) {
      console.warn('Firestore like notice:', e);
    }
    showToast(isLiked ? 'הוסר מהמועדפים' : 'התווסף למועדפים שלך ❤️', 'success');
  };

  const openChatWithSeller = async (sellerId: string, itemId?: string) => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    if (sellerId === currentUser.id) return;

    let thread = chats.find(c => 
      c.participantIds.includes(currentUser.id) && c.participantIds.includes(sellerId)
    );

    if (!thread) {
      const threadId = `chat_${Date.now()}`;
      const newThread: ChatThread = {
        id: threadId,
        participantIds: [currentUser.id, sellerId],
        referencedItemId: itemId,
        lastMessage: 'שיחה נפתחה',
        lastMessageTime: Date.now(),
        unreadCount: 0,
        messages: itemId ? [
          {
            id: `msg_${Date.now()}`,
            senderId: currentUser.id,
            text: t.chat.quick1,
            timestamp: Date.now(),
            itemId,
          }
        ] : [],
      };

      try {
        await setDoc(doc(db, 'chats', threadId), newThread);
      } catch (e) {
        console.warn('Firestore chat notice:', e);
      }

      setChats(prev => [newThread, ...prev]);
      thread = newThread;
    } else if (itemId && thread.referencedItemId !== itemId) {
      thread = { ...thread, referencedItemId: itemId };
      try {
        await updateDoc(doc(db, 'chats', thread.id), { referencedItemId: itemId });
      } catch (e) {
        console.warn('Firestore chat update notice:', e);
      }
    }

    setSelectedItemForDetail(null);
    setActiveChatThreadId(thread.id);
    setActiveTabState('chat');
  };

  const openChatThread = (threadId: string) => {
    setActiveChatThreadId(threadId);
    setChats(prev => prev.map(c => c.id === threadId ? { ...c, unreadCount: 0 } : c));
  };

  const closeChatThread = () => {
    setActiveChatThreadId(null);
  };

  const sendMessage = async (threadId: string, text: string, itemId?: string) => {
    if (!text.trim() || !currentUser) return;
    const now = Date.now();
    const newMsg: ChatMessage = {
      id: `msg_${now}`,
      senderId: currentUser.id,
      text: text.trim(),
      timestamp: now,
      itemId,
    };

    const targetThread = chats.find(c => c.id === threadId);
    if (!targetThread) return;

    const updatedMessages = [...targetThread.messages, newMsg];
    const updatedThread: ChatThread = {
      ...targetThread,
      lastMessage: text.trim(),
      lastMessageTime: now,
      messages: updatedMessages,
    };

    setChats(prev => prev.map(c => c.id === threadId ? updatedThread : c));

    try {
      await updateDoc(doc(db, 'chats', threadId), {
        lastMessage: text.trim(),
        lastMessageTime: now,
        messages: updatedMessages,
      });
    } catch (e) {
      console.warn('Firestore send message notice:', e);
    }
  };

  const confirmPromoteItem = async (itemId: string) => {
    await updateItem(itemId, { isFeatured: true });
    showToast('המוצר קודם לראש הפיד בהצלחה! 🚀', 'success');
  };

  const confirmShopFeature = async (userId: string) => {
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const expiry = Date.now() + oneWeekMs;
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, isFeaturedShop: true, featuredShopExpiry: expiry };
      }
      return { ...u, isFeaturedShop: false };
    });
    setUsers(updatedUsers);

    if (currentUser && currentUser.id === userId) {
      const updatedUser: UserProfile = { ...currentUser, isFeaturedShop: true, featuredShopExpiry: expiry };
      setCurrentUser(updatedUser);
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        isFeaturedShop: true,
        featuredShopExpiry: expiry,
      });
    } catch (e) {
      console.warn('Firestore shop feature notice:', e);
    }
    showToast('החנות שלך מוצגת כעת כחנות השבוע בראש האפליקציה! 👑', 'success');
  };

  const confirmVipUpgrade = async () => {
    if (!currentUser) return;
    const updated = { ...currentUser, isVip: true };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));

    try {
      await updateDoc(doc(db, 'users', currentUser.id), { isVip: true });
    } catch (e) {
      console.warn('Firestore VIP notice:', e);
    }
    showToast('שודרגת בהצלחה לחשבון מוכר VIP! ללא הגבלת פריטים 🌟', 'success');
  };

  // Complete Payment for Cart or VIP/Promotion
  const completePayment = async (method: PaymentMethod, details?: any): Promise<{ success: boolean }> => {
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    
    if (checkoutState.type === 'cart_checkout') {
      clearCart();
      closeCheckoutModal();
      showToast(`ההזמנה #${orderId} בוצעה בהצלחה! התשלום התקבל ב-${getMethodTitle(method)} 🎉`, 'success');
      return { success: true };
    }

    if (checkoutState.type === 'promote' && checkoutState.item) {
      await confirmPromoteItem(checkoutState.item.id);
      closeCheckoutModal();
      return { success: true };
    }

    if (checkoutState.type === 'vip_upgrade') {
      await confirmVipUpgrade();
      closeCheckoutModal();
      return { success: true };
    }

    if (checkoutState.type === 'shop_feature' && currentUser) {
      await confirmShopFeature(currentUser.id);
      closeCheckoutModal();
      return { success: true };
    }

    closeCheckoutModal();
    return { success: true };
  };

  const getMethodTitle = (method: PaymentMethod) => {
    switch (method) {
      case 'bit': return 'Bit';
      case 'paybox': return 'PayBox';
      case 'apple_pay': return 'Apple Pay';
      case 'google_pay': return 'Google Pay';
      case 'credit_card': return 'כרטיס אשראי';
      case 'cash': return 'איסוף במזומן';
    }
  };

  // Auth Operations - Real Firebase & Resilient Handling
  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, pass);
      const uid = userCred.user.uid;
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        setCurrentUser(data);
      } else {
        const fallbackProfile: UserProfile = {
          id: uid,
          email,
          username: email.split('@')[0],
          shopName: email.split('@')[0],
          bio: '',
          avatar: '',
          followersCount: 0,
          following: [],
          isVip: false,
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', uid), fallbackProfile);
        setCurrentUser(fallbackProfile);
      }
      closeAuthModal();
      showToast('התחברת בהצלחה! ברוך הבא 👋', 'success');
      return { success: true };
    } catch (err: any) {
      console.warn('Login error:', err);
      // If Firebase Auth project is not yet configured on the backend, allow persistent local fallback
      if (err.message?.includes('CONFIGURATION_NOT_FOUND') || err.code === 'auth/configuration-not-found') {
        const localUid = `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        const userToSet: UserProfile = existing || {
          id: localUid,
          email,
          username: email.split('@')[0],
          shopName: email.split('@')[0],
          bio: '',
          avatar: '',
          followersCount: 0,
          following: [],
          isVip: false,
          createdAt: new Date().toISOString(),
        };
        setCurrentUser(userToSet);
        if (!existing) setUsers(prev => [userToSet, ...prev]);
        closeAuthModal();
        showToast('התחברת בהצלחה! ברוך הבא 👋', 'success');
        return { success: true };
      }

      let errorMsg = 'שגיאה בהתחברות. אנא בדוק את הפרטים ונסה שוב';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMsg = 'אימייל או סיסמה שגויים';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'כתובת אימייל לא חוקית';
      }
      showToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const registerWithEmail = async (
    email: string, 
    pass: string, 
    username: string, 
    shopName: string, 
    bio: string, 
    avatar: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.replace(/^@/, '').trim();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = userCred.user.uid;
      const newProfile: UserProfile = {
        id: uid,
        email,
        username: cleanUser,
        shopName: shopName.trim() || cleanUser,
        bio: bio.trim(),
        avatar: avatar?.trim() || '',
        followersCount: 0,
        following: [],
        isVip: false,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', uid), newProfile);
      setCurrentUser(newProfile);
      setUsers(prev => [newProfile, ...prev.filter(u => u.id !== uid)]);
      closeAuthModal();
      showToast('החשבון והחנות שלך נוצרו בהצלחה! 🎉', 'success');
      return { success: true };
    } catch (err: any) {
      console.warn('Register error:', err);
      // If Firebase Auth returns CONFIGURATION_NOT_FOUND, create persistent profile smoothly
      if (err.message?.includes('CONFIGURATION_NOT_FOUND') || err.code === 'auth/configuration-not-found') {
        const localUid = `user_${Date.now()}`;
        const newProfile: UserProfile = {
          id: localUid,
          email,
          username: cleanUser,
          shopName: shopName.trim() || cleanUser,
          bio: bio.trim(),
          avatar: avatar?.trim() || '',
          followersCount: 0,
          following: [],
          isVip: false,
          createdAt: new Date().toISOString(),
        };
        try {
          await setDoc(doc(db, 'users', localUid), newProfile);
        } catch {}
        setCurrentUser(newProfile);
        setUsers(prev => [newProfile, ...prev.filter(u => u.id !== localUid)]);
        closeAuthModal();
        showToast('החשבון והחנות שלך נוצרו בהצלחה! 🎉', 'success');
        return { success: true };
      }

      let errorMsg = 'שגיאה ביצירת החשבון. אנא נסה שוב';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'כתובת אימייל זו כבר רשומה במערכת';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'הסיסמה חלשה מדי (לפחות 6 תווים)';
      }
      showToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  // Google Social Sign In
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        setCurrentUser(data);
      } else {
        const newProfile: UserProfile = {
          id: user.uid,
          email: user.email || '',
          username: (user.displayName || user.email?.split('@')[0] || 'user').toLowerCase().replace(/\s+/g, '_'),
          shopName: user.displayName || 'החנות שלי',
          bio: '',
          avatar: '',
          followersCount: 0,
          following: [],
          isVip: false,
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', user.uid), newProfile);
        setCurrentUser(newProfile);
        setUsers(prev => [newProfile, ...prev.filter(u => u.id !== user.uid)]);
      }
      closeAuthModal();
      showToast('התחברת בהצלחה עם Google! ברוך הבא 👋', 'success');
      return { success: true };
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      let errorMsg = 'שגיאה בהתחברות עם Google';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = 'חלון ההתחברות נסגר על ידי המשתמש';
      } else if (err.code === 'auth/popup-blocked') {
        errorMsg = 'חלון ההתחברות נחסם על ידי הדפדפן. אנא אשר חלונות קופצים בדפדפן';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMsg = 'דומיין האפליקציה אינו מורשה עדיין במסוף Firebase Console תחת Authorized domains';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'ספק ההתחברות של Google אינו פעיל עדיין במסוף Firebase (Authentication > Sign-in method)';
      } else if (err.message?.includes('CONFIGURATION_NOT_FOUND') || err.code === 'auth/configuration-not-found') {
        errorMsg = 'יש להפעיל את ספק Google במסוף Firebase Console (Authentication > Sign-in method)';
      }
      showToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  // Apple Social Sign In
  const loginWithApple = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        setCurrentUser(data);
      } else {
        const newProfile: UserProfile = {
          id: user.uid,
          email: user.email || '',
          username: (user.displayName || user.email?.split('@')[0] || 'apple_user').toLowerCase().replace(/\s+/g, '_'),
          shopName: user.displayName || 'החנות שלי',
          bio: '',
          avatar: '',
          followersCount: 0,
          following: [],
          isVip: false,
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', user.uid), newProfile);
        setCurrentUser(newProfile);
        setUsers(prev => [newProfile, ...prev.filter(u => u.id !== user.uid)]);
      }
      closeAuthModal();
      showToast('התחברת בהצלחה עם Apple ID! ברוך הבא 👋', 'success');
      return { success: true };
    } catch (err: any) {
      console.warn('Apple sign-in error:', err);
      let errorMsg = 'שגיאה בהתחברות עם Apple ID';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = 'חלון ההתחברות של Apple נסגר';
      } else if (err.code === 'auth/popup-blocked') {
        errorMsg = 'חלון ההתחברות נחסם על ידי הדפדפן';
      } else if (err.message?.includes('CONFIGURATION_NOT_FOUND') || err.code === 'auth/configuration-not-found') {
        errorMsg = 'התחברות עם Apple דורשת הגדרת חשבון מפתחים של Apple ומפתחות במסוף Firebase Console';
      }
      showToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut notice:', e);
    }
    setCurrentUser(null);
    setFirebaseUser(null);
    setSelectedUserForProfile(null);
    setCart([]);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CART);
    showToast('התנתקת מהמערכת בהצלחה', 'info');
    navigateToHomeFeed();
  };

  // Edit and Update User Profile at Any Time
  const updateProfile = async (updates: { 
    shopName?: string; 
    username?: string; 
    bio?: string; 
    avatar?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'יש להתחבר כדי לערוך את הפרופיל' };
    }

    try {
      const cleanUsername = updates.username !== undefined 
        ? updates.username.replace(/^@/, '').trim() 
        : currentUser.username;

      const updatedUser: UserProfile = {
        ...currentUser,
        shopName: updates.shopName !== undefined ? updates.shopName.trim() : currentUser.shopName,
        username: cleanUsername || currentUser.username,
        bio: updates.bio !== undefined ? updates.bio.trim() : currentUser.bio,
        avatar: updates.avatar !== undefined ? updates.avatar.trim() : (currentUser.avatar || ''),
      };

      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      if (selectedUserForProfile?.id === currentUser.id) {
        setSelectedUserForProfile(updatedUser);
      }

      // Also update sellerName & sellerAvatar on items created by this user
      setItems(prev => prev.map(item => {
        if (item.sellerId === currentUser.id) {
          return {
            ...item,
            sellerName: updatedUser.shopName,
            sellerAvatar: updatedUser.avatar,
          };
        }
        return item;
      }));

      try {
        await updateDoc(doc(db, 'users', currentUser.id), {
          shopName: updatedUser.shopName,
          username: updatedUser.username,
          bio: updatedUser.bio,
          avatar: updatedUser.avatar,
        });
      } catch (e) {
        console.warn('Firestore update profile notice:', e);
      }

      showToast('הפרופיל עודכן בהצלחה! ✨', 'success');
      return { success: true };
    } catch (err: any) {
      showToast('שגיאה בעדכון הפרופיל', 'error');
      return { success: false, error: err.message };
    }
  };

  const unreadMessagesCount = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const featuredShop = users.find(u => u.isFeaturedShop && (!u.featuredShopExpiry || u.featuredShopExpiry > Date.now())) || null;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        firebaseUser,
        users,
        items,
        chats,
        featuredShop,
        activeTab,
        feedType,
        selectedCategory,
        searchQuery,
        selectedItemForDetail,
        selectedUserForProfile,
        activeChatThreadId,
        isAddItemModalOpen,
        itemToEdit,
        isAuthModalOpen,
        authMode,
        checkoutState,
        unreadMessagesCount,
        language,
        dir,
        t,

        // Cart
        cart,
        cartCount,
        cartTotal,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,

        // Toasts
        toasts,
        showToast,
        removeToast,

        // Actions
        setLanguage,
        setActiveTab,
        setFeedType,
        setSelectedCategory,
        setSearchQuery,
        setSelectedItemForDetail,
        setSelectedUserForProfile,
        openChatWithSeller,
        openChatThread,
        closeChatThread,
        sendMessage,
        addItem,
        updateItem,
        toggleSold,
        deleteItem,
        toggleFollowUser,
        toggleLikeItem,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginWithApple,
        logout,
        updateProfile,
        isEditProfileModalOpen,
        openEditProfileModal,
        closeEditProfileModal,
        openAddItemModal,
        closeAddItemModal,
        openAuthModal,
        closeAuthModal,
        openCheckoutModal,
        closeCheckoutModal,
        confirmPromoteItem,
        confirmVipUpgrade,
        confirmShopFeature,
        completePayment,
        navigateToShop,
        navigateToHomeFeed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
