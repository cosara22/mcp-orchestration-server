
import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Bot, User, PlayCircle, Eraser } from 'lucide-react';
import { Agent, ChatMessage } from '../types';
import { api } from '../services/api';

const Playground: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mockAgents = generateMockAgents();
    setAgents(mockAgents);
    if (mockAgents.length > 0) {
      setSelectedAgentId(mockAgents[0].id);
    }
    // Initial welcome message
    setMessages([{
      id: 'init',
      role: 'system',
      content: 'Welcome to the Agent Playground. Select an agent and start testing interactions.',
      timestamp: new Date().toISOString()
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedAgentId) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate response
    const responseText = await api.sendAgentMessage(selectedAgentId, input);
    
    const agentMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, agentMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'system',
      content: 'Chat history cleared.',
      timestamp: new Date().toISOString()
    }]);
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Agent Playground</h1>
        <p className="text-slate-400 text-sm">Directly interact with agents to test prompts and tools</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Sidebar: Configuration */}
        <div className="w-72 flex flex-col gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700/50">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Select Agent</label>
            <select 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name} ({agent.type})</option>
              ))}
            </select>
          </div>

          {selectedAgent && (
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-sm space-y-2">
              <div className="flex justify-between items-center">
                 <span className="text-slate-500">Status</span>
                 <span className={`px-2 py-0.5 rounded text-xs ${
                   selectedAgent.status === 'BUSY' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                 }`}>{selectedAgent.status}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Capabilities</span>
                <div className="flex flex-wrap gap-1">
                  {selectedAgent.capabilities.map(cap => (
                    <span key={cap} className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">{cap}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto">
             <button 
               onClick={clearChat}
               className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 p-2 rounded transition-colors text-sm"
             >
               <Trash2 size={16} />
               Clear History
             </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700/50 flex flex-col overflow-hidden relative">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-primary-600' : msg.role === 'system' ? 'bg-slate-700' : 'bg-purple-600'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary-600/20 text-white border border-primary-600/30 rounded-tr-sm' 
                    : msg.role === 'system'
                    ? 'bg-slate-800 text-slate-400 border border-slate-700 text-center w-full py-1 text-xs'
                    : 'bg-slate-700/50 text-slate-200 border border-slate-700 rounded-tl-sm'
                }`}>
                  {msg.role !== 'system' && msg.content}
                  {msg.role === 'system' && <span className="italic">{msg.content}</span>}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-slate-700/50 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-800 border-t border-slate-700">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message to the agent..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 resize-none h-[3rem] max-h-32"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !selectedAgentId || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center">
              <PlayCircle size={12} className="mr-1" />
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;
