import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { apiService } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

const Metrics: React.FC = () => {
    const { t } = useLanguage();
    const [taskHistory, setTaskHistory] = useState<any[]>([]);
    const [agentDist, setAgentDist] = useState<any[]>([]);
    const [latencyData, setLatencyData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Generate hourly task completion data
                const history = await apiService.getTimeSeriesData('task_history', 24);
                setTaskHistory(history.map((pt, i) => ({
                    time: `${i}:00`,
                    completed: pt.value,
                    failed: Math.floor(pt.value * 0.05)
                })));

                // Agent distribution
                setAgentDist([
                    { name: 'Planning', value: 35 },
                    { name: 'Implementation', value: 45 },
                    { name: 'Testing', value: 15 },
                    { name: 'Documentation', value: 5 },
                ]);

                // Latency data
                const latency = await apiService.getTimeSeriesData('latency', 24);
                setLatencyData(latency.map((_pt, i) => ({
                    time: `${i}:00`,
                    value: Math.random() * 200 + 300
                })));
            } catch (error) {
                console.error('Failed to fetch metrics:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">{t('advancedMetrics')}</h1>
                <p className="text-slate-400 text-sm">{t('advancedMetricsDesc')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Task Completion vs Failure */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-6">{t('taskExecutionStatus')}</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={taskHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                    cursor={{ fill: '#334155', opacity: 0.4 }}
                                />
                                <Legend />
                                <Bar dataKey="completed" stackId="a" fill="#3b82f6" name={t('completed')} radius={[0, 0, 4, 4]} />
                                <Bar dataKey="failed" stackId="a" fill="#ef4444" name={t('failed')} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Agent Distribution */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-6">{t('workloadByAgent')}</h3>
                    <div className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={agentDist}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {agentDist.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Latency P95 */}
                <div className="col-span-1 lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-6">{t('taskLatency')}</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={latencyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Metrics;
