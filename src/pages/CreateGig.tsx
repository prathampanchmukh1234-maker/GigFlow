
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApp } from '../App';
import { CATEGORIES } from '../../constants';
import { generateGigDescription } from '../services/geminiService';
import { UserRole } from '../../types';

const gigSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100, 'Title too long'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(50, 'Description should be at least 50 characters for better visibility'),
  price: z.number().min(500, 'Minimum price is ₹500'),
  deliveryTime: z.number().min(1, 'Delivery must be at least 1 day'),
  imageUrl: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
});

type GigFormValues = z.infer<typeof gigSchema>;

export default function CreateGig() {
  const { user, addGig } = useApp();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<GigFormValues>({
    resolver: zodResolver(gigSchema),
    defaultValues: {
      category: CATEGORIES[0],
      price: 5000,
      deliveryTime: 3,
    }
  });

  const title = watch('title');
  const imageUrl = watch('imageUrl');

  if (!user || user.role !== UserRole.FREELANCER) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">Only freelancers can create services.</p>
        <button onClick={() => navigate('/')} className="mt-6 text-emerald-600 font-bold">Go Home</button>
      </div>
    );
  }

  const handleAiDescription = async () => {
    if (!title || title.length < 10) {
      alert("Please enter a more descriptive service title first!");
      return;
    }
    setIsGenerating(true);
    const aiText = await generateGigDescription(title, watch('category'));
    if (aiText) setValue('description', aiText);
    setIsGenerating(false);
  };

  const onSubmit = async (data: GigFormValues) => {
    const newGig = {
      seller_id: user.id,
      seller_name: user.name,
      title: data.title,
      category: data.category,
      description: data.description,
      price: data.price,
      delivery_time: data.deliveryTime,
      images: [data.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800'],
      rating: 5.0,
      reviews_count: 0
    };

    await addGig(newGig as any);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create a New Service</h1>
        <p className="text-gray-500 font-medium">Reach millions of buyers with your professional expertise.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-gray-200/20 p-10 space-y-10">
        <div className="space-y-4">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Service Title</label>
          <input 
            {...register('title')}
            type="text" 
            placeholder="I will provide expert UI/UX design for SaaS"
            className={`w-full p-5 bg-gray-50 border ${errors.title ? 'border-red-300' : 'border-gray-100'} rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-lg font-bold transition-all`}
          />
          {errors.title && <p className="text-xs text-red-500 font-bold">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Category</label>
            <select 
              {...register('category')}
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold appearance-none bg-white"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Price (₹)</label>
            <input 
              {...register('price', { valueAsNumber: true })}
              type="number" 
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold"
            />
            {errors.price && <p className="text-xs text-red-500 font-bold">{errors.price.message}</p>}
          </div>
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Delivery (Days)</label>
            <input 
              {...register('deliveryTime', { valueAsNumber: true })}
              type="number" 
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold"
            />
            {errors.deliveryTime && <p className="text-xs text-red-500 font-bold">{errors.deliveryTime.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Service Image URL</label>
          <input 
            {...register('imageUrl')}
            type="url" 
            placeholder="https://images.unsplash.com/..."
            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-medium transition-all"
          />
          {errors.imageUrl && <p className="text-xs text-red-500 font-bold">{errors.imageUrl.message}</p>}
          {imageUrl && !errors.imageUrl && (
            <div className="mt-4 relative h-48 rounded-2xl overflow-hidden border border-gray-100">
               <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
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
              {isGenerating ? 'Drafting...' : 'Magic Write with AI'}
            </button>
          </div>
          <textarea 
            {...register('description')}
            rows={8}
            placeholder="Tell your clients exactly what you provide..."
            className={`w-full p-5 bg-gray-50 border ${errors.description ? 'border-red-300' : 'border-gray-100'} rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-medium leading-relaxed`}
          ></textarea>
          {errors.description && <p className="text-xs text-red-500 font-bold">{errors.description.message}</p>}
        </div>

        <div className="pt-10 border-t border-gray-50 flex justify-end space-x-6">
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')}
            className="px-10 py-4 text-gray-400 font-black hover:text-gray-900 transition-colors uppercase tracking-widest text-xs"
          >
            Discard
          </button>
          <button 
            type="submit" 
            className="px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
          >
            Publish Service
          </button>
        </div>
      </form>
    </div>
  );
}
