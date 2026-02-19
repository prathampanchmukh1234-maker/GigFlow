
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, FALLBACK_IMAGE, FALLBACK_AVATAR } from '../../constants';
import { useApp } from '../App';
import { searchAssistant } from '../services/geminiService';

const CATEGORY_ICONS: Record<string, string> = {
  "Prompt Engineering": "wand-magic-sparkles",
  "UI/UX Design": "bezier-curve",
  "Graphics & Design": "palette",
  "Digital Marketing": "bullhorn",
  "Writing & Translation": "pen-nib",
  "Video & Animation": "video",
  "Programming & Tech": "code",
  "Data": "database",
  "Business": "briefcase"
};

const ScrollReveal: React.FC<{ children: React.ReactNode, delay?: number, className?: string }> = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[1000ms] cubic-bezier(0.22, 1, 0.36, 1) ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ suggestedCategories: string[], keywords: string[], advice: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [offset, setOffset] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setOffset(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        const results = await searchAssistant(searchQuery);
        if (results) setSuggestions(results);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setSuggestions(null);
        setShowDropdown(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const selectSuggestion = (term: string, type: 'cat' | 'q') => {
    setSearchQuery(term);
    setShowDropdown(false);
    navigate(`/marketplace?${type}=${encodeURIComponent(term)}`);
  };

  return (
    <div className="relative bg-white text-gray-900 overflow-hidden min-h-screen flex items-center justify-center py-40">
      {/* Soft Light Background Elements */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute top-0 left-0 w-[80%] h-[80%] bg-emerald-50/40 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ transform: `translate(${-50 + offset * 0.05}%, ${-50 + offset * 0.05}%)` }}
        ></div>
        <div 
          className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-teal-50/40 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2"
          style={{ transform: `translate(${50 + offset * -0.05}%, ${50 + offset * -0.05}%)` }}
        ></div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <div className="inline-flex items-center px-5 py-2.5 bg-emerald-50 border border-emerald-100 rounded-full mb-10 transition-all hover:bg-emerald-100 cursor-default shadow-sm">
            <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mr-3">Now Live</span>
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">AI & Design Specialist Hubs</span>
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={100}>
          <h1 
            className="text-6xl sm:text-8xl md:text-[9rem] font-black tracking-tight mb-12 leading-[0.85] text-gray-900"
          >
            The <span className="text-emerald-600">Future</span> <br /> 
            of Work is <span className="italic font-serif bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Specialized.</span>
          </h1>
        </ScrollReveal>
        
        <ScrollReveal delay={200}>
          <p className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
            Discover the world's most elite Prompt Engineers, UI/UX Studios, and AI Architects in one curated marketplace.
          </p>
        </ScrollReveal>
        
        {/* Fix: Wrapped ScrollReveal in a div to hold the dropdownRef correctly for click-outside detection as ScrollReveal does not accept ref prop */}
        <div ref={dropdownRef} className="max-w-3xl mx-auto relative">
          <ScrollReveal delay={300}>
            <form 
              onSubmit={handleSearch} 
              className={`flex items-center bg-white border border-gray-100 rounded-[2.5rem] p-3 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-700 group ${showDropdown ? 'ring-[16px] ring-emerald-500/5 border-emerald-200' : ''}`}
            >
              <div className="flex-grow relative flex items-center pl-6">
                <i className={`fas ${isSearching ? 'fa-circle-notch fa-spin' : 'fa-search'} text-emerald-500 transition-colors mr-5 text-2xl`}></i>
                <input 
                  type="text" 
                  placeholder='Try "Enterprise Prompt Architect"' 
                  className="w-full py-6 bg-transparent text-gray-900 focus:outline-none text-2xl font-black placeholder:text-gray-200 tracking-tight"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length > 2 && setShowDropdown(true)}
                />
              </div>
              <button type="submit" className="bg-gray-900 text-white px-14 py-6 rounded-[2rem] font-black text-xl hover:bg-emerald-600 transition-all active:scale-95 shadow-xl">
                Go
              </button>
            </form>

            {showDropdown && suggestions && (
              <div className="absolute top-full left-0 right-0 mt-8 bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-50 overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-10 duration-500">
                <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.3em] flex items-center">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-4 animate-pulse"></div>
                    AI Context Engine Suggestions
                  </span>
                  {suggestions.advice && <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest max-w-[50%] text-right">{suggestions.advice}</span>}
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] px-4 mb-4">Categories</h4>
                    {suggestions.suggestedCategories.map((cat) => (
                      <button 
                        key={cat}
                        onClick={() => selectSuggestion(cat, 'cat')}
                        className="w-full text-left px-5 py-4 rounded-[1.5rem] hover:bg-emerald-600 hover:text-white transition-all flex items-center group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mr-5 group-hover:bg-white/20 group-hover:text-white transition-colors">
                          <i className={`fas fa-${CATEGORY_ICONS[cat] || 'tag'} text-lg`}></i>
                        </div>
                        <span className="font-black text-sm">{cat}</span>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] px-4 mb-2">Smart Keywords</h4>
                    <div className="flex flex-wrap gap-3 p-2">
                      {suggestions.keywords.map((kw) => (
                        <button 
                          key={kw}
                          onClick={() => selectSuggestion(kw, 'q')}
                          className="px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollReveal>
        </div>

        <ScrollReveal delay={400} className="mt-20 flex flex-wrap justify-center items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em]">
          <span className="text-gray-300">Trending Now:</span>
          {["Prompt Engineering", "UI/UX", "3D Motion"].map(item => (
            <Link 
              key={item}
              to={`/marketplace?q=${encodeURIComponent(item)}`} 
              className="px-6 py-2.5 rounded-full border border-gray-100 bg-white hover:bg-emerald-50 hover:border-emerald-200 transition-all text-gray-500 hover:text-emerald-600 shadow-sm"
            >
              {item}
            </Link>
          ))}
        </ScrollReveal>
      </div>
    </div>
  );
};

const GigCard: React.FC<{ gig: any, isTrending?: boolean }> = ({ gig, isTrending }) => (
  <div className={`bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden group hover:shadow-[0_40px_80px_rgba(16,185,129,0.12)] transition-all duration-700 flex flex-col h-full hover:-translate-y-4 ${isTrending ? 'ring-2 ring-emerald-500/5' : ''}`}>
    <Link to={`/gig/${gig.id}`} className="relative h-72 overflow-hidden">
      <img 
        src={gig.images[0]} 
        alt={gig.title} 
        className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" 
        onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
      />
      <div className="absolute top-6 left-6 flex flex-col gap-3">
        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-gray-900 uppercase tracking-widest shadow-lg">
          {gig.category}
        </div>
        {isTrending && (
          <div className="bg-emerald-600 px-4 py-2 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl flex items-center">
            <i className="fas fa-fire mr-2 animate-pulse"></i> Trending
          </div>
        )}
      </div>
    </Link>
    <div className="p-8 flex flex-col flex-grow text-left">
      <div className="flex items-center space-x-4 mb-6">
        <img src={FALLBACK_AVATAR(gig.sellerId)} className="w-12 h-12 rounded-2xl border border-gray-100 object-cover shadow-sm" alt="avatar" />
        <div>
          <span className="text-sm font-black text-gray-900 block leading-none mb-1.5">{gig.sellerName}</span>
          <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.15em]">Elite Verified</span>
        </div>
      </div>
      <Link to={`/gig/${gig.id}`} className="text-xl font-black text-gray-900 hover:text-emerald-600 mb-6 line-clamp-2 leading-tight transition-colors">
        {gig.title}
      </Link>
      <div className="flex items-center text-emerald-600 text-[11px] mb-8 bg-emerald-50 w-fit px-4 py-1.5 rounded-full border border-emerald-100 font-black uppercase tracking-widest">
        <i className="fas fa-star text-yellow-500 mr-2.5"></i>
        <span className="text-emerald-900">{gig.rating}</span>
        <span className="text-emerald-300 mx-3">|</span>
        <span className="text-emerald-700">{gig.reviewsCount} Sales</span>
      </div>
      <div className="mt-auto pt-8 border-t border-gray-50 flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase font-black text-gray-400 block mb-1 tracking-tighter">Starting at</span>
          <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{gig.price}</span>
        </div>
        <Link to={`/gig/${gig.id}`} className="w-14 h-14 rounded-[1.5rem] bg-gray-900 text-white flex items-center justify-center hover:bg-emerald-600 transition-all shadow-xl hover:scale-110 active:scale-95">
          <i className="fas fa-arrow-right text-lg"></i>
        </Link>
      </div>
    </div>
  </div>
);

export default function Home() {
  const { gigs } = useApp();

  const promptGigs = gigs.filter(g => g.category === "Prompt Engineering").slice(0, 4);
  const uxGigs = gigs.filter(g => g.category === "UI/UX Design").slice(0, 4);
  const trendingMix = gigs.filter(g => 
    g.id.startsWith('pe_') || g.id.startsWith('ux_') || g.id.startsWith('tg_')
  ).slice(0, 4);

  return (
    <div className="bg-white overflow-x-hidden">
      <Hero />
      
      {/* Category Grid Section */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
          <div className="max-w-2xl text-left">
            <h2 className="text-5xl sm:text-7xl font-black text-gray-900 mb-8 leading-[0.9] tracking-tighter">
              Discover <span className="text-emerald-600">Hubs</span>
            </h2>
            <p className="text-2xl text-gray-400 font-medium leading-relaxed">The world's first specialized destination for AI and Design excellence.</p>
          </div>
          <Link to="/marketplace" className="inline-flex items-center px-10 py-5 bg-gray-50 border border-gray-100 rounded-3xl text-gray-900 font-black hover:bg-emerald-600 hover:text-white transition-all shadow-sm group">
            Browse All Hubs <i className="fas fa-grid-2 ml-4 group-hover:rotate-90 transition-transform"></i>
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10">
          {CATEGORIES.map((cat, index) => (
            <ScrollReveal key={cat} delay={index * 100}>
              <Link 
                to={`/marketplace?cat=${encodeURIComponent(cat)}`}
                className="group relative flex flex-col items-center p-12 bg-gray-50/50 rounded-[3rem] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] transition-all duration-700 border border-transparent hover:border-emerald-100 hover:bg-white hover:-translate-y-4"
              >
                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-10 group-hover:bg-emerald-600 group-hover:scale-110 transition-all duration-500 shadow-sm">
                  <i className={`fas fa-${CATEGORY_ICONS[cat] || 'star'} text-4xl text-emerald-600 group-hover:text-white`}></i>
                </div>
                <span className="text-center font-black text-gray-900 tracking-tighter text-sm uppercase px-2">{cat}</span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Featured Gigs Section */}
      <section className="py-32 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="flex flex-col lg:flex-row items-center justify-between mb-24 gap-12 text-left">
            <div>
              <h2 className="text-5xl font-black text-gray-900 mb-6 flex items-center leading-none tracking-tighter">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-3xl flex items-center justify-center mr-8 shadow-xl">
                  <i className="fas fa-bolt text-2xl"></i>
                </div>
                Trending Specialized Talent
              </h2>
              <p className="text-2xl text-gray-400 font-medium max-w-2xl leading-relaxed">Hand-picked professionals pushing the boundaries of what's possible.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {trendingMix.map((gig, index) => (
              <ScrollReveal key={gig.id} delay={index * 150}>
                <GigCard gig={gig} isTrending />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer Subtle Detail */}
      <footer className="py-20 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white mr-4 shadow-lg">
              <i className="fas fa-bolt text-lg"></i>
            </div>
            <span className="font-black text-gray-900 text-2xl tracking-tighter">GigFlow</span>
          </div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
            &copy; 2025 SPECIALIZED ECONOMY • ALL RIGHTS RESERVED
          </div>
          <div className="flex space-x-8 text-gray-300">
             <i className="fab fa-twitter hover:text-emerald-600 transition-colors cursor-pointer text-xl"></i>
             <a href="https://www.linkedin.com/in/pratham-panchmukh-21635b298" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors text-xl">
               <i className="fab fa-linkedin"></i>
             </a>
             <i className="fab fa-dribbble hover:text-emerald-600 transition-colors cursor-pointer text-xl"></i>
          </div>
        </div>
      </footer>
    </div>
  );
}
