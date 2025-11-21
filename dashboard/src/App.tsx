import React, { useState, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Metrics from './pages/Metrics';
import Logs from './pages/Logs';
import Traces from './pages/Traces';
import Settings from './pages/Settings';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <Dashboard />;
            case 'metrics': return <Metrics />;
            case 'logs': return <Logs />;
            case 'traces': return <Traces />;
            case 'settings': return <Settings />;
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
                className={`flex-1 p-8 overflow-x-hidden transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-64'
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
