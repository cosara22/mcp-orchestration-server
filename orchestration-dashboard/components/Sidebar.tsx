
import React from 'react';
import { LayoutDashboard, Activity, FileText, GitCommit, Settings, Server, ChevronLeft, ChevronRight, Bot, Radio, Terminal, Share2 } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isCollapsed, onToggle }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'metrics', label: 'Metrics', icon: Activity },
    { id: 'agents', label: 'Agents', icon: Bot },
    { id: 'playground', label: 'Playground', icon: Terminal },
    { id: 'topology', label: 'Topology', icon: Share2 },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'traces', label: 'Traces', icon: GitCommit },
  ];

  return (
    <aside 
      className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 border-r border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-20 transition-all duration-300 ease-in-out`}
    >
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-slate-800 relative`}>
        <Server className="w-6 h-6 text-primary-500 flex-shrink-0 transition-all" />
        
        <div className={`ml-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          <span className="font-bold text-lg tracking-tight text-white whitespace-nowrap">MCP Observer</span>
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-slate-800 text-slate-400 border border-slate-700 rounded-full p-1.5 hover:text-white hover:bg-slate-700 transition-colors z-50 shadow-lg flex items-center justify-center"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-2.5 rounded-lg transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-primary-600/10 text-primary-500' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-primary-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
              
              <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                {item.label}
              </span>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-slate-700 z-50 shadow-md transition-opacity">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-2 transition-all`}>
           <div className={`relative flex items-center justify-center ${isCollapsed ? '' : 'mr-2'}`}>
              <span className="absolute w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75"></span>
              <span className="relative w-2 h-2 rounded-full bg-green-500"></span>
           </div>
           <span className={`text-xs font-mono text-green-500 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
             WS CONNECTED
           </span>
        </div>

        <button 
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors w-full group relative`}
        >
          <Settings className={`w-4 h-4 flex-shrink-0 ${isCollapsed ? '' : 'mr-2'}`} />
          <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            Settings
          </span>
          
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-slate-700 z-50 shadow-md transition-opacity">
              Settings
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
