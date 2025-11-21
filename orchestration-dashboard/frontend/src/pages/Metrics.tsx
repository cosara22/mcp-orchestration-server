import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { api } from '../services/api';
import { TimeSeriesPoint } from '../types';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

const Metrics: React.FC = () => {
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [agentDist, setAgentDist] = useState<any[]>([]);
  const [latencyData, setLatencyData] = useState<any[]>([]);
  const [costData, setCostData] = useState<TimeSeriesPoint[]>([]);

  useEffect(() => {
    // Simulate fetching historical data
    const history = generateTimeSeriesData(24, 100, 30).map((pt, i) => ({
      time: `${i}:00`,
      completed: pt.value,
      failed: Math.floor(pt.value * 0.05)
    }));
    setTaskHistory(history);
    setAgentDist(api.getAgentDistribution());
    setLatencyData(generateTimeSeriesData(24, 450, 150));
    setCostData(generateTimeSeriesData(24, 50000, 10000)); // Token/Cost sim
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Advanced Metrics</h1>
        <p className="text-slate-400 text-sm">Deep dive into performance, cost, and agent behavior</p>
      </div>

      {/* New Section: Cost & Tokens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-1">Token Consumption Trend</h3>
          <p className="text-xs text-slate-400 mb-6">Total input/output tokens processed per hour</p>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costData}>
                <defs>
                  <linearGradient id="colorToken" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorToken)" name="Tokens" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-1">Estimated Cost</h3>
          <p className="text-xs text-slate-400 mb-6">Cumulative cost over 24h</p>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} 
                  formatter={(value: number) => [`$${value.toFixed(4)}`, 'Cost']}
                />
                <Line type="step" dataKey="cost" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion vs Failure */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-6">Task Execution Status (24h)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskHistory} stacked>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                   cursor={{fill: '#334155', opacity: 0.4}}
                />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#3b82f6" name="Completed" radius={[0, 0, 4, 4]} />
                <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Distribution */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-6">Workload by Agent Type</h3>
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
                  {agentDist.map((entry, index) => (
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
          <h3 className="text-lg font-semibold text-white mb-6">Task Latency (ms) - P95</h3>
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
