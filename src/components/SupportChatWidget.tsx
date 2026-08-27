import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

export const SupportChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    {
      sender: 'bot',
      text: 'Hello! 👋 I am VeloxBot, your 24/7 AI bus booking assistant. How can I help you today?'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    'How do I cancel my ticket?',
    'What is the baggage limit?',
    'Are promo codes available?',
    'How to track bus live GPS?'
  ];

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    const userMsg = prompt;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting right now. Please try again shortly.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Support service offline. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs group cursor-pointer animate-in zoom-in duration-200"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="hidden sm:inline">24x7 Help Chat</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[480px] overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1">
                  VeloxBot Support <Sparkles className="w-3 h-3 text-amber-300" />
                </h4>
                <p className="text-[10px] text-emerald-100">Always online • AI Powered</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/80 hover:text-white bg-black/10 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-900/50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    🤖
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white font-medium rounded-tr-none shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-slate-400 text-[11px]">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">🤖</div>
                <span>VeloxBot is typing...</span>
              </div>
            )}
          </div>

          {/* Quick Question Chips */}
          <div className="p-2 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-1">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-[10px] bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask VeloxBot anything..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
