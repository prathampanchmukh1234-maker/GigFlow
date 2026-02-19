
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../App';
import { generateGigImage, generateGigVideo } from '../services/geminiService';

export default function AiStudio() {
  const { user, notify } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialGigTitle = queryParams.get('title') || '';

  const [title, setTitle] = useState(initialGigTitle);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  if (!user) {
    navigate('/auth?mode=login');
    return null;
  }

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    } else {
      notify("Platform API Key configuration required.", "error");
    }
  };

  const handleGenerateImage = async () => {
    if (!title) return notify("Enter a service title first", "info");
    setIsGeneratingImage(true);
    try {
      const img = await generateGigImage(title, '1K');
      setGeneratedImage(img);
      notify("Masterpiece generated!", "success");
    } catch (e: any) {
      if (e.message?.includes("entity was not found")) {
        await handleOpenKeySelector();
      } else {
        notify("Image generation failed. Try again.", "error");
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!title) return notify("Enter a service title first", "info");
    setIsGeneratingVideo(true);
    setLoadingMsg("Initializing Veo Engine...");
    try {
      const videoUrl = await generateGigVideo(title, (msg) => setLoadingMsg(msg));
      setGeneratedVideo(videoUrl);
      notify("Video pitch ready!", "success");
    } catch (e: any) {
      if (e.message?.includes("entity was not found")) {
        await handleOpenKeySelector();
      } else {
        notify("Video generation failed. Ensure your API key has Veo access.", "error");
      }
    } finally {
      setIsGeneratingVideo(false);
      setLoadingMsg('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-16 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-emerald-900 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-2xl">
          <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></span>
          Experimental AI Media Core
        </div>
        <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tighter mb-6">
          Creative <span className="text-emerald-600">Studio</span>
        </h1>
        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
          Generate cinematic cover assets and promotional video pitches for your service using the world's most advanced AI models.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/20">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">Studio Controls</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Service Concept</label>
                <textarea 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Minimalist UI/UX for Fintech"
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none font-bold text-gray-900 transition-all min-h-[120px]"
                />
              </div>

              <div className="pt-6 border-t border-gray-50 space-y-4">
                <button 
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || isGeneratingVideo}
                  className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95 disabled:opacity-30"
                >
                  <i className={`fas ${isGeneratingImage ? 'fa-circle-notch fa-spin' : 'fa-image'} mr-3`}></i>
                  {isGeneratingImage ? 'Generating Image...' : 'Design 4K Cover'}
                </button>

                <button 
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingImage || isGeneratingVideo}
                  className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 active:scale-95 disabled:opacity-30"
                >
                  <i className={`fas ${isGeneratingVideo ? 'fa-circle-notch fa-spin' : 'fa-film'} mr-3`}></i>
                  {isGeneratingVideo ? 'Generating Video...' : 'Create Veo Pitch'}
                </button>
              </div>

              <p className="text-[10px] text-center text-gray-300 font-bold uppercase tracking-widest leading-relaxed">
                Premium API tokens required for Veo 3.1 & Imagen 4.0 access.
              </p>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2 space-y-8">
          {(isGeneratingImage || isGeneratingVideo) && (
            <div className="bg-gray-900 rounded-[3rem] p-20 text-center relative overflow-hidden animate-in fade-in duration-700 h-[600px] flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-10"></div>
                <h2 className="text-3xl font-black text-white mb-4">Rendering Creative Vision</h2>
                <p className="text-emerald-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse">
                  {loadingMsg || 'Processing High-Fidelity Layers...'}
                </p>
              </div>
            </div>
          )}

          {!isGeneratingImage && !isGeneratingVideo && !generatedImage && !generatedVideo && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] p-32 text-center h-[600px] flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-gray-200 mb-8 shadow-sm">
                <i className="fas fa-sparkles text-4xl"></i>
              </div>
              <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Your AI-generated assets will appear here</p>
            </div>
          )}

          {(generatedImage || generatedVideo) && !isGeneratingImage && !isGeneratingVideo && (
            <div className="space-y-12 animate-in slide-in-from-right-10 duration-700">
              {generatedImage && (
                <div className="bg-white border border-gray-100 rounded-[3rem] overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Generated Cover Art</span>
                    <button onClick={() => setGeneratedImage(null)} className="text-gray-300 hover:text-red-500"><i className="fas fa-trash"></i></button>
                  </div>
                  <img src={generatedImage} className="w-full object-cover" alt="Generated" />
                </div>
              )}

              {generatedVideo && (
                <div className="bg-white border border-gray-100 rounded-[3rem] overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cinematic Veo Pitch</span>
                    <button onClick={() => setGeneratedVideo(null)} className="text-gray-300 hover:text-red-500"><i className="fas fa-trash"></i></button>
                  </div>
                  <video src={generatedVideo} className="w-full" controls autoPlay loop muted />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
