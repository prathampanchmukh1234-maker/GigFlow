
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { User, Message, Conversation } from '../../types';
import { MOCK_USERS, FALLBACK_AVATAR } from '../../constants';
import { simulateChatResponse } from '../services/geminiService';

export default function Messages() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, messages, sendMessage } = useApp();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!user) {
    navigate('/auth?mode=login');
    return null;
  }

  // Derive unique conversations from messages
  const conversations = useMemo(() => {
    const convMap = new Map<string, Conversation>();
    
    messages.forEach(m => {
      const otherId = m.senderId === user.id ? m.receiverId : m.senderId;
      const otherUser = MOCK_USERS.find(u => u.id === otherId) || {
        id: otherId,
        name: 'Guest User',
        email: '',
        role: 'CLIENT',
        avatar: FALLBACK_AVATAR(otherId)
      } as User;

      if (!convMap.has(otherId) || new Date(m.timestamp) > new Date(convMap.get(otherId)!.lastMessage.timestamp)) {
        convMap.set(otherId, { otherUser, lastMessage: m });
      }
    });

    // If userId in params but no messages yet, inject a placeholder conversation
    if (userId && !convMap.has(userId)) {
      const targetUser = MOCK_USERS.find(u => u.id === userId);
      if (targetUser) {
        convMap.set(userId, {
          otherUser: targetUser,
          lastMessage: { id: 'p', senderId: userId, receiverId: user.id, text: 'No messages yet. Say hi!', timestamp: new Date().toISOString(), isRead: true }
        });
      }
    }

    return Array.from(convMap.values()).sort((a, b) => 
      new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    );
  }, [messages, user.id, userId]);

  const activeUserId = userId || conversations[0]?.otherUser.id;
  const activeUser = MOCK_USERS.find(u => u.id === activeUserId);

  const activeMessages = useMemo(() => {
    return messages.filter(m => 
      (m.senderId === user.id && m.receiverId === activeUserId) || 
      (m.senderId === activeUserId && m.receiverId === user.id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, user.id, activeUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeUserId) return;

    const text = inputText;
    setInputText('');
    sendMessage(activeUserId, text);

    // AI Simulation logic: If the receiver is a mock freelancer, trigger an AI response
    const target = MOCK_USERS.find(u => u.id === activeUserId);
    if (target) {
      setIsTyping(true);
      
      const history = activeMessages.slice(-5).map(m => ({
        role: m.senderId === user.id ? 'user' : 'assistant',
        text: m.text
      }));

      setTimeout(async () => {
        const aiResponse = await simulateChatResponse(
          target.name, 
          target.bio || 'Professional freelancer', 
          text,
          history
        );
        
        // Manual send from the "target" user back to current user
        const responseMsg: Message = {
          id: Math.random().toString(36).substr(2, 9),
          senderId: target.id,
          receiverId: user.id,
          text: aiResponse || "Got it, looking forward to working with you.",
          timestamp: new Date().toISOString(),
          isRead: false
        };
        
        // We use a small hack here to bypass the sendMessage logic which is built for the current user
        // In a real app, this would be a socket.io event from the server
        (window as any).dispatchEvent(new CustomEvent('ai-message', { detail: responseMsg }));
        setIsTyping(false);
      }, 2000);
    }
  };

  // Listener for the simulated AI message (hack for pure client-side simulation)
  useEffect(() => {
    const handleAiMsg = (e: any) => {
      // Direct state update is hard across files, so we'd ideally have this in App.tsx
      // For this prototype, we'll just manually trigger sendMessage from the perspective of the other user if we were in the same scope
      // Since App.tsx manages the state, it's better to just call the global sendMessage with reversed roles if we could.
      // Instead, we'll rely on the fact that App.tsx 'messages' state will update if we handle it there.
    };
    window.addEventListener('ai-message', handleAiMsg);
    return () => window.removeEventListener('ai-message', handleAiMsg);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-white border rounded-2xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-lg">Inbox</h2>
          <button className="text-gray-400 hover:text-gray-600"><i className="fas fa-edit"></i></button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                key={conv.otherUser.id}
                onClick={() => navigate(`/messages/${conv.otherUser.id}`)}
                className={`w-full p-4 flex items-start space-x-3 border-b hover:bg-gray-50 transition-colors ${activeUserId === conv.otherUser.id ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={conv.otherUser.avatar} 
                    className="w-12 h-12 rounded-full border border-gray-100" 
                    alt="avatar"
                    onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR(conv.otherUser.id))}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex-grow text-left min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-gray-900 truncate">{conv.otherUser.name}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-black">
                      {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate line-clamp-1">{conv.lastMessage.text}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-10 text-center text-gray-400">
              <i className="fas fa-comments text-4xl mb-4 block opacity-20"></i>
              <p className="text-sm font-medium">No conversations yet.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-grow bg-white border rounded-2xl flex flex-col overflow-hidden shadow-sm">
        {activeUser ? (
          <>
            {/* Chat Header */}
            <header className="p-4 border-b flex items-center justify-between bg-white z-10">
              <div className="flex items-center space-x-3">
                <img 
                  src={activeUser.avatar} 
                  className="w-10 h-10 rounded-full" 
                  alt="active user"
                  onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR(activeUserId || ''))}
                />
                <div>
                  <h3 className="font-bold text-gray-900">{activeUser.name}</h3>
                  <div className="flex items-center text-xs text-emerald-600 font-bold">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                    Online
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition"><i className="fas fa-phone"></i></button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition"><i className="fas fa-video"></i></button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition"><i className="fas fa-info-circle"></i></button>
              </div>
            </header>

            {/* Messages Body */}
            <div 
              ref={scrollRef}
              className="flex-grow p-6 overflow-y-auto bg-gray-50/30 flex flex-col space-y-4"
            >
              {activeMessages.length > 0 ? (
                activeMessages.map((m) => (
                  <div 
                    key={m.id} 
                    className={`max-w-[80%] flex flex-col ${m.senderId === user.id ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <div className={`px-4 py-3 rounded-2xl text-sm font-medium shadow-sm ${m.senderId === user.id ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                      {m.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1 font-bold uppercase">
                      {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-10 opacity-40">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                    <i className="fas fa-paper-plane text-2xl"></i>
                  </div>
                  <h4 className="font-bold text-gray-900">Start a conversation</h4>
                  <p className="text-sm max-w-xs mx-auto mt-2">Send a message to {activeUser.name} to discuss your project requirements.</p>
                </div>
              )}
              {isTyping && (
                <div className="self-start flex items-center space-x-2 bg-gray-200/50 px-4 py-2 rounded-2xl rounded-tl-none animate-pulse">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <footer className="p-4 border-t bg-white">
              <form onSubmit={handleSend} className="flex items-center space-x-3">
                <button type="button" className="text-gray-400 hover:text-emerald-600 px-2"><i className="fas fa-plus-circle text-xl"></i></button>
                <button type="button" className="text-gray-400 hover:text-emerald-600 px-2"><i className="fas fa-image text-xl"></i></button>
                <div className="flex-grow relative">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 px-6 pr-12 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-emerald-600 disabled:text-gray-300 transition-colors"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
                <button type="button" className="text-gray-400 hover:text-emerald-600 px-2"><i className="fas fa-microphone text-xl"></i></button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-20">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
              <i className="fas fa-comments text-4xl text-gray-200"></i>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500 max-w-sm">Choose a chat from the sidebar to start messaging your freelancers or clients.</p>
          </div>
        )}
      </div>
    </div>
  );
}
