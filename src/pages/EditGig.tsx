
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../App';
import { CATEGORIES } from '../../constants';
import { generateGigDescription } from '../services/geminiService';
import { UserRole } from '../../types';

export default function EditGig() {
  const { id } = useParams();
  const { user, gigs, updateGig, notify } = useApp();
  const navigate = useNavigate();
  
  const gigToEdit = gigs.find(g => g.id === id);

  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    description: '',
    price: 5000,
    deliveryTime: 3,
    imageUrl: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (gigToEdit) {
      setFormData({
        title: gigToEdit.title,
        category: gigToEdit.category,
        description: gigToEdit.description,
        price: gigToEdit.price,
        deliveryTime: gigToEdit.deliveryTime,
        imageUrl: gigToEdit.images[0] || ''
      });
    } else {
        navigate('/dashboard');
    }
  }, [gigToEdit, navigate]);

  if (!user || user.role !== UserRole.FREELANCER || !gigToEdit || gigToEdit.sellerId !== user.id) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">You do not have permission to edit this service.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-6 text-emerald-600 font-bold">Back to Dashboard</button>
      </div>
    );
  }

  const handleAiDescription = async () => {
    if (!formData.title) {
      alert("Please enter a service title first!");
      return;
    }
    setIsGenerating(true);
    const aiText = await generateGigDescription(formData.title, formData.category);
    setFormData(prev => ({ ...prev, description: aiText || '' }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedGig = {
      ...gigToEdit,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      price: formData.price,
      deliveryTime: formData.deliveryTime,
      images: [formData.imageUrl || gigToEdit.images[0]],
    };

    updateGig(updatedGig);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Edit Service</h1>
        <p className="text-gray-500 font-medium text-lg">Update your professional offering to keep it competitive.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-gray-200/20 p-10 space-y-10">
        <div className="space-y-4">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Service Title</label>
          <input 
            type="text" 
            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-lg font-bold transition-all"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Category</label>
            <select 
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold appearance-none bg-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Price (₹)</label>
            <input 
              type="number" 
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold"
              required
              min="500"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Delivery (Days)</label>
            <input 
              type="number" 
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold"
              required
              min="1"
              value={formData.deliveryTime}
              onChange={(e) => setFormData({ ...formData, deliveryTime: parseInt(e.target.value) || 1 })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Service Image URL</label>
          <input 
            type="url" 
            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-medium transition-all"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />
          {formData.imageUrl && (
            <div className="mt-4 relative h-48 rounded-2xl overflow-hidden border border-gray-100">
               <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Service Description</label>
            <button 
              type="button"
              onClick={handleAiDescription}
              disabled={isGenerating}
              className="text-xs font-black bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full flex items-center hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50 border border-emerald-100 shadow-sm"
            >
              <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-magic'} mr-2`}></i>
              {isGenerating ? 'Drafting...' : 'Re-Write with AI'}
            </button>
          </div>
          <textarea 
            rows={8}
            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-medium leading-relaxed"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>
        </div>

        <div className="pt-10 border-t border-gray-50 flex justify-end space-x-6">
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')}
            className="px-10 py-4 text-gray-400 font-black hover:text-gray-900 transition-colors uppercase tracking-widest text-xs"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
          >
            Update Service
          </button>
        </div>
      </form>
    </div>
  );
}
