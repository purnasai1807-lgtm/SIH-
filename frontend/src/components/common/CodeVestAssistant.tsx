import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User as UserIcon, HelpCircle } from 'lucide-react';
import { apiRequest } from '../../services/apiClient';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  category?: string;
}

const PRESET_PROMPTS = [
  'Why did this business\'s health score decline?',
  'What are the biggest risks in the automotive sector?',
  'What happens if revenue falls 20%?',
  'Which businesses have low dependency risk?',
  'Explain how Business Trust Health Score is calculated.',
  'Why is ABC Manufacturing ranked as a Prime Match?'
];

export const CodeVestAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Hello, I am CodeVest Intelligence. I can explain business health scores, simulate downside scenarios, evaluate supplier/customer dependencies, and break down model risk signals. How can I help you analyze financing opportunities today?',
      timestamp: 'Just now'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await apiRequest<unknown>('/borrower/improvement-insights');
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Live backend insights for “${query}”:\n${JSON.stringify(response, null, 2)}`,
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: error instanceof Error ? error.message : 'Live insights are unavailable until you sign in.',
        timestamp: 'Just now'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        id="codevest-ai-floating-btn"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl border border-slate-700/80 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        aria-label="Open CodeVest Intelligence Assistant"
      >
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold tracking-wide">CodeVest Intelligence</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Side Panel Assistant Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold tracking-tight">CodeVest Intelligence</h3>
                    <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded">
                      Model Engine
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Decision-support & risk reasoning</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Disclaimer Banner */}
            <div className="bg-blue-50/70 border-b border-blue-100 px-4 py-2 text-[11px] text-blue-900 flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>AI answers synthesize verified financial telemetry and model risk parameters.</span>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      CV
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200 whitespace-pre-line'
                    }`}
                  >
                    {m.text}
                    <div
                      className={`text-[10px] mt-1.5 ${
                        m.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px]">Evaluating financial parameters...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/70">
              <div className="text-[11px] font-semibold text-slate-500 mb-2">Suggested Inquiries</div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {PRESET_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p)}
                    className="text-[11px] text-left bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 transition cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200 bg-white">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask CodeVest Intelligence..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
