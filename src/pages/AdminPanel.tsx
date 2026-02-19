
import React, { useState, useMemo } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp, AUTHORIZED_ADMIN_EMAIL } from '../App';
import { UserRole, OrderStatus, User, Gig, Order } from '../../types';
import { FALLBACK_AVATAR, FALLBACK_IMAGE } from '../../constants';

const AdminOverview = () => {
  const { users, gigs, orders } = useApp();

  const stats = useMemo(() => {
    const totalVolume = orders.reduce((sum, o) => sum + o.amount, 0);
    const activeGigs = gigs.length;
    const totalUsers = users.length;
    const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED).length;

    return [
      { label: 'Total Platform Volume', value: `₹${totalVolume.toLocaleString()}`, icon: 'chart-pie', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Active Services', value: activeGigs.toString(), icon: 'rocket', color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Platform Users', value: totalUsers.toString(), icon: 'users', color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Completed Success', value: completedOrders.toString(), icon: 'check-double', color: 'text-orange-600', bg: 'bg-orange-50' },
    ];
  }, [users, gigs, orders]);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6 text-2xl shadow-sm`}>
              <i className={`fas fa-${s.icon}`}></i>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-3xl font-black text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center">
             <i className="fas fa-user-plus mr-4 text-emerald-500"></i> Recent Registrations
          </h3>
          <div className="space-y-6">
            {users.slice(-5).reverse().map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                <div className="flex items-center space-x-4">
                  <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover" alt="avatar" onError={(e) => e.currentTarget.src = FALLBACK_AVATAR(u.id)} />
                  <div>
                    <p className="font-black text-gray-900 text-sm">{u.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{u.role}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-gray-300">NEW</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 bg-emerald-500/10 blur-[100px] rounded-full"></div>
          <h3 className="text-xl font-black mb-8 flex items-center relative">
             <i className="fas fa-shield-alt mr-4 text-emerald-400"></i> System Status
          </h3>
          <div className="space-y-8 relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <span className="text-sm font-bold text-gray-400">Database Core</span>
              <span className="flex items-center text-xs font-black text-emerald-400 uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></div> Operational
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <span className="text-sm font-bold text-gray-400">API Gateway</span>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">99.9% Uptime</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-400">Storage Cluster</span>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const { users, updateUser, deleteUser, user: currentUser } = useApp();

  const handleRoleChange = (user: User, newRole: UserRole) => {
    // SECURITY: Only the master account can hold the ADMIN role.
    if (newRole === UserRole.ADMIN && user.email !== AUTHORIZED_ADMIN_EMAIL) {
      alert("Role escalation denied. Only authorized system accounts can hold administrative privileges.");
      return;
    }
    updateUser({ ...user, role: newRole });
  };

  const handleDeleteUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.email === AUTHORIZED_ADMIN_EMAIL) {
      alert("You cannot delete the primary system administrator account.");
      return;
    }
    if (window.confirm("ARE YOU SURE? Permanently delete this account? This will also remove all their services from the platform.")) {
      deleteUser(userId);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-10 border-b border-gray-50 flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Directory Management</h2>
        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full">
          {users.length} Active Records
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
              <th className="px-10 py-6">Member</th>
              <th className="px-10 py-6">Identity</th>
              <th className="px-10 py-6">Current Permissions</th>
              <th className="px-10 py-6 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-10 py-8">
                  <div className="flex items-center space-x-5">
                    <img src={u.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm" alt="avatar" />
                    <div>
                      <p className="font-black text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">ID: {u.id.toUpperCase()}</span>
                </td>
                <td className="px-10 py-8">
                  <select 
                    value={u.role}
                    onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                    disabled={u.email === AUTHORIZED_ADMIN_EMAIL}
                    className="bg-transparent border-none text-xs font-black text-emerald-600 uppercase tracking-widest focus:ring-0 cursor-pointer disabled:opacity-30"
                  >
                    <option value={UserRole.CLIENT}>Client</option>
                    <option value={UserRole.FREELANCER}>Freelancer</option>
                    <option value={UserRole.ADMIN}>Administrator</option>
                  </select>
                </td>
                <td className="px-10 py-8 text-right">
                  <button 
                    onClick={() => handleDeleteUser(u.id)}
                    disabled={u.email === AUTHORIZED_ADMIN_EMAIL}
                    className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-0"
                  >
                    Ban Account
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GigModeration = () => {
  const { gigs, deleteGig } = useApp();

  const handleRemoveGig = (gigId: string) => {
    if (window.confirm("WARNING: You are about to permanently remove this service. It will disappear from all search results immediately. Continue?")) {
      deleteGig(gigId);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-10 border-b border-gray-50 flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active Marketplace Moderation</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{gigs.length} SERVICES LIVE</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
              <th className="px-10 py-6">Service Overview</th>
              <th className="px-10 py-6">Provider</th>
              <th className="px-10 py-6">Price</th>
              <th className="px-10 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {gigs.map(g => (
              <tr key={g.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-10 py-8">
                  <div className="flex items-center space-x-5">
                    <img src={g.images[0]} className="w-16 h-12 rounded-xl object-cover shadow-sm ring-1 ring-gray-100" alt="gig" onError={(e) => e.currentTarget.src = FALLBACK_IMAGE} />
                    <div className="max-w-xs">
                      <p className="font-black text-gray-900 truncate">{g.title}</p>
                      <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{g.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <span className="text-sm font-bold text-gray-900">{g.sellerName}</span>
                </td>
                <td className="px-10 py-8">
                  <span className="font-black text-gray-900">₹{g.price}</span>
                </td>
                <td className="px-10 py-8 text-right">
                  <button 
                    onClick={() => handleRemoveGig(g.id)} 
                    className="px-8 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                  >
                    Purge Service
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PaymentLedger = () => {
  const { orders, updateOrderStatus } = useApp();

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm("As an administrator, you are canceling this transaction. Refund protocol will be initiated. Proceed?")) {
      updateOrderStatus(orderId, OrderStatus.CANCELLED);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-10 border-b border-gray-50 flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Financial Ledger</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
              <th className="px-10 py-6">Ref ID</th>
              <th className="px-10 py-6">Service Detail</th>
              <th className="px-10 py-6">Volume</th>
              <th className="px-10 py-6">Status</th>
              <th className="px-10 py-6 text-right">Date Executed</th>
              <th className="px-10 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-10 py-8">
                  <span className="font-mono text-[10px] text-gray-400 font-black">#{o.id.slice(-8).toUpperCase()}</span>
                </td>
                <td className="px-10 py-8">
                  <p className="font-black text-gray-900 text-sm">{o.gigTitle}</p>
                </td>
                <td className="px-10 py-8">
                  <span className="font-black text-emerald-600">₹{o.amount}</span>
                </td>
                <td className="px-10 py-8">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    o.status === OrderStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 
                    o.status === OrderStatus.CANCELLED ? 'bg-red-50 text-red-600' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-10 py-8 text-right">
                  <span className="text-xs font-bold text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                </td>
                <td className="px-10 py-8 text-right">
                  {o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED && (
                    <button 
                      onClick={() => handleCancelOrder(o.id)}
                      className="text-xs font-black text-red-500 hover:underline uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  )}
                  {(o.status === OrderStatus.COMPLETED || o.status === OrderStatus.CANCELLED) && (
                    <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">Finalized</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function AdminPanel() {
  const { user } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // STRICT SECURITY CHECK: Role must be ADMIN AND Email must match Authorized Admin
  const isAuthorized = user?.role === UserRole.ADMIN && user?.email === AUTHORIZED_ADMIN_EMAIL;

  if (!isAuthorized) {
    return (
      <div className="py-40 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-3xl">
          <i className="fas fa-lock"></i>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-4">Secure Access Restricted</h2>
        <p className="text-gray-500 mb-10">Administrative privileges are strictly limited to verified platform accounts.</p>
        <Link to="/" className="text-emerald-600 font-black uppercase tracking-widest text-xs hover:underline">Return to Hub</Link>
      </div>
    );
  }

  const tabs = [
    { label: 'System Overview', path: '/admin', icon: 'grid-2' },
    { label: 'Member Directory', path: '/admin/users', icon: 'users-gear' },
    { label: 'Gig Moderation', path: '/admin/gigs', icon: 'bolt-lightning' },
    { label: 'Transactions', path: '/admin/payments', icon: 'credit-card' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-72 space-y-2 shrink-0">
          <div className="mb-10 px-5">
            <h1 className="text-3xl font-black text-gray-900 leading-none mb-3">Admin Panel</h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Ecosystem Orchestration</p>
          </div>
          {tabs.map(t => {
            const isActive = location.pathname === t.path;
            return (
              <Link 
                key={t.path} 
                to={t.path}
                className={`flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 font-black text-sm ${isActive ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 translate-x-2' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                <i className={`fas fa-${t.icon} w-6`}></i>
                <span>{t.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* Dynamic Content */}
        <div className="flex-grow min-w-0">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/gigs" element={<GigModeration />} />
            <Route path="/payments" element={<PaymentLedger />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
