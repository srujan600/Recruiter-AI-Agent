import React, { useState } from 'react';
import { sendAgentQuery } from '../../services/api';
import type { AgentChatMessage } from '../../types';

interface AIRecruiterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, candidateId?: number) => void;
}

export const AIRecruiterDrawer: React.FC<AIRecruiterDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello Sarah! I am your **TalentOS AI Recruiter Agent**. How can I assist your hiring workflow today?',
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (customMsg?: string) => {
    const textToSend = customMsg || inputText;
    if (!textToSend.trim()) return;

    const userMsg: AgentChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customMsg) setInputText('');
    setIsTyping(true);

    try {
      const res = await sendAgentQuery(textToSend);
      const assistantMsg: AgentChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.response,
        action_type: res.action_type,
        action_payload: res.action_payload,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Sorry, I encountered an issue executing your agent command. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[#d3e4fe]">
        <div className="p-4 border-b border-[#eff4ff] bg-[#131b2e] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#006c49] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">AI Recruiter Assistant</h2>
              <span className="text-[10px] text-[#6cf8bb] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6cf8bb] animate-pulse"></span>
                Active Agent Session
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#c6c6cd] hover:text-white text-lg p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-3 bg-[#f8f9ff] border-b border-[#d3e4fe] flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            'Find best Python candidates',
            'Shortlist Alexander Chen',
            'Schedule interview',
            'Analyze pipeline bottlenecks'
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 bg-white border border-[#c6c6cd] text-[#006c49] hover:bg-[#eff4ff] text-[11px] font-bold rounded-lg shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 bg-[#f8f9ff]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-[#006c49] text-white rounded-br-none shadow-2xs font-medium'
                    : 'bg-white text-[#0b1c30] border border-[#d3e4fe] rounded-bl-none shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                {msg.action_type === 'shortlist' && (
                  <div className="pt-2 border-t border-[#eff4ff] mt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate('pipeline');
                      }}
                      className="w-full py-1.5 bg-[#131b2e] text-white font-bold text-[11px] rounded-lg hover:bg-[#213145] transition-colors"
                    >
                      Open Pipeline Board →
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#76777d] mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[#006c49] font-bold bg-white p-3 rounded-xl border border-[#d3e4fe] w-fit">
              <span className="material-symbols-outlined animate-spin text-sm">sync</span>
              <span>AI Recruiter Agent is evaluating...</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#d3e4fe] bg-white flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI agent to shortlist, schedule, search..."
            className="flex-1 bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl px-4 py-2.5 text-xs text-[#0b1c30] focus:outline-none focus:border-[#006c49]"
          />
          <button
            onClick={() => handleSend()}
            className="w-10 h-10 rounded-xl bg-[#006c49] hover:bg-[#005236] text-white flex items-center justify-center shadow-2xs transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
