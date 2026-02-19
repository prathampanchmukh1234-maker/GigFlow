
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useApp } from '../App';
import { CATEGORIES, FALLBACK_IMAGE, FALLBACK_AVATAR } from '../../constants';
import { chatWithMatchAssistant } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
  match?: { category: string; query: string };
}

const AiMatchModal = ({ isOpen, onClose, onMatch }: { isOpen: boolean, onClose: () => void, onMatch: (cat: string, query: string) => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your GigFlow Talent Scout. Describe the project you're working on, and I'll find the perfect professionals for you." }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText;
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    
    setIsTyping(true);
    // Build history for Gemini
    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const result = await chatWithMatchAssistant(userText, history);
    setIsTyping(false);

    if (result) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: result.reply, 
        match: result.match 
      }]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden flex flex-col h-[650px]">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white shrink-0 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <i className="fas fa-robot text-xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 leading-tight">AI Talent Scout</h3>
              <div className="flex items-center text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Context Engine Active
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-all hover:rotate-90">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 bg-gray-50/30 space-y-6 scroll-smooth">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] text-sm font-bold shadow-sm ${
                m.role === 'user' 
                ? 'bg-gray-900 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                {m.text}
              </div>
              
              {m.match && (
                <div className="mt-4 p-5 bg-emerald-900 rounded-[1.5rem] text-white w-full max-w-[85%] animate-in slide-in-from-left-4 duration-500 shadow-xl shadow-emerald-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Match Found</span>
                    <i className="fas fa-check-circle text-emerald-400"></i>
                  </div>
                  <p className="text-sm font-black mb-1">Recommended: {m.match.category}</p>
                  <p className="text-xs font-bold text-emerald-100/60 mb-6 italic">Keywords: "{m.match.query}"</p>
                  <button 
                    onClick={() => {
                      onMatch(m.match!.category, m.match!.query);
                      onClose();
                    }}
                    className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95"
                  >
                    Apply AI Filter
                  </button>
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center space-x-2 bg-white/50 border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none w-fit animate-pulse">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-8 border-t border-gray-100 bg-white shrink-0">
          <form onSubmit={handleSend} className="flex items-center space-x-4">
            <div className="flex-grow relative">
              <input 
                type="text" 
                placeholder="Talk to the Talent Scout..." 
                className="w-full bg-gray-50 border border-gray-100 rounded-full py-5 px-8 pr-16 focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all font-bold text-gray-900"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center disabled:opacity-30 transition-all hover:bg-emerald-600"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
            Powered by Gemini 3 Flash Chat Context
          </p>
        </div>
      </div>
    </div>
  );
};

export default function Marketplace() {
  const { gigs, notify } = useApp();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const initialCategory = queryParams.get('cat') || 'All';
  const initialQuery = queryParams.get('q') || '';
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    setSelectedCategory(queryParams.get('cat') || 'All');
    setSearchQuery(queryParams.get('q') || '');
  }, [location.search]);

  const filteredGigs = useMemo(() => {
    return gigs.filter(gig => {
      const matchesCategory = selectedCategory === 'All' || gig.category === selectedCategory;
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const keywords = searchQuery.toLowerCase().split(' ').filter(word => word.length > 1);
        matchesSearch = keywords.some(word => 
          gig.title.toLowerCase().includes(word) || 
          gig.description.toLowerCase().includes(word) ||
          gig.category.toLowerCase().includes(word)
        );
      }
      const matchesPrice = gig.price >= priceRange[0] && gig.price <= priceRange[1];
      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [gigs, selectedCategory, searchQuery, priceRange]);

  const handleAiMatchApply = (cat: string, query: string) => {
    setSelectedCategory(cat);
    setSearchQuery(query);
    notify(`AI Scout found matches in ${cat}`, 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setPriceRange([0, 5000]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AiMatchModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        onMatch={handleAiMatchApply}
      />

      {/* Header & Search Section */}
      <div className="flex flex-col items-center mb-16 text-center">
        <nav className="flex text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <span className="mx-3 opacity-30">/</span>
          <span className="text-emerald-600">Discover Marketplace</span>
        </nav>
        
        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight mb-8">
          {selectedCategory === 'All' ? 'Browse Global Services' : `The ${selectedCategory} Hub`}
        </h1>

        <div className="w-full max-w-3xl relative group">
          <div className="absolute -top-3 left-8 z-20">
            <div className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-emerald-200 flex items-center space-x-2">
              <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
              <span>AI Search Ready</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-25 transition-all duration-500"></div>
            
            <div className="relative flex items-center bg-white border border-gray-100 rounded-[2.2rem] p-2 shadow-2xl shadow-emerald-900/5 transition-all duration-300 focus-within:ring-8 focus-within:ring-emerald-500/5">
              <div className="pl-6 pr-4 text-emerald-500 text-xl">
                <i className="fas fa-search group-focus-within:scale-110 transition-transform"></i>
              </div>
              <input 
                type="text" 
                placeholder="Search for 'Prompt Architect', 'SaaS Design', or any service..." 
                className="w-full py-5 text-gray-900 focus:outline-none font-bold text-lg placeholder:text-gray-300 placeholder:font-medium bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="bg-gray-900 text-white px-10 py-5 rounded-[1.8rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 hidden sm:block shadow-xl shadow-gray-200 group-focus-within:shadow-emerald-200">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-72 space-y-10 flex-shrink-0">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400 flex items-center">
              Categories
            </h3>
            <div className="space-y-1">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`flex items-center justify-between w-full text-left px-5 py-4 rounded-2xl transition-all duration-200 ${selectedCategory === 'All' ? 'bg-emerald-600 text-white font-black shadow-xl shadow-emerald-200' : 'text-gray-600 font-bold hover:bg-gray-100'}`}
              >
                <span>All Services</span>
                <i className={`fas fa-chevron-right text-[10px] ${selectedCategory === 'All' ? 'opacity-100' : 'opacity-0'}`}></i>
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center justify-between w-full text-left px-5 py-4 rounded-2xl transition-all duration-200 ${selectedCategory === cat ? 'bg-emerald-600 text-white font-black shadow-xl shadow-emerald-200' : 'text-gray-600 font-bold hover:bg-gray-100'}`}
                >
                  <span>{cat}</span>
                  <i className={`fas fa-chevron-right text-[10px] ${selectedCategory === cat ? 'opacity-100' : 'opacity-0'}`}></i>
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 bg-emerald-500 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <h4 className="font-black text-lg mb-3 relative flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
              AI Talent Scout
            </h4>
            <p className="text-xs text-gray-400 mb-8 leading-relaxed font-bold">Chat with our scout to find the top 1% of talent for your specific needs.</p>
            <button 
              onClick={() => setIsAiModalOpen(true)}
              className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 hover:text-white transition-all active:scale-95 shadow-lg flex items-center justify-center"
            >
              <i className="fas fa-comments mr-2"></i> Start Matching
            </button>
          </div>
        </aside>

        {/* Gigs Grid */}
        <div className="flex-grow">
          {filteredGigs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGigs.map(gig => (
                <div key={gig.id} className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden group hover:shadow-[0_30px_60px_rgba(16,185,129,0.1)] transition-all duration-500 flex flex-col h-full hover:-translate-y-2">
                  <Link to={`/gig/${gig.id}`} className="relative h-60 block overflow-hidden">
                    <img 
                      src={gig.images[0]} 
                      alt={gig.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" 
                      onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                    />
                  </Link>
                  <div className="p-7 flex flex-col flex-grow">
                    <div className="flex items-center space-x-3 mb-5">
                      <img 
                        src={FALLBACK_AVATAR(gig.sellerId)} 
                        className="w-10 h-10 rounded-xl border border-emerald-500/10 object-cover" 
                        alt="avatar" 
                      />
                      <div>
                        <span className="text-xs font-black text-gray-900 block leading-tight mb-0.5">{gig.sellerName}</span>
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Elite Level</span>
                      </div>
                    </div>
                    <Link to={`/gig/${gig.id}`} className="text-gray-900 font-black text-lg hover:text-emerald-600 mb-4 line-clamp-2 h-14 leading-tight transition-colors">
                      {gig.title}
                    </Link>
                    <div className="flex items-center text-yellow-500 text-sm mb-6 bg-yellow-50/50 w-fit px-3 py-1 rounded-full border border-yellow-100">
                      <i className="fas fa-star mr-1.5"></i>
                      <span className="font-black text-gray-900">{gig.rating}</span>
                      <span className="text-gray-400 ml-2 font-bold text-xs">({gig.reviewsCount})</span>
                    </div>
                    <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-black text-gray-400 tracking-tighter mb-0.5">Starting at</span>
                        <span className="text-2xl font-black text-gray-900 tracking-tight">${gig.price}</span>
                      </div>
                      <Link to={`/gig/${gig.id}`} className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95">
                        <i className="fas fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-24 text-center rounded-[3rem] border border-dashed border-gray-200 shadow-sm">
              <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-10 text-gray-200">
                <i className="fas fa-search-minus text-5xl"></i>
              </div>
              <h3 className="text-3xl font-black mb-4 text-gray-900">No services found</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-12 font-medium text-lg leading-relaxed">
                {searchQuery 
                  ? `Our AI Scout suggested searching for "${searchQuery}" in ${selectedCategory}, but no exact matches were found.`
                  : "We couldn't find any services matching these filters."}
              </p>
              <button 
                onClick={resetFilters}
                className="px-12 py-5 bg-gray-900 text-white rounded-[1.8rem] font-black hover:bg-emerald-600 shadow-2xl shadow-gray-200 transition-all active:scale-95 uppercase tracking-widest text-xs"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
