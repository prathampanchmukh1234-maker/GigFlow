
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Gig, UserRole, Order, OrderStatus, Message, Review } from '../types';
import { MOCK_GIGS, FALLBACK_AVATAR, MOCK_REVIEWS, MOCK_ORDERS, MOCK_USERS } from '../constants';
import { api } from './services/api'; 
import { supabase } from './services/supabaseClient';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import GigDetails from './pages/GigDetails';
import Dashboard from './pages/Dashboard';
import CreateGig from './pages/CreateGig';
import EditGig from './pages/EditGig';
import Orders from './pages/Orders';
import Auth from './pages/Auth';
import Messages from './pages/Messages';
import AdminPanel from './pages/AdminPanel';
import AiStudio from './pages/AiStudio';
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";

// Strict enforcement constant
export const AUTHORIZED_ADMIN_EMAIL = 'admin@gigflow.com';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  updateUser: (updatedUser: User) => void;
  deleteUser: (userId: string) => void;
  gigs: Gig[];
  setGigs: React.Dispatch<React.SetStateAction<Gig[]>>;
  addGig: (newGig: Gig) => Promise<void>;
  updateGig: (updatedGig: Gig) => Promise<void>;
  deleteGig: (gigId: string) => Promise<void>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  messages: Message[];
  sendMessage: (receiverId: string, text: string) => void;
  reviews: Review[];
  addReview: (review: Review) => void;
  isDbConnected: boolean;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Toast = ({ message, type, onClose }: { message: string, type: string, onClose: () => void }) => (
  <div className={`fixed bottom-8 right-8 z-[100] flex items-center p-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-300 ${
    type === 'success' ? 'bg-emerald-900 border-emerald-500 text-white' : 
    type === 'error' ? 'bg-red-900 border-red-500 text-white' :
    'bg-gray-900 border-gray-700 text-white'
  }`}>
    <i className={`fas ${type === 'success' ? 'fa-check-circle text-emerald-400' : type === 'error' ? 'fa-exclamation-triangle text-red-400' : 'fa-info-circle text-blue-400'} mr-3 text-lg`}></i>
    <span className="font-bold text-sm">{message}</span>
    <button onClick={onClose} className="ml-4 text-gray-400 hover:text-white"><i className="fas fa-times"></i></button>
  </div>
);

const Navbar = () => {
  const { user, setUser, messages, isDbConnected } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / (totalScroll || 1)) * 100;
      setScrollProgress(progress);
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      return;
    }

    // Clear React state
    setUser(null);

    // Clear local storage (important)
    localStorage.removeItem("supabase.auth.token");

    // Navigate instead of full reload
    navigate("/");

  } catch (err) {
    console.error("Logout failed:", err);
  }
};



  const unreadCount = messages.filter(m => m.receiverId === user?.id && !m.isRead).length;
  const isTransparent = location.pathname === '/' && !isScrolled;
  
  const isAuthorizedAdmin = user?.role === UserRole.ADMIN && user?.email === AUTHORIZED_ADMIN_EMAIL;

  return (
    <>
      <div className="fixed top-0 left-0 h-1 bg-emerald-500 z-[110] transition-all duration-100 ease-out" style={{ width: `${scrollProgress}%` }}></div>
      <nav className={`fixed w-full top-0 z-[100] transition-all duration-500 ${
        isTransparent 
        ? 'bg-transparent py-6' 
        : 'bg-white/80 backdrop-blur-2xl border-b border-gray-100 shadow-sm py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-10">
              <Link to="/" className="group flex items-center">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                  <i className="fas fa-bolt text-xl"></i>
                </div>
                <span className="ml-3 text-2xl font-black tracking-tight text-gray-900">
                  GigFlow
                </span>
              </Link>
              <div className="hidden lg:flex space-x-8 text-sm font-bold items-center text-gray-500">
                <Link to="/marketplace" className="hover:text-emerald-600 transition-colors">Browse Marketplace</Link>
                {!user && <Link to="/auth?mode=signup&role=seller" className="text-emerald-500 hover:text-emerald-600 font-bold">Become a Seller</Link>}
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border transition-all duration-500 ${isTransparent ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-gray-50 border-gray-100'}`}>
                  <div className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`}></div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    {isDbConnected ? 'Live' : 'Persistent Demo'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-5">
              {user ? (
                <>
                  <Link to="/messages" className="relative p-2.5 transition-all hover:bg-emerald-500/10 rounded-xl text-gray-400 hover:text-emerald-600">
                    <i className="fas fa-envelope text-xl"></i>
                    {unreadCount > 0 && <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">{unreadCount}</span>}
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center space-x-3 p-1.5 pr-4 rounded-2xl transition border border-transparent bg-gray-50 hover:bg-gray-100 text-gray-900">
                      <img src={user.avatar} className="w-9 h-9 rounded-xl object-cover shadow-sm" alt="avatar" onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR(user.id))} />
                      <div className="hidden sm:block text-left">
                        <p className="text-xs font-black leading-none mb-1">{user.name}</p>
                        <p className="text-[10px] uppercase font-bold text-gray-400">{user.role.toLowerCase()}</p>
                      </div>
                    </button>
                    <div className="absolute right-0 w-56 mt-3 bg-white border border-gray-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-2 origin-top-right text-gray-900">
                      <Link to="/dashboard" className="flex items-center px-4 py-3 text-sm font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition"><i className="fas fa-th-large mr-3 opacity-50"></i> Dashboard</Link>
                      <Link to="/orders" className="flex items-center px-4 py-3 text-sm font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition"><i className="fas fa-shopping-bag mr-3 opacity-50"></i> Orders</Link>
                      {isAuthorizedAdmin && (
                         <Link to="/admin" className="flex items-center px-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition"><i className="fas fa-user-shield mr-3 opacity-50"></i> Admin Panel</Link>
                      )}
                      <hr className="my-2 border-gray-50" />
                      <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition"><i className="fas fa-sign-out-alt mr-3 opacity-50"></i> Logout</button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/auth?mode=login" className="text-sm font-black transition-colors text-gray-600 hover:text-emerald-600">Sign In</Link>
                  <Link to="/auth?mode=signup" className="px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl bg-gray-900 text-white hover:bg-emerald-600 shadow-gray-200">Join Now</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

const MainContent = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  return (
    <main className={`flex-grow ${isHome ? 'pt-0' : 'pt-24'}`}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/gig/:id" element={<GigDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-gig" element={<CreateGig />} />
        <Route path="/edit-gig/:id" element={<EditGig />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:userId" element={<Messages />} />
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="/ai-studio" element={<AiStudio />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    </main>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [gigs, setGigs] = useState<Gig[]>(MOCK_GIGS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [isDbConnected, setIsDbConnected] = useState(true);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);

  const syncProfile = async (sessionUser: any) => {
    try {
      let profile = await api.getProfile(sessionUser.id).catch(() => null);
      
      // Auto-create profile if missing (common for new OAuth users)
      if (!profile) {
        const metadata = sessionUser.user_metadata;
        const newProfile = {
          id: sessionUser.id,
          email: sessionUser.email,
          name: metadata?.name || metadata?.full_name || 'Anonymous User',
          role: metadata?.role || UserRole.CLIENT,
          avatar_url: metadata?.avatar_url || FALLBACK_AVATAR(sessionUser.id),
          bio: ''
        };
        await supabase.from('profiles').insert([newProfile]);
        profile = newProfile;
      }

      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as UserRole,
        avatar: profile.avatar_url,
        bio: profile.bio
      });
    } catch (e) {
      console.error("Failed to sync profile", e);
    }
  };

  useEffect(() => {
  const initApp = async () => {
    // Wait for OAuth session restore (important)
    await new Promise(resolve => setTimeout(resolve, 300));

    let { data: { session } } = await supabase.auth.getSession();
    let currentUser = session?.user;

    // If session not ready yet (Google redirect case)
    if (!currentUser) {
      const { data } = await supabase.auth.getUser();
      currentUser = data.user;
    }

    if (currentUser) {
      await syncProfile(currentUser);
    }

       
      try {
        const [gigsData] = await Promise.all([api.getGigs()]);
setGigs(gigsData || MOCK_GIGS);

// LOAD REVIEWS FROM SUPABASE (robust)
const { data: reviewsData, error: reviewsError } = await supabase
  .from("reviews")
  .select("*")
  .order("created_at", { ascending: false });

console.log("Loaded reviews from DB:", reviewsData);

if (reviewsError) { 
  console.error("Review fetch error:", reviewsError.message);
} 
else if (reviewsData && reviewsData.length > 0) {

  const formattedReviews = reviewsData.map(r => ({
    id: r.id,
    gigId: r.gig_id,
    userId: r.user_id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at
  }));
  
  setReviews(formattedReviews);

} 
else {
  console.log("No reviews found in database");
}





        
        if (currentUser) {
  const [ordersData, messagesData] = await Promise.all([
    api.getOrders(currentUser.id),
    api.getMessages(currentUser.id)
  ]);
  setOrders(ordersData);
  setMessages(messagesData);
}

      } catch (err) {
        console.warn("Supabase fetch warning", err);
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {

    if (session?.user) {
      // Handles SIGNED_IN + INITIAL_SESSION
      await syncProfile(session.user);
    }

    if (event === 'SIGNED_OUT') {
      setUser(null);
    }
  }
);



    return () => subscription.unsubscribe();
  }, []);

  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const updateUser = async (updatedUser: User) => {
    if (updatedUser.role === UserRole.ADMIN && updatedUser.email !== AUTHORIZED_ADMIN_EMAIL) {
      updatedUser.role = UserRole.CLIENT;
      notify("Security Warning: Unauthorized Admin Promotion Prevented", "error");
    }

    try {
      await api.updateProfile(updatedUser.id, {
        name: updatedUser.name,
        role: updatedUser.role,
        avatar_url: updatedUser.avatar,
        bio: updatedUser.bio
      });
      if (user?.id === updatedUser.id) setUser(updatedUser);
      notify("Profile updated successfully", "success");
    } catch (err) {
      notify("Update failed", "error");
    }
  };

  const deleteUser = (userId: string) => {
    notify("Account deletion restricted to admin.", "error");
  };

  const addGig = async (newGig: Gig) => {
    try {
      const saved = await api.createGig(newGig);
      setGigs(prev => [saved, ...prev]);
      notify("Service published!", "success");
    } catch (err) {
      notify("Publish failed", "error");
    }
  };

  const updateGig = async (updatedGig: Gig) => {
    try {
      await api.updateGig(updatedGig.id, updatedGig);
      setGigs(prev => prev.map(g => g.id === updatedGig.id ? updatedGig : g));
      notify("Update successful", "success");
    } catch (err) {
      notify("Update failed", "error");
    }
  };

  const deleteGig = async (gigId: string) => {
    try {
      await api.deleteGig(gigId);
      setGigs(prev => prev.filter(g => g.id !== gigId));
      notify("Service removed", "info");
    } catch (err) {
      notify("Delete failed", "error");
    }
  };

  const addOrder = async (order: Order) => {
    try {
      const saved = await api.createOrder(order);
      setOrders(prev => [saved, ...prev]);
      notify("Order placed!", "success");
    } catch (err) {
      notify("Order failed", "error");
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      notify(`Order ${status.toLowerCase()}!`, "info");
    } catch (err) {
      notify("Update failed", "error");
    }
  };

  const addReview = async (review: Review) => {
  const { data, error } = await supabase
    .from("reviews")
    .insert([
      {
        gig_id: review.gigId,
        user_id: review.userId,
        rating: review.rating,
        comment: review.comment,
        created_at: new Date().toISOString()
      }
    ])
    .select();

  if (error) {
    console.error("Review insert error:", error.message);
    notify("Failed to save review", "error");
    return;
  }

  if (data && data.length > 0) {
    const newReview = {
      id: data[0].id,
      gigId: data[0].gig_id,
      userId: data[0].user_id,
      rating: data[0].rating,
      comment: data[0].comment,
      createdAt: data[0].created_at
    };

    // IMPORTANT: update state immediately
    setReviews(prev => [newReview, ...prev]);
  }

  notify("Feedback submitted successfully", "success");
};







  const sendMessage = async (receiverId: string, text: string) => {
    if (!user) return;
    const newMessage = {
      sender_id: user.id,
      receiver_id: receiverId,
      text,
      timestamp: new Date().toISOString(),
      is_read: false
    };
    try {
      const saved = await api.sendMessage(newMessage);
      setMessages(prev => [...prev, saved]);
    } catch (err) {
      notify("Message failed", "error");
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, users, setUsers, updateUser, deleteUser, gigs, setGigs, addGig, updateGig, deleteGig, orders, setOrders, addOrder, updateOrderStatus,
      messages, sendMessage, reviews, addReview, isDbConnected, notify
    }}>
      <HashRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-white">
          <Navbar />
          <MainContent />
          {notification && <Toast message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
}
