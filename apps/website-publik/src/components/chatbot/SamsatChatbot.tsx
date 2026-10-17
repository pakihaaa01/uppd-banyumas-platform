import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSamsat } from '../../context/SamsatContext';
import {
  Bot,
  X,
  Send,
  MessageSquare,
  Sparkles,
  User,
  ChevronRight,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const SamsatChatbot: React.FC = () => {
  const { chatbotFaqs, setCurrentPage } = useSamsat();
  const [isOpen, setIsOpen] = useState(false);
  const [hasBadge, setHasBadge] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Halo 👋\nSaya adalah asisten virtual SAMSAT Banyumas.\nSaya dapat membantu menjawab pertanyaan seputar layanan SAMSAT.',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickSuggestions = [
    'Cara Bayar Pajak',
    'Lokasi SAMSAT',
    'Jadwal SAMSAT Keliling',
    'Download SIGNAL',
    'Download Sekpole',
    'Persyaratan Pajak',
    'Hubungi Petugas'
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Dynamic response lookup against chatbotFaqs
    setTimeout(() => {
      let botResponse = '';
      const lowerQuery = query.toLowerCase();

      // Search match in chatbotFaqs
      const match = chatbotFaqs.find(f => {
        if (!f.isEnabled) return false;
        const matchTitle = f.question.toLowerCase().includes(lowerQuery) || lowerQuery.includes(f.question.toLowerCase());
        const matchKeywords = f.keywords.some(k => lowerQuery.includes(k.toLowerCase()));
        return matchTitle || matchKeywords;
      });

      if (match) {
        botResponse = match.answer;
      } else if (lowerQuery.includes('kontak') || lowerQuery.includes('wa') || lowerQuery.includes('telepon')) {
        botResponse = 'Anda dapat menghubungi Call Center SAMSAT Banyumas di (0281) 635123 atau WhatsApp Resmi Pengaduan di 0812-2345-6789.';
      } else if (lowerQuery.includes('lokasi') || lowerQuery.includes('alamat')) {
        botResponse = 'SAMSAT Banyumas memiliki 10 titik layanan termasuk SAMSAT Induk Purwokerto, Drive Thru, Wangon, Sokaraja, Rita Mall, dan SAMSAT Keliling.';
      } else {
        botResponse = `Maaf, saya belum sepenuhnya memahami pertanyaan "${query}". Anda dapat memilih menu saran cepat di bawah atau mengunjungi halaman FAQ & Kontak petugas kami.`;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    if (hasBadge) setHasBadge(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Toggle Button */}
      <motion.button
        onClick={handleToggleOpen}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full bg-gradient-to-r from-[#005BAC] to-blue-700 text-white flex items-center justify-center shadow-2xl border-2 border-white cursor-pointer group"
        aria-label="SAMSAT Assistant Chatbot"
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        )}

        {/* Notification Badge */}
        {hasBadge && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white text-[9px] font-bold text-slate-900 items-center justify-center">1</span>
          </span>
        )}
      </motion.button>

      {/* Expandable Chat Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute bottom-16 right-0 w-[92vw] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px] max-h-[80vh]"
          >
            {/* Chatbot Header */}
            <div className="bg-gradient-to-r from-slate-900 via-[#003d75] to-[#005BAC] p-4 text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 text-sky-300">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm tracking-tight text-white">SAMSAT Assistant</h3>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <p className="text-[11px] text-sky-200">Asisten Virtual SAMSAT Banyumas</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Scroll Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-xl bg-[#005BAC] text-white flex items-center justify-center shrink-0 text-xs shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-[#005BAC] text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        msg.sender === 'user' ? 'text-sky-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 text-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Animation Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <div className="w-7 h-7 rounded-xl bg-[#005BAC] text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#005BAC] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#005BAC] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#005BAC] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Horizontal Scroll */}
            <div className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {quickSuggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleSendMessage(sug)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#005BAC] text-[11px] font-bold shrink-0 border border-slate-200 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Chat Input Field */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ketik pertanyaan..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-[#005BAC] hover:bg-blue-800 disabled:opacity-40 text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
