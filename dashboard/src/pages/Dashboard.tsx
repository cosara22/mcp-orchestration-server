import React, { useState, useEffect } from 'react';
import {
    Users, CheckCircle, XCircle, Clock, Activity,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '../services/api';
import { DashboardMetrics, TimeSeriesPoint } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtext?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    colorClass: string;
}> = ({ title, value, subtext, icon: Icon, trend, colorClass }) => (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${colorClass} bg-opacity-20`}>
                <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                    {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    2.5%
                </span>
            )}
        </div>
        <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtext && <p className="text-slate-500 text-xs mt-1">{subtext}</p>}
    </div>
);

const Dashboard: React.FC = () => {
    const { t } = useLanguage();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [chartData, setChartData] = useState<TimeSeriesPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [metricsData, timeSeriesData] = await Promise.all([
                    apiService.getMetrics(),
                    apiService.getTimeSeriesData('task_throughput', 20),
                ]);
                setMetrics(metricsData);
                setChartData(timeSeriesData);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                setLoading(false);
            }
        };

        fetchData();

        // Polling for updates every 5 seconds
        const interval = setInterval(async () => {
            try {
                const metricsData = await apiService.getMetrics();
                setMetrics(metricsData);

                // Update chart with new data point
                const newPoint = await apiService.getTimeSeriesData('task_throughput', 1);
                setChartData(prev => [...prev.slice(1), ...newPoint]);
            } catch (error) {
                console.error('Failed to update dashboard:', error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <div className="p-8 text-slate-400">{t('loadingDashboard')}</div>;
    }

    if (!metrics) {
        return <div className="p-8 text-slate-400">{t('failedToLoad')}</div>;
    }

    const getSystemHealthText = () => {
        switch (metrics.systemHealth) {
            case 'healthy': return t('systemHealthy');
            case 'degraded': return t('systemDegraded');
            case 'critical': return t('systemCritical');
            default: return t('systemHealthy');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">{t('systemOverview')}</h1>
                    <p className="text-slate-400 text-sm mt-1">{t('systemOverviewDesc')}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`flex h-3 w-3 rounded-full ${metrics.systemHealth === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                        } animate-pulse`}></span>
                    <span className="text-sm font-medium text-slate-300">
                        {getSystemHealthText()}
                    </span>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={t('activeAgents')}
                    value={metrics.activeAgents}
                    icon={Users}
                    colorClass="text-blue-400 bg-blue-400"
                    subtext={t('connectedToOrchestrator')}
                />
                <StatCard
                    title={t('successRate')}
                    value={`${metrics.successRate.toFixed(1)}%`}
                    icon={CheckCircle}
                    trend="up"
                    colorClass="text-green-400 bg-green-400"
                    subtext={`${metrics.tasksCompleted} ${t('tasksCompleted')}`}
                />
                <StatCard
                    title={t('avgTaskDuration')}
                    value={`${metrics.avgDurationSeconds.toFixed(1)}s`}
                    icon={Clock}
                    colorClass="text-purple-400 bg-purple-400"
                    subtext={t('lastHourAvg')}
                />
                <StatCard
                    title={t('failedTasks')}
                    value={metrics.tasksFailed}
                    icon={XCircle}
                    trend={metrics.tasksFailed > 50 ? 'down' : 'neutral'}
                    colorClass="text-red-400 bg-red-400"
                    subtext={t('requiringAttention')}
                />
            </div>

            {/* Main Chart & Secondary Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-white mb-6">{t('taskThroughput')}</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#64748b"
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">{t('systemStats')}</h3>

                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-400 text-sm">{t('totalTasks')}</span>
                                <span className="text-white font-bold text-sm">{metrics.totalTasksCreated}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2.5">
                                <div
                                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${(metrics.tasksCompleted / metrics.totalTasksCreated) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-400 text-sm">{t('successRate')}</span>
                                <span className="text-white font-bold text-sm">{metrics.successRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2.5">
                                <div
                                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${metrics.successRate}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex items-center text-slate-300 mb-2">
                            <Activity className="w-4 h-4 mr-2 text-orange-400" />
                            <span className="text-sm font-medium">{t('pendingTasks')}</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {metrics.totalTasksCreated - metrics.tasksCompleted - metrics.tasksFailed}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{t('queueDepthNormal')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
