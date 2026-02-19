
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApp } from '../App';
import { UserRole } from '../../types';
import { supabase } from '../services/supabaseClient';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = loginSchema.extend({
  role: z.nativeEnum(UserRole),
  name: z.string().min(2, 'Name is too short'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useApp();
  
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'signup' ? 'signup' : 'login';
  const urlRole = queryParams.get('role');
  
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(mode === 'login' ? loginSchema : signupSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: urlRole === 'seller' ? UserRole.FREELANCER : UserRole.CLIENT,
    }
  });

  const selectedRole = watch('role');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const redirectTo = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      notify(err.message || "Google Sign-In failed", "error");
      setIsLoading(false);
    }
  };

  const onAuthSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
              role: data.role,
            }
          }
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          const { error: profileError } = await supabase.from('profiles').insert([{
            id: authData.user.id,
            email: data.email,
            name: data.name,
            role: data.role,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`
          }]);
          if (profileError) console.error("Profile sync error", profileError);
        }

        notify("Registration successful! Check your email to verify.", "success");
        setMode('login');
      } else {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) throw signInError;

        notify("Welcome back!", "success");
        navigate('/dashboard');
      }
    } catch (err: any) {
      notify(err.message || "Authentication failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-20 px-4">
      <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl p-10 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-emerald-700 font-bold">Processing Authentication...</p>
          </div>
        )}

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mb-6 text-emerald-600">
            <i className="fas fa-bolt text-3xl"></i>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">GigFlow</h1>
          <p className="text-gray-500 font-medium">
            {mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to start hiring or selling.'}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-gray-300">
            <span className="bg-white px-4">Or use email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onAuthSubmit)} className="space-y-6">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  {...register('name')}
                  type="text" 
                  className={`w-full p-4 bg-gray-50 border ${errors.name ? 'border-red-300 ring-4 ring-red-500/10' : 'border-gray-100'} rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium`}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Join as</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setValue('role', UserRole.CLIENT)}
                    className={`py-3.5 rounded-2xl border-2 font-bold transition-all duration-200 flex flex-col items-center space-y-1 ${selectedRole === UserRole.CLIENT ? 'border-emerald-600 text-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-100' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    <i className="fas fa-shopping-cart text-lg"></i>
                    <span className="text-sm">Client</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setValue('role', UserRole.FREELANCER)}
                    className={`py-3.5 rounded-2xl border-2 font-bold transition-all duration-200 flex flex-col items-center space-y-1 ${selectedRole === UserRole.FREELANCER ? 'border-emerald-600 text-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-100' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    <i className="fas fa-laptop-code text-lg"></i>
                    <span className="text-sm">Seller</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
            <input 
              {...register('email')}
              type="email" 
              className={`w-full p-4 bg-gray-50 border ${errors.email ? 'border-red-300 ring-4 ring-red-500/10' : 'border-gray-100'} rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500 font-bold">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
              {mode === 'login' && <button type="button" className="text-xs font-bold text-emerald-600 hover:underline">Forgot password?</button>}
            </div>
            <input 
              {...register('password')}
              type="password" 
              className={`w-full p-4 bg-gray-50 border ${errors.password ? 'border-red-300 ring-4 ring-red-500/10' : 'border-gray-100'} rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500 font-bold">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 active:scale-[0.98] disabled:opacity-50"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-10 text-center text-sm font-medium">
          <span className="text-gray-400">
            {mode === 'login' ? "New to GigFlow?" : "Already on GigFlow?"}
          </span>
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="ml-2 text-emerald-600 font-bold hover:underline"
          >
            {mode === 'login' ? 'Join Now' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
