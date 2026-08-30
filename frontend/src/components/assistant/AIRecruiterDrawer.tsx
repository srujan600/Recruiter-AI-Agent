import React, { useState } from 'react';
import { sendAgentQuery } from '../../services/api';
import type { AgentChatMessage } from '../../types';
import { SpatialAIOrb } from '../common/SpatialAIOrb';

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
      {/* Dim Backdrop Blur Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Floating Spatial Drawer (Level 4 Depth) */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl h-full shadow-2xl flex flex-col z-10 border-l border-[#d3e4fe] depth-l4">
        {/* Spatial Header */}
        <div className="p-4 border-b border-[#eff4ff] bg-gradient-to-r from-[#131b2e] via-[#1b263e] to-[#0b1c30] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <SpatialAIOrb size="sm" active={true} />
            <div>
              <h2 className="text-sm font-black tracking-tight text-white">AI Recruiter Assistant</h2>
              <span className="text-[10px] text-[#6cf8bb] font-extrabold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6cf8bb] animate-ping" />
                Active Agent Session
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#c6c6cd] hover:text-white text-lg p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 bg-[#f8f9ff] border-b border-[#d3e4fe] flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            'Find top Python candidates',
            'Analyze candidate Alexander Chen',
            'Compare top candidates',
            'Schedule technical interviews',
            'Show hiring bottlenecks'
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="btn-3d btn-3d-glass px-3 py-1.5 text-[11px] font-extrabold rounded-xl shrink-0 text-[#006c49]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 bg-spatial-grid">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-4 rounded-2xl text-xs space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-[#007c54] to-[#006c49] text-white rounded-br-none shadow-md font-semibold'
                    : 'card-3d bg-white text-[#0b1c30] rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</div>

                {msg.action_type === 'shortlist' && (
                  <div className="pt-2 border-t border-[#eff4ff] mt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate('pipeline');
                      }}
                      className="w-full btn-3d btn-3d-navy py-2 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1"
                    >
                      <span>Open Pipeline Board</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#76777d] mt-1 px-1.5 font-medium">{msg.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2.5 text-xs text-[#006c49] font-extrabold card-3d p-3.5 w-fit shadow-xs">
              <span className="material-symbols-outlined animate-spin text-base">sync</span>
              <span>AI Recruiter Agent is evaluating...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#d3e4fe] bg-white flex items-center gap-2.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI agent to shortlist, schedule, compare candidates..."
            className="flex-1 bg-[#f4f7fc] border border-[#c6c6cd] rounded-xl px-4 py-2.5 text-xs text-[#0b1c30] focus:outline-none focus:border-[#006c49] inset-depth font-medium"
          />
          <button
            onClick={() => handleSend()}
            className="btn-3d btn-3d-emerald w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          >
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
