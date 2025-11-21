
import React, { useState, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Metrics from './pages/Metrics';
import Logs from './pages/Logs';
import Traces from './pages/Traces';
import Agents from './pages/Agents';
import Playground from './pages/Playground';
import Topology from './pages/Topology';

// Simple client-side router component since we can't use Browser Router reliably in all envs without server config
// and HashRouter was suggested, but a state-based router is cleaner for this specific SPA structure.

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'metrics': return <Metrics />;
      case 'agents': return <Agents />;
      case 'playground': return <Playground />;
      case 'topology': return <Topology />;
      case 'logs': return <Logs />;
      case 'traces': return <Traces />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-primary-500/30">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <main 
        className={`flex-1 p-8 overflow-x-hidden transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Suspense fallback={<div className="text-slate-500">Loading view...</div>}>
          {renderPage()}
        </Suspense>
      </main>
    </div>
  );
};

export default App;
