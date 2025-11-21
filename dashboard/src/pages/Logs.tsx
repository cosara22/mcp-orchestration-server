import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, RefreshCw, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { apiService } from '../services/api';
import { LogEntry, LogLevel } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

const LogIcon: React.FC<{ level: LogLevel }> = ({ level }) => {
    switch (level) {
        case LogLevel.ERROR: return <AlertOctagon className="w-4 h-4 text-red-500" />;
        case LogLevel.WARN: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        default: return <Info className="w-4 h-4 text-blue-500" />;
    }
};

const Logs: React.FC = () => {
    const { t } = useLanguage();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filterText, setFilterText] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('ALL');
    const [isLoading, setIsLoading] = useState(false);

    const loadLogs = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getLogs(100);
            setLogs(data);
        } catch (error) {
            console.error('Failed to load logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesText =
                log.message.toLowerCase().includes(filterText.toLowerCase()) ||
                log.trace_id?.toLowerCase().includes(filterText.toLowerCase()) ||
                log.task_id?.toLowerCase().includes(filterText.toLowerCase());

            const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;

            return matchesText && matchesLevel;
        });
    }, [logs, filterText, levelFilter]);

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white">{t('systemLogs')}</h1>
                    <p className="text-slate-400 text-sm">{t('systemLogsDesc')}</p>
                </div>
                <button
                    onClick={loadLogs}
                    disabled={isLoading}
                    className={`p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Filters */}
            <div className="bg-slate-800 p-4 rounded-t-xl border border-slate-700/50 border-b-0 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                    >
                        <option value="ALL">{t('allLevels')}</option>
                        <option value="info">{t('info')}</option>
                        <option value="warn">{t('warn')}</option>
                        <option value="error">{t('error')}</option>
                    </select>
                </div>
            </div>

            {/* Log Table Header */}
            <div className="bg-slate-800 border-x border-slate-700/50 px-4 py-2 grid grid-cols-12 gap-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div className="col-span-2">{t('timestamp')}</div>
                <div className="col-span-1">{t('level')}</div>
                <div className="col-span-6">{t('message')}</div>
                <div className="col-span-3">{t('traceId')}</div>
            </div>

            {/* Log List */}
            <div className="flex-1 bg-slate-900 border border-slate-700/50 rounded-b-xl overflow-y-auto custom-scrollbar">
                {filteredLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        {t('noLogsFound')}
                    </div>
                ) : (
                    filteredLogs.map((log, index) => (
                        <div
                            key={`${log.timestamp}-${index}`}
                            className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-800 hover:bg-slate-800/50 transition-colors text-sm font-mono group"
                        >
                            <div className="col-span-2 text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
                                {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="col-span-1 flex items-center">
                                <LogIcon level={log.level} />
                                <span className={`ml-2 font-bold ${log.level === 'error' ? 'text-red-400' :
                                    log.level === 'warn' ? 'text-yellow-400' : 'text-blue-400'
                                    }`}>
                                    {log.level.toUpperCase()}
                                </span>
                            </div>
                            <div className="col-span-6 text-slate-300 break-words">
                                {log.message}
                                {log.agent_type && (
                                    <span className="ml-2 text-xs text-slate-500 font-normal">
                                        [{log.agent_type}]
                                    </span>
                                )}
                            </div>
                            <div className="col-span-3 text-slate-500 text-xs flex items-center">
                                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 truncate w-full">
                                    {log.trace_id || '-'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-2 text-xs text-slate-500 text-right">
                {t('showingEvents', { count: filteredLogs.length })}
            </div>
        </div>
    );
};

export default Logs;
