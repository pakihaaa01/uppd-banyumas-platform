import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSamsat } from '../../context/SamsatContext';
import { resolveChatAnswer } from './matchChatbotAnswer';
import { MessageCircle, X, Send, User } from 'lucide-react';


interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const SamsatChatbot: React.FC = () => {
  const { chatbotFaqs, faqs, serviceLocations, setCurrentPage } = useSamsat();
  const [isOpen, setIsOpen] = useState(false);
  const [mascotImageFailed, setMascotImageFailed] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Halo! Saya Mas Sajak, asisten virtual UPPD Kabupaten Banyumas. Silakan tanyakan informasi mengenai layanan SAMSAT.',
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

    // Responses come only from active database records or a brief greeting.
    setTimeout(() => {
      const botResponse = resolveChatAnswer(query, chatbotFaqs, faqs, serviceLocations).text;

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


  return (
    <div className="fixed bottom-3 right-3 z-50 sm:bottom-5 sm:right-6">
      {/* Mas Sajak tampil utuh sebagai tombol; hilang ketika panel percakapan dibuka. */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="mas-sajak-launcher"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-end"
          >
            <div className="relative mb-2 mr-6 w-[215px] rounded-2xl border border-[#d8e5ed] bg-white px-4 py-3 text-[#23465d] shadow-lg sm:w-[234px]" aria-hidden="true">
              <p className="text-[13px] font-bold leading-5">Hai, saya Mas Sajak!</p>
              <p className="mt-1 text-[12px] leading-5 text-[#536c7d]">Butuh informasi SAMSAT? Klik saya untuk mulai chat.</p>
              <span className="absolute -bottom-[7px] right-7 h-3 w-3 rotate-45 border-b border-r border-[#d8e5ed] bg-white" />
            </div>
            <motion.button
              type="button"
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.045, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex min-h-[104px] w-[108px] cursor-pointer items-end justify-center bg-transparent p-0 outline-none drop-shadow-[0_8px_8px_rgba(21,40,53,0.22)] focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC] sm:w-[132px]"
              aria-label="Buka chat dengan Mas Sajak"
              aria-expanded={false}
              aria-controls="mas-sajak-chat-panel"
            >
              {mascotImageFailed ? (
                <span className="flex h-24 w-24 items-center justify-center rounded-xl border border-[#c8dbe6] bg-white text-[#005BAC]">
                  <MessageCircle size={36} aria-hidden="true" />
                </span>
              ) : (
                <img
                  src="/images/mas-sajak.png"
                  alt=""
                  draggable={false}
                  onError={() => setMascotImageFailed(true)}
                  className="block h-auto w-full select-none object-contain"
                />
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mas-sajak-chat-panel"
            key="mas-sajak-chat-panel"
            role="dialog"
            aria-label="Chat dengan Mas Sajak"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex h-[min(540px,calc(100dvh-1.5rem))] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:w-[390px]"
          >
            {/* Chatbot Header */}
            <div className="bg-gradient-to-r from-slate-900 via-[#003d75] to-[#005BAC] p-4 text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm tracking-tight text-white">Mas Sajak</h3>
                  </div>
                  <p className="text-[11px] text-sky-200">Asisten virtual UPPD Banyumas</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup chat Mas Sajak"
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
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#e5eff8] text-[#005BAC]">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#e5eff8] text-[#005BAC]">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
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
