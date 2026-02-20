import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { OrderStatus, UserRole, Review } from '../../types';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../services/supabaseClient";
const OrderTracker = ({ status }: { status: OrderStatus }) => {
  const steps = [
    { label: 'Pending', key: OrderStatus.PENDING },
    { label: 'Started', key: OrderStatus.IN_PROGRESS },
    { label: 'Delivered', key: OrderStatus.DELIVERED },
    { label: 'Done', key: OrderStatus.COMPLETED }
  ];

  const currentIdx = steps.findIndex(s => s.key === status);

  return (
    <div className="flex items-center space-x-2 mt-2 w-full max-w-[200px]">
      {steps.map((step, i) => (
        <React.Fragment key={step.key}>
          <div 
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              i <= currentIdx ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-200'
            }`} 
            title={step.label}
          />
          {i < steps.length - 1 && (
            <div className={`flex-grow h-0.5 transition-all duration-500 ${
              i < currentIdx ? 'bg-emerald-500' : 'bg-gray-100'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const ReviewModal = ({ order, isOpen, onClose, onSubmitted }: { order: any, isOpen: boolean, onClose: () => void, onSubmitted: (orderId: string) => void }) => {
  const { user, addReview } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const newReview: Review = {
      id: 'rev_' + Math.random().toString(36).substr(2, 9),
      gigId: order.gig_id || order.gigId,
      orderId: order.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    
    addReview(newReview);
    onSubmitted(order.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-2xl font-black text-gray-900 leading-tight">Rate your Experience</h3>
            <p className="text-gray-500 font-medium mt-1">Order #{order.id.slice(-6).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="text-center">
            <div className="flex justify-center space-x-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="text-4xl transition-all duration-200 transform hover:scale-125 focus:outline-none"
                >
                  <i className={`fa-star ${star <= (hoverRating || rating) ? 'fas text-yellow-400' : 'far text-gray-200'}`}></i>
                </button>
              ))}
            </div>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
              {rating === 5 ? 'Exceptional' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Your Feedback</label>
            <textarea 
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium min-h-[120px]"
              placeholder="What was it like working with the seller?"
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 active:scale-95"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default function Orders() {
  const { user, orders, updateOrderStatus } = useApp();
  const navigate = useNavigate();

  if (!user) return null;

  const isFreelancer = user.role === UserRole.FREELANCER;
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<any | null>(null);

  const [dbOrders, setDbOrders] = useState<any[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .or(`client_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDbOrders(data);
      }
    };

    loadOrders();
  }, [user]);

  const filteredOrders = dbOrders;



console.log("Filtered orders:", filteredOrders);


  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700';
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
      case OrderStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case OrderStatus.DELIVERED: return 'bg-purple-100 text-purple-700';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAction = (orderId: string, currentStatus: OrderStatus) => {
    if (isFreelancer) {
      if (currentStatus === OrderStatus.PENDING) updateOrderStatus(orderId, OrderStatus.IN_PROGRESS);
      else if (currentStatus === OrderStatus.IN_PROGRESS) updateOrderStatus(orderId, OrderStatus.DELIVERED);
    } else {
      if (currentStatus === OrderStatus.DELIVERED) updateOrderStatus(orderId, OrderStatus.COMPLETED);
    }
  };

  const handleReviewSubmitted = (orderId: string) => {
    setDbOrders(prev =>
      prev.map(order => (order.id === orderId ? { ...order, review_id: 'local_review' } : order))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-lg text-gray-500 font-medium mt-2">Track real-time progress of your active services.</p>
        </div>
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl">
           <button className="px-5 py-2 rounded-lg text-sm font-bold bg-white shadow-sm text-gray-900">Active</button>
           <button className="px-5 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-gray-600">History</button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/20">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-6">Service Detail</th>
                  <th className="px-8 py-6">Amount</th>
                  <th className="px-8 py-6">Current Status</th>
                  <th className="px-8 py-6">Progress Tracking</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition group">
                    <td className="px-8 py-8">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 leading-tight mb-1 group-hover:text-emerald-600 transition-colors">{order.gig_title}</span>
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
                          ID: #{String(order.id).slice(-8).toUpperCase()} • {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className="text-xl font-black text-gray-900">₹{order.amount}</span>
                    </td>
                    <td className="px-8 py-8">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <OrderTracker status={order.status} />
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="flex justify-end items-center space-x-4">
                        <button 
                          onClick={() => navigate(`/messages/${isFreelancer ? order.client_id : order.seller_id}`)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
                          title="Message Party"
                        >
                          <i className="fas fa-comment-dots text-lg"></i>
                        </button>
                        
                        <div className="min-w-[140px] flex justify-end">
                          {isFreelancer ? (
                            <>
                              {order.status === OrderStatus.PENDING && (
                                <button 
                                  onClick={() => handleAction(order.id, order.status)} 
                                  className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-gray-200"
                                >
                                  Start Project
                                </button>
                              )}
                              {order.status === OrderStatus.IN_PROGRESS && (
                                <button 
                                  onClick={() => handleAction(order.id, order.status)} 
                                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                                >
                                  Submit Delivery
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {order.status === OrderStatus.DELIVERED && (
                                <button 
                                  onClick={() => handleAction(order.id, order.status)} 
                                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                                >
                                  Approve
                                </button>
                              )}
                              {order.status === OrderStatus.COMPLETED && !(order.review_id || order.reviewId) && (
                                <button 
                                  onClick={() => setSelectedReviewOrder(order)}
                                  className="px-6 py-2.5 bg-white border border-emerald-600 text-emerald-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all"
                                >
                                  Leave Review
                                </button>
                              )}
                            </>
                          )}
                          {order.status === OrderStatus.COMPLETED && (order.review_id || order.reviewId) && (
                            <div className="flex items-center space-x-2 text-emerald-600">
                              <i className="fas fa-check-double"></i>
                              <span className="text-[10px] font-black uppercase tracking-widest">Reviewed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-32 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
              <i className="fas fa-box-open text-5xl"></i>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">No active orders found</h3>
            <button 
              onClick={() => navigate('/marketplace')} 
              className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
            >
              Browse Marketplace
            </button>
          </div>
        )}
      </div>

      <ReviewModal 
        isOpen={!!selectedReviewOrder} 
        order={selectedReviewOrder} 
        onClose={() => setSelectedReviewOrder(null)}
        onSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
