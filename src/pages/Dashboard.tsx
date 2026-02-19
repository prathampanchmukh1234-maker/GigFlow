
import React from 'react';
import { useApp, AUTHORIZED_ADMIN_EMAIL } from '../App';
import { UserRole, OrderStatus } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { FALLBACK_IMAGE, FALLBACK_AVATAR } from '../../constants';

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: string, color: string }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 blur-[40px] rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700`}></div>
    <div className="relative z-10">
      <div className={`w-14 h-14 ${color.replace('bg-', 'bg-').replace('500', '100')} ${color.replace('bg-', 'text-').replace('500', '600')} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-gray-100`}>
        <i className={`fas fa-${icon} text-2xl`}></i>
      </div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-4xl font-black text-gray-900">{value}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user, orders, gigs, deleteGig } = useApp();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth?mode=login');
    return null;
  }

  // Strict check for admin specific cards
  const isAuthorizedAdmin = user.role === UserRole.ADMIN && user.email === AUTHORIZED_ADMIN_EMAIL;
  const isFreelancer = user.role === UserRole.FREELANCER;
  
  const userGigs = gigs.filter(g => String(g.sellerId) === String(user.id));
  const relevantOrders = isAuthorizedAdmin 
    ? orders 
    : isFreelancer 
      ? orders.filter(o => String(o.sellerId) === String(user.id))
      : orders.filter(o => String(o.clientId) === String(user.id));

  const earnings = relevantOrders
    .filter(o => o.status === OrderStatus.COMPLETED)
    .reduce((sum, o) => sum + o.amount, 0);

  const activeOrdersCount = relevantOrders.filter(o => 
    o.status === OrderStatus.PENDING || o.status === OrderStatus.IN_PROGRESS || o.status === OrderStatus.DELIVERED
  ).length;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this service? This action cannot be undone.")) {
      deleteGig(id);
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit-gig/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-80 space-y-8 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 text-center shadow-xl shadow-gray-200/20">
            <div className="relative inline-block mb-8">
               <img 
                src={user.avatar} 
                className="w-32 h-32 rounded-[2rem] mx-auto border-4 border-emerald-50 shadow-2xl object-cover" 
                alt="profile" 
                onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR(user.id))}
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-600 border-4 border-white rounded-2xl flex items-center justify-center text-white text-sm">
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
            <h2 className="text-2xl font-black text-gray-900">{user.name}</h2>
            <p className="text-emerald-600 font-black text-xs uppercase tracking-widest mt-2 px-3 py-1 bg-emerald-50 rounded-full w-fit mx-auto">{user.role}</p>
            <div className="h-px bg-gray-50 my-8 w-full"></div>
            <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
              Manage Account
            </button>
          </div>

          {isFreelancer && (
            <Link to="/ai-studio" className="block p-8 bg-emerald-950 rounded-[2.5rem] text-white shadow-2xl group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 bg-emerald-500/10 blur-xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-400">
                  <i className="fas fa-wand-magic-sparkles text-xl"></i>
                </div>
                <h3 className="font-black text-lg mb-2">AI Media Studio</h3>
                <p className="text-xs text-gray-400 font-bold leading-relaxed">Generate cinematic service trailers and 4K images with Gemini.</p>
              </div>
            </Link>
          )}

          {isAuthorizedAdmin && (
            <Link to="/admin" className="block p-8 bg-gray-900 rounded-[2.5rem] text-white shadow-2xl group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 bg-emerald-500/10 blur-xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-400">
                  <i className="fas fa-user-shield text-xl"></i>
                </div>
                <h3 className="font-black text-lg mb-2">Platform Administration</h3>
                <p className="text-xs text-gray-400 font-bold leading-relaxed">Access the ecosystem management dashboard for advanced control.</p>
              </div>
            </Link>
          )}

          {isFreelancer && (
            <div className="bg-emerald-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-10 blur-xl bg-white rounded-full translate-x-10 -translate-y-10"></div>
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-emerald-400">Platform Badge</h3>
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl border border-white/10">
                  <i className="fas fa-crown text-emerald-400"></i>
                </div>
                <div>
                  <p className="font-black text-lg leading-tight">Elite Seller</p>
                  <p className="text-xs text-emerald-300/60 font-bold uppercase tracking-widest mt-1">Level 2 Account</p>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div className="bg-emerald-400 h-2 rounded-full w-[85%] shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
              </div>
              <p className="text-[10px] text-emerald-300/50 font-bold text-right uppercase tracking-widest">Next Level at 100 sales</p>
            </div>
          )}
        </aside>

        <div className="flex-grow space-y-12 min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">Overview</h1>
              <p className="text-lg text-gray-500 font-medium">Monitoring your performance on GigFlow.</p>
            </div>
            {isFreelancer && (
              <div className="flex space-x-4">
                <Link to="/ai-studio" className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-gray-800 transition shadow-xl active:scale-95 flex items-center">
                  AI Studio <i className="fas fa-sparkles ml-2 text-emerald-400"></i>
                </Link>
                <Link to="/create-gig" className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-emerald-700 transition shadow-xl shadow-emerald-600/20 active:scale-95">
                  New Service <i className="fas fa-plus ml-2"></i>
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <StatCard 
              title={isAuthorizedAdmin ? "Total Platform Orders" : "Active Orders"} 
              value={isAuthorizedAdmin ? orders.length.toString() : activeOrdersCount.toString()} 
              icon="shopping-cart" 
              color="bg-emerald-500" 
            />
            <StatCard 
              title={isAuthorizedAdmin ? "Total Active Gigs" : (isFreelancer ? "Success Rate" : "Project Quality")} 
              value={isAuthorizedAdmin ? gigs.length.toString() : (isFreelancer ? "99.4%" : "100%")} 
              icon="star" 
              color="bg-teal-500" 
            />
            <StatCard 
              title={isAuthorizedAdmin ? "Marketplace Revenue" : (isFreelancer ? "Total Revenue" : "Total Spent")} 
              value={`$${isAuthorizedAdmin ? orders.reduce((s,o)=>s+o.amount,0) : (isFreelancer ? earnings : orders.reduce((s,o) => s+o.amount, 0))}`} 
              icon="chart-line" 
              color="bg-blue-500" 
            />
          </div>

          <section>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900">{isAuthorizedAdmin ? "Ecosystem Activity" : "Recent Activity"}</h2>
              <Link to="/orders" className="text-emerald-600 text-sm font-black uppercase tracking-widest hover:underline">Full History &rarr;</Link>
            </div>
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-4 shadow-sm divide-y divide-gray-50">
              {relevantOrders.length > 0 ? (
                relevantOrders.slice(0, 5).reverse().map(order => (
                  <div key={order.id} className="flex flex-col md:flex-row items-center justify-between p-6 hover:bg-gray-50 transition-colors rounded-2xl">
                    <div className="flex items-center space-x-6 w-full md:w-auto mb-4 md:mb-0">
                       <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0 font-black">
                          <i className="fas fa-file-invoice-dollar text-xl"></i>
                       </div>
                       <div>
                          <p className="font-black text-gray-900 leading-tight mb-1">{order.gigTitle}</p>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">#{String(order.id).slice(-6).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="flex items-center justify-between w-full md:w-auto md:space-x-12">
                       <div className="text-center">
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Price</p>
                          <p className="font-black text-gray-900">${order.amount}</p>
                       </div>
                       <div className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                          order.status === OrderStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-100 text-blue-700'
                       }`}>
                          {order.status}
                       </div>
                       <button onClick={() => navigate(`/messages/${isFreelancer ? order.clientId : order.sellerId}`)} className="w-12 h-12 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-white transition-all shadow-sm">
                          <i className="fas fa-comment-dots"></i>
                       </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-gray-400 font-bold">No recent activities to show.</div>
              )}
            </div>
          </section>

          {isFreelancer && (
            <section>
              <h2 className="text-2xl font-black mb-8 text-gray-900">Live Gigs</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {userGigs.length > 0 ? (
                  userGigs.map(gig => (
                    <div key={gig.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 flex space-x-6 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 group">
                      <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-[1.5rem]">
                         <img 
                          src={gig.images[0]} 
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                          alt="gig" 
                          onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                        />
                      </div>
                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div>
                          <h3 className="font-black text-gray-900 line-clamp-1 leading-tight mb-2">{gig.title}</h3>
                          <div className="flex items-center text-xs text-emerald-600 font-black bg-emerald-50 px-3 py-1 rounded-full w-fit">
                            <i className="fas fa-star text-yellow-500 mr-2"></i>
                            {gig.rating} ({gig.reviewsCount})
                          </div>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-xl font-black text-emerald-700">${gig.price}</span>
                          <div className="flex space-x-2">
                            <button 
                              type="button"
                              onClick={(e) => handleEdit(e, gig.id)}
                              className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              type="button"
                              onClick={(e) => handleDelete(e, gig.id)}
                              className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-12 text-center bg-gray-50 border border-dashed border-gray-200 rounded-3xl">
                     <p className="text-gray-400 font-bold">You haven't created any services yet.</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
