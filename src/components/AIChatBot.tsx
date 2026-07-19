import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Persona } from '../types';
import { MessageSquare, Sparkles, Send, Loader2, HelpCircle, User, Bot } from 'lucide-react';

interface AIChatBotProps {
  activePersona: Persona;
  onChangePersona: (persona: Persona) => void;
}

export default function AIChatBot({
  activePersona,
  onChangePersona,
}: AIChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions based on active persona
  const suggestedQuestions: Record<Persona, string[]> = {
    fan: [
      'How do I find accessible ADA parking & entry?',
      'Can I bring clear plastic bags and water bottles?',
      'How do I get to the Metrolink station?',
    ],
    organizer: [
      'Draft a safety advisory for a bottleneck at Gate C.',
      'Recommend crowd mitigation actions for high gate throughput.',
      'How should we allocate ushers during sudden rain?',
    ],
    volunteer: [
      'What are the entry scanning protocols for digital tickets?',
      'How do I report a scanning system failure?',
      'What is the standard procedure for lost-and-found?',
    ],
  };

  useEffect(() => {
    // Scroll to bottom of chat whenever messages or loading state changes
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Seed initial welcoming message based on persona
  useEffect(() => {
    const getWelcomeMessage = (): string => {
      switch (activePersona) {
        case 'fan':
          return `👋 Welcome to the FIFA World Cup 2026 Fan Support. Ask me about seat navigation, accessibility, transport links, or venue safety in English, Spanish, or French!`;
        case 'organizer':
          return `🚨 Operations Command Advisor active. Input incident descriptions, congestion points, or logistical queries to generate safety briefings or PA drafts.`;
        case 'volunteer':
          return `⚽ Volunteer Lead active. Ready to guide you through ticketing scan protocols, concierge desks, and lost-and-found policies.`;
      }
    };

    setMessages([
      {
        id: 'welcome-' + activePersona,
        role: 'model',
        text: getWelcomeMessage(),
        timestamp: new Date().toISOString()
      }
    ]);
  }, [activePersona]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setChatError(null);

    try {
      // Map history format: { role: 'user' | 'model', text: string }
      const historyPayload = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          persona: activePersona,
          history: historyPayload
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response. Please verify process.env.GEMINI_API_KEY is configured in the secrets menu.');
      }

      const data = await response.json();

      const modelMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'model',
        text: data.text || 'Unable to fetch response details.',
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || 'An error occurred. Check server logs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[520px] shadow-xl overflow-hidden" id="operational-chat-container">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-950/40 border border-blue-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              FIFA 2026 AI Assistant
            </h3>
            <p className="text-[11px] text-slate-400">Customized model for multi-turn planning & help</p>
          </div>
        </div>

        {/* Quick persona switcher */}
        <select
          value={activePersona}
          onChange={(e) => onChangePersona(e.target.value as Persona)}
          className="bg-slate-900 border border-slate-800 focus:border-blue-500 text-xs font-bold text-slate-200 px-2.5 py-1.5 rounded-lg outline-none cursor-pointer"
          id="chat-persona-selector"
          aria-label="Select AI assistant role persona context"
        >
          <option value="fan">Fan Assistance</option>
          <option value="organizer">Venue Organizer</option>
          <option value="volunteer">Volunteer App</option>
        </select>
      </div>

      {/* Messages Scroll Container */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/20"
        role="log"
        aria-live="polite"
        aria-label="FIFA Chat Transcript Log"
      >
        {chatError && (
          <div className="p-3.5 bg-red-950/60 border border-red-800/40 rounded-xl text-xs text-red-200">
            <p className="font-semibold">Chat Assistance Warning:</p>
            <p className="mt-1">{chatError}</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            id={`chat-bubble-${msg.id}`}
          >
            {msg.role === 'model' && (
              <div className="p-1.5 bg-blue-950/40 border border-blue-500/10 rounded-lg text-blue-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`rounded-2xl p-3.5 text-xs max-w-[85%] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-md'
            }`}>
              {/* Formatted Text rendering with basic markdown-like list supports */}
              <div className="space-y-1 whitespace-pre-wrap">
                {msg.text.split('\n').map((line, lIdx) => {
                  if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                    return <div key={lIdx} className="pl-3 relative before:content-['•'] before:absolute before:left-0 text-slate-300">{line.substring(1).trim()}</div>;
                  }
                  return <p key={lIdx}>{line}</p>;
                })}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-blue-950/40 border border-blue-500/10 rounded-lg text-blue-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900/50 text-slate-400 border border-slate-800/40 rounded-2xl rounded-tl-none p-3.5 text-xs flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>FIFA Assistant is analyzing and drafting...</span>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/50 flex gap-1.5 overflow-x-auto select-none no-scrollbar">
        {suggestedQuestions[activePersona].map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(sq)}
            className="shrink-0 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded-full px-3 py-1 text-[11px] font-semibold text-slate-350 transition-colors whitespace-nowrap"
            id={`suggested-question-${idx}`}
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input Tray */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            required
            placeholder={`Ask our ${activePersona} model anything...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none"
            id="chat-input-text"
            aria-label={`Ask our ${activePersona} model anything`}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            id="chat-btn-submit"
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-950 text-white p-2.5 rounded-xl flex items-center justify-center transition-all shadow-md shadow-blue-500/15"
            aria-label="Send message to AI assistant"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
