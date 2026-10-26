import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSamsat } from '../../context/SamsatContext';
import { Bot, X, Send, User } from 'lucide-react';


// Gambar karakter yang sudah tersedia di aset website. Bila gambar tidak ada,
// tampilkan ikon standar agar tombol chatbot tetap dapat digunakan.
const MascotAvatar: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ size = 'small' }) => {
  const [failed, setFailed] = useState(false);
  const style = size === 'large' ? 'h-14 w-14' : size === 'medium' ? 'h-10 w-10' : 'h-8 w-8';
  return (
    <span className={`${style} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200/50`}>
      {failed ? <Bot className="h-1/2 w-1/2 text-[#005BAC]" aria-hidden="true" /> :
        <img src="/images/karakter.png" alt="" className="h-full w-full object-contain" onError={() => setFailed(true)} />}
    </span>
  );
};

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const SamsatChatbot: React.FC = () => {
  const { chatbotFaqs, setCurrentPage } = useSamsat();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Halo! Saya asisten virtual UPPD Banyumas. Silakan pilih pertanyaan di bawah atau tuliskan pertanyaan tentang pelayanan SAMSAT.',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Saran cepat juga berasal dari jawaban yang diaktifkan petugas.
  const quickSuggestions = chatbotFaqs.filter(f => f.isEnabled).slice(0, 6).map(f => f.question);

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

      // Hanya jawaban aktif dari API publik yang boleh dijadikan respons.
      const match = chatbotFaqs.find(f => {
        if (!f.isEnabled) return false;
        const title = f.question.toLowerCase().trim();
        const keywordMatch = f.keywords.some(k => k.trim() && lowerQuery.includes(k.trim().toLowerCase()));
        return lowerQuery === title || lowerQuery.includes(title) || (lowerQuery.length >= 4 && title.includes(lowerQuery)) || keywordMatch;
      });
      if (match) {
        botResponse = match.answer;
      } else {
        botResponse = 'Maaf, jawaban untuk pertanyaan tersebut belum tersedia. Silakan lihat halaman FAQ atau hubungi petugas melalui halaman Kontak.';
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
        className="relative h-16 w-16 rounded-full bg-[#005BAC] text-white flex items-center justify-center shadow-xl border-2 border-white cursor-pointer group"
        aria-label="SAMSAT Assistant Chatbot"
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <MascotAvatar size="large" />
        )}

      </motion.button>

      {/* Panel percakapan dengan avatar karakter UPPD */}
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
                  <MascotAvatar size="medium" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm tracking-tight text-white">Asisten UPPD Banyumas</h3>
                  </div>
                  <p className="text-[11px] text-sky-200">Informasi layanan SAMSAT</p>
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
                    <MascotAvatar />
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
                  <MascotAvatar />
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

            <div className="px-3 py-2 bg-white text-right border-t border-slate-100">
              <button type="button" onClick={() => { setIsOpen(false); setCurrentPage('faq'); }}
                className="text-[11px] font-semibold text-[#005BAC] hover:underline">
                Lihat semua FAQ
              </button>
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
