import React from 'react';
import { LayoutDashboard, Activity, FileText, GitCommit, Settings, Server, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface SidebarProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    isCollapsed: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isCollapsed, onToggle }) => {
    const { t } = useLanguage();

    const menuItems = [
        { id: 'dashboard', label: t('overview'), icon: LayoutDashboard },
        { id: 'metrics', label: t('metrics'), icon: Activity },
        { id: 'logs', label: t('logs'), icon: FileText },
        { id: 'traces', label: t('traces'), icon: GitCommit },
    ];

    return (
        <aside
            className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 border-r border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-20 transition-all duration-300 ease-in-out`}
        >
            <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-slate-800 relative`}>
                <Server className="w-6 h-6 text-primary-500 flex-shrink-0 transition-all" />

                <div className={`ml-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    <span className="font-bold text-lg tracking-tight text-white whitespace-nowrap">{t('appName')}</span>
                </div>

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
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-2.5 rounded-lg transition-all duration-200 group relative ${isActive
                                ? 'bg-primary-600/10 text-primary-500'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-primary-500' : 'text-slate-500 group-hover:text-slate-300'}`} />

                            <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                {item.label}
                            </span>

                            {isCollapsed && (
                                <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-slate-700 z-50 shadow-md transition-opacity">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                {/* Settings Button */}
                <button
                    onClick={() => onNavigate('settings')}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-2.5 rounded-lg transition-all duration-200 group relative ${currentPage === 'settings'
                        ? 'bg-primary-600/10 text-primary-500'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                >
                    <Settings className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} ${currentPage === 'settings' ? 'text-primary-500' : 'text-slate-500 group-hover:text-slate-300'
                        }`} />
                    <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                        }`}>
                        {t('settings')}
                    </span>

                    {isCollapsed && (
                        <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-slate-700 z-50 shadow-md transition-opacity">
                            {t('settings')}
                        </div>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
