import React, { useState, useEffect } from 'react';
import { Search, Power, RefreshCw, AlertCircle, Brain, Zap, Clock, Shield } from 'lucide-react';
import { Agent } from '../types';
import { generateMockAgents } from '../services/mockService';

const AgentCard: React.FC<{ agent: Agent; onAction: (id: string, action: string) => void }> = ({ agent, onAction }) => {
  const statusColor = 
    agent.status === 'IDLE' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
    agent.status === 'BUSY' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
    'text-slate-500 bg-slate-500/10 border-slate-500/20';

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50 shadow-sm flex flex-col h-full transition-all hover:border-slate-600">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700">
            <Brain className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h3 className="text-white font-medium leading-none">{agent.name}</h3>
            <span className="text-xs text-slate-500 mt-1 inline-block">{agent.type}</span>
          </div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColor}`}>
          {agent.status}
        </span>
      </div>

      <div className="flex-1 space-y-3 mb-6">
        {agent.currentTask && (
          <div className="bg-slate-900/50 p-2 rounded border border-slate-700 text-xs text-slate-300 flex items-start">
            <Zap className="w-3 h-3 mr-1.5 mt-0.5 text-yellow-500 flex-shrink-0" />
            <span className="line-clamp-2">{agent.currentTask}</span>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-slate-500 flex items-center">
            <Clock className="w-3 h-3 mr-1.5" />
            Uptime: {agent.uptime}h
          </div>
          <div className="text-slate-500 flex items-center">
            <Shield className="w-3 h-3 mr-1.5" />
            Caps: {agent.capabilities.length}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mt-2">
          {agent.capabilities.map(cap => (
            <span key={cap} className="px-2 py-0.5 bg-slate-700/50 rounded text-[10px] text-slate-400 border border-slate-700">
              {cap}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center gap-3">
        <button 
          onClick={() => onAction(agent.id, 'restart')}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center"
        >
          <RefreshCw className="w-3 h-3 mr-1.5" />
          Restart
        </button>
        <button 
          onClick={() => onAction(agent.id, agent.status === 'OFFLINE' ? 'start' : 'stop')}
          className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center border ${
            agent.status === 'OFFLINE' 
              ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
          }`}
        >
          <Power className="w-3 h-3 mr-1.5" />
          {agent.status === 'OFFLINE' ? 'Start' : 'Stop'}
        </button>
      </div>
    </div>
  );
};

const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    setAgents(generateMockAgents());
  }, []);

  const handleAction = (id: string, action: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== id) return a;
      if (action === 'stop') return { ...a, status: 'OFFLINE', currentTask: undefined };
      if (action === 'start') return { ...a, status: 'IDLE' };
      if (action === 'restart') return { ...a, uptime: 0, status: 'IDLE', currentTask: undefined };
      return a;
    }));
  };

  const filteredAgents = agents.filter(agent => {
    const matchesText = agent.name.toLowerCase().includes(filterText.toLowerCase()) || 
                        agent.type.toLowerCase().includes(filterText.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || agent.status === statusFilter;
    return matchesText && matchesStatus;
  });

  const stats = {
    total: agents.length,
    active: agents.filter(a => a.status === 'BUSY').length,
    idle: agents.filter(a => a.status === 'IDLE').length,
    offline: agents.filter(a => a.status === 'OFFLINE').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Management</h1>
          <p className="text-slate-400 text-sm">Monitor and control registered MCP agents</p>
        </div>
        <div className="flex gap-2">
           <div className="px-3 py-1 bg-slate-800 rounded border border-slate-700 text-xs text-slate-300">
             Total: <span className="font-bold text-white">{stats.total}</span>
           </div>
           <div className="px-3 py-1 bg-green-500/10 rounded border border-green-500/20 text-xs text-green-400">
             Active: <span className="font-bold">{stats.active}</span>
           </div>
           <div className="px-3 py-1 bg-slate-800 rounded border border-slate-700 text-xs text-slate-400">
             Offline: <span className="font-bold">{stats.offline}</span>
           </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search agents..." 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <select 
          className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 min-w-[150px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="IDLE">Idle</option>
          <option value="BUSY">Busy</option>
          <option value="OFFLINE">Offline</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAgents.map(agent => (
          <AgentCard key={agent.id} agent={agent} onAction={handleAction} />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700/50 border-dashed">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-slate-400 font-medium">No agents found matching criteria</p>
        </div>
      )}
    </div>
  );
};

export default Agents;