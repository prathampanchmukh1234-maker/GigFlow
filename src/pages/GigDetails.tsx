
import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";

import { useApp } from "../App";



import { OrderStatus, Review } from '../types';
import { FALLBACK_IMAGE, FALLBACK_AVATAR } from '../constants';
import { supabase } from '../services/supabaseClient';

import axios from "axios";

const checkoutSessionEndpoint =
  import.meta.env.VITE_PAYMENT_API_URL ||
  (import.meta.env.PROD
    ? "/api/create-checkout-session"
    : "http://localhost:4242/create-checkout-session");
const forceStripeForFreeGigs = import.meta.env.VITE_FORCE_STRIPE_FOR_FREE_GIGS === "true";



const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(5)
});



type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function GigDetails() {
  const { id } = useParams();
  const { gigs, user, addOrder, deleteGig, orders, notify } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Basic');
  const [hoverRating, setHoverRating] = useState(0);
  
  // 1. New state for database reviews
  const [dbReviews, setDbReviews] = useState<Review[]>([]);

  // 2. Fetch function using Supabase
  const fetchReviews = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("gig_id", id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Map DB fields to frontend fields
      const mapped: Review[] = data.map(r => ({
        id: r.id,
        gigId: r.gig_id,
        userId: r.user_id,
        userName: r.user_name,
        userAvatar: r.user_avatar,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
        orderId: 'direct'
      }));
      setDbReviews(mapped);
    }
  };

  // 3. Effect to fetch on load
  useEffect(() => {
    fetchReviews();
  }, [id]);

  const gig = gigs.find(g => g.id === id);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: '' }
  });

  const selectedRating = watch('rating');

  // 4. Update memo to use dbReviews instead of context reviews
  const gigReviews = useMemo(() => {
    return dbReviews;
  }, [dbReviews]);

  const hasAlreadyReviewed = useMemo(() => {
    return user && gigReviews.some(r => r.userId === user.id);
  }, [user, gigReviews]);

  const ratingStats = useMemo(() => {
    const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    gigReviews.forEach(r => {
      const star = Math.floor(r.rating) as keyof typeof stats;
      if (stats[star] !== undefined) stats[star]++;
    });
    return stats;
  }, [gigReviews]);

  if (!gig) {
    return <div className="p-10 text-center text-gray-400 font-black uppercase tracking-widest py-40">Service Not Found</div>;
  }

  const isOwner = user?.id === gig.sellerId;
  const canReview = user && !isOwner && !hasAlreadyReviewed;

  const handleOrder = () => {
    if (!user) { navigate('/auth?mode=login'); return; }
    const newOrder = {
      id: 'ord_' + Math.random().toString(36).substr(2, 9),
      clientId: user.id,
      gigId: gig.id,
      sellerId: gig.sellerId,
      status: OrderStatus.PENDING,
      amount: gig.price,
      createdAt: new Date().toISOString(),
      gigTitle: gig.title
    };
    addOrder(newOrder);
    navigate('/orders');
  };
  
const handlePayment = async () => {
  if (!user) {
    navigate("/auth?mode=login");
    return;
  }

  const price =
    activeTab === "Basic"
      ? gig.price
      : activeTab === "Standard"
      ? Math.round(gig.price * 2.5)
      : Math.round(gig.price * 5);

  try {
    const newOrder = {
  id: "ord_" + Math.random().toString(36).substr(2, 9),
  clientId: user.id,
  gigId: gig.id,
  sellerId: gig.sellerId,
  status: OrderStatus.PENDING,
  amount: price,
  createdAt: new Date().toISOString(),
  gigTitle: gig.title,
};

// Save temporarily
localStorage.setItem("pendingOrder", JSON.stringify(newOrder));

    const response = await axios.post(checkoutSessionEndpoint, {
      title: gig.title,
      price: price,
      forceTestCharge: price === 0 && forceStripeForFreeGigs,
    });

    if (response.data?.free && !forceStripeForFreeGigs) {
      addOrder(newOrder);
      notify("Free order placed", "success");
      navigate("/orders");
      return;
    }

    if (!response.data?.url) {
      throw new Error("Checkout session was not created.");
    }

    window.location.assign(response.data.url);
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      alert(error.response?.data?.error || error.message || "Stripe request failed");
      return;
    }
    alert(error instanceof Error ? error.message : "Payment server not running or Stripe failed");
  }
};





  // 5. Update onSubmit to refresh list automatically
  const onSubmitReview = async (data: ReviewFormValues) => {
    if (!user || !gig) return;
    
    const { error } = await supabase
      .from("reviews")
      .insert([
        {
          gig_id: gig.id,
          user_id: user.id,
          user_name: user.name,
          user_avatar: user.avatar,
          rating: data.rating,
          comment: data.comment
        }
      ]);

    if (error) {
      notify("Failed to submit review", "error");
    } else {
      notify("Feedback submitted successfully!", "success");
      reset();
      fetchReviews(); // Refresh list immediately
    }
  };

  const handleDelete = () => {
    if (window.confirm("Delete this service permanently?")) {
      deleteGig(gig.id);
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex text-xs font-black text-gray-400 uppercase tracking-widest mb-10" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
        <span className="mx-3 opacity-30">/</span>
        <Link to={`/marketplace?cat=${encodeURIComponent(gig.category)}`} className="hover:text-emerald-600 transition-colors">{gig.category}</Link>
        <span className="mx-3 opacity-30">/</span>
        <span className="text-gray-900 truncate max-w-[200px]">{gig.title}</span>
      </nav>

      {isOwner && (
        <div className="mb-12 p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-8 shadow-sm animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-emerald-200">
              <i className="fas fa-user-shield text-2xl"></i>
            </div>
            <div>
              <p className="font-black text-gray-900 text-lg leading-tight">Service Management</p>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">You own this professional service</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <Link to={`/edit-gig/${gig.id}`} className="flex-grow sm:flex-grow-0 px-8 py-4 bg-white border border-emerald-200 text-emerald-700 rounded-2xl font-black text-sm hover:bg-emerald-50 transition shadow-sm text-center">
              <i className="fas fa-edit mr-2"></i> Edit Gig
            </Link>
            <button onClick={handleDelete} className="flex-grow sm:flex-grow-0 px-8 py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-sm hover:bg-red-600 hover:text-white transition shadow-sm">
              <i className="fas fa-trash-alt mr-2"></i> Delete
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20">
        <div className="lg:col-span-2 space-y-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight mb-8">
              {gig.title}
            </h1>

            <div className="flex items-center space-x-5 mb-10">
              <img 
                src={FALLBACK_AVATAR(gig.sellerId)} 
                className="w-14 h-14 rounded-2xl border border-gray-100 shadow-sm object-cover" 
                alt="seller" 
              />
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-black text-gray-900 text-lg">{gig.sellerName}</span>
                  <div className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Pro Expert</div>
                </div>
                <div className="flex items-center text-yellow-500 text-xs font-black mt-1">
                  <i className="fas fa-star mr-2"></i>
                  <span className="text-gray-900">{gig.rating}</span>
                  <span className="text-gray-400 ml-2 uppercase tracking-tighter">({gig.reviewsCount} verified reviews)</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-white relative group">
              <img
  src={
    gig.images && gig.images.length > 0 && gig.images[0]
      ? gig.images[0]
      : "https://images.unsplash.com/photo-1559028012-481c04fa702d"
  }
  className="w-full h-full object-cover"
  alt="gig"
  onError={(e) => {
    e.currentTarget.src =
      "https://images.unsplash.com/photo-1559028012-481c04fa702d";
  }}
/>

              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight flex items-center">
              <span className="w-8 h-1 bg-emerald-600 rounded-full mr-4"></span>
              Description
            </h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg font-medium opacity-90">
              {gig.description}
            </div>
          </div>

          <div id="feedback-section">
          {canReview ? (
            <section className="bg-gray-50/50 border border-gray-100 p-10 rounded-[3rem] animate-in fade-in duration-500">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center">
                  <i className="fas fa-comment-dots text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">Write a Review</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Logged in as <span className="text-emerald-600">{user.name}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Select Rating</label>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setValue('rating', star)}
                        className="text-3xl transition-all duration-200 transform hover:scale-110 active:scale-90"
                      >
                        <i className={`fa-star ${star <= (hoverRating || selectedRating) ? 'fas text-yellow-400' : 'far text-gray-200'}`}></i>
                      </button>
                    ))}
                  </div>
                  {errors.rating && <p className="mt-2 text-[10px] text-red-500 font-black uppercase tracking-widest">{errors.rating.message}</p>}
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Share your experience</label>
                  <textarea 
                    {...register('comment')}
                    placeholder="What was it like working with this professional?"
                    className={`w-full p-6 bg-white border ${errors.comment ? 'border-red-300 ring-4 ring-red-500/5' : 'border-gray-100'} rounded-[1.8rem] focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-medium min-h-[140px] shadow-sm text-gray-900`}
                  ></textarea>
                  {errors.comment && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">{errors.comment.message}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Publish Feedback'}
                </button>
              </form>
            </section>
          ) : !user ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 p-10 rounded-[3rem] text-center">
              <p className="text-gray-500 font-black uppercase tracking-widest text-xs mb-4">Please sign in to leave feedback</p>
              <Link to="/auth?mode=login" className="inline-block px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg">Sign In</Link>
            </div>
          ) : isOwner ? (
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[3rem] text-center">
               <p className="text-emerald-700 font-black uppercase tracking-widest text-[10px]">You are the provider of this service</p>
            </div>
          ) : hasAlreadyReviewed ? (
             <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[3rem] text-center flex items-center justify-center space-x-3">
               <i className="fas fa-check-circle text-emerald-600"></i>
               <p className="text-emerald-700 font-black uppercase tracking-widest text-[10px]">You have already submitted a review for this service</p>
            </div>
          ) : null}
          </div>

          <section className="pt-12 border-t border-gray-100">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Public Feedback</h2>
                <p className="text-gray-400 font-bold">What others say about {gig.sellerName}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="flex flex-col items-center justify-center text-center md:border-r md:border-gray-50 md:pr-12">
                <p className="text-7xl font-black text-gray-900 mb-4">{gig.rating}</p>
                <div className="flex space-x-1.5 text-yellow-400 mb-4 text-xl">
                  {[1, 2, 3, 4, 5].map(s => <i key={s} className={`fa-star ${s <= Math.floor(gig.rating) ? 'fas' : 'far text-gray-100'}`}></i>)}
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{gig.reviewsCount} TOTAL REVIEWS</p>
              </div>
              
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingStats[star as keyof typeof ratingStats] || 0;
                  const percent = gigReviews.length > 0 ? (count / gigReviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center space-x-5">
                      <span className="text-[10px] font-black text-gray-400 w-12 tracking-widest">{star} STAR</span>
                      <div className="flex-grow h-2.5 bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-10">
              {gigReviews.length > 0 ? (
                gigReviews.map((review) => (
                  <div key={review.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-500 group border-b-4 border-b-transparent hover:border-b-emerald-500">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center space-x-5">
                        <img 
                          src={review.userAvatar || FALLBACK_AVATAR(review.userId)} 
                          className="w-14 h-14 rounded-2xl object-cover shadow-sm ring-4 ring-gray-50" 
                          alt="user"
                        />
                        <div>
                          <p className="font-black text-gray-900 text-lg leading-none mb-1.5">{review.userName}</p>
                          <div className="flex text-yellow-400 text-xs space-x-1">
                            {[1, 2, 3, 4, 5].map(s => <i key={s} className={`fa-star ${s <= review.rating ? 'fas' : 'far text-gray-100'}`}></i>)}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-900 font-bold text-lg leading-relaxed italic opacity-80">"{review.comment}"</p>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-200 shadow-sm">
                    <i className="fas fa-comment-slash text-2xl"></i>
                  </div>
                  <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Be the first to leave a review</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div>
          <div className="sticky top-32 space-y-8 animate-in slide-in-from-right-8 duration-700">
            <div className="bg-white border border-gray-100 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
              <div className="flex border-b border-gray-50">
                {['Basic', 'Standard', 'Premium'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-6 font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-emerald-600 border-b-4 border-emerald-600' : 'text-gray-400 bg-gray-50/50 hover:bg-white'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="font-black text-gray-900 text-xl tracking-tight uppercase">{activeTab} Hub Package</h3>
                  <div className="flex flex-col items-end">
                    <span className="text-4xl font-black text-gray-900">
                      ₹{activeTab === 'Basic' ? gig.price : activeTab === 'Standard' ? Math.round(gig.price * 2.5) : Math.round(gig.price * 5)}
                    </span>
                  </div>
                </div>
                
                <ul className="space-y-5 text-sm font-bold mb-12 text-gray-600">
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mr-4 text-[10px]">
                      <i className="fas fa-clock"></i>
                    </div>
                    {gig.deliveryTime} Day Delivery Cycle
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mr-4 text-[10px]">
                      <i className="fas fa-sync-alt"></i>
                    </div>
                    Unlimited Revisions
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mr-4 text-[10px]">
                      <i className="fas fa-check"></i>
                    </div>
                    Source Files Included
                  </li>
                </ul>

                <button
  onClick={handlePayment}
  className="w-full py-6 bg-emerald-600 text-white rounded-2xl">Continue with Hub
</button>




                
                <p className="mt-8 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">100% Secure Transaction Guarantee</p>
              </div>
            </div>
            
            <div className="bg-gray-900 p-10 rounded-[2.5rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-14 bg-emerald-500/10 blur-[60px] rounded-full group-hover:scale-125 transition-transform duration-700"></div>
              <h4 className="font-black text-xl mb-4 relative flex items-center">
                <i className="fas fa-shield-halved text-emerald-500 mr-4"></i>
                GigFlow Protection
              </h4>
              <p className="text-gray-400 text-sm mb-0 relative leading-relaxed font-medium">Funds are held safely in escrow until you approve the final delivery from the freelancer.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
