import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, Clock, Activity, 
  ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getLatestMetrics, generateTimeSeriesData } from '../services/mockService';
import { DashboardMetrics, TimeSeriesPoint } from '../types';

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
        <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
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
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<TimeSeriesPoint[]>([]);

  useEffect(() => {
    // Initial load
    setMetrics(getLatestMetrics());
    setChartData(generateTimeSeriesData(20, 45, 15));

    // Polling simulation
    const interval = setInterval(() => {
      setMetrics(getLatestMetrics());
      setChartData(prev => {
        const newData = generateTimeSeriesData(1, 45, 15)[0];
        return [...prev.slice(1), newData];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <div className="p-8 text-slate-400">Loading dashboard...</div>;

  const successRate = ((metrics.tasksCompleted / (metrics.tasksCompleted + metrics.tasksFailed)) * 100).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">System Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time monitoring of MCP orchestration cluster</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`flex h-3 w-3 rounded-full ${
            metrics.systemHealth === 'HEALTHY' ? 'bg-green-500' : 'bg-red-500'
          } animate-pulse`}></span>
          <span className="text-sm font-medium text-slate-300">
            System {metrics.systemHealth}
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Agents" 
          value={metrics.activeAgents} 
          icon={Users} 
          colorClass="text-blue-400 bg-blue-400"
          subtext="Connected to orchestrator"
        />
        <StatCard 
          title="Success Rate" 
          value={`${successRate}%`} 
          icon={CheckCircle} 
          trend="up"
          colorClass="text-green-400 bg-green-400"
          subtext={`${metrics.tasksCompleted} tasks completed`}
        />
        <StatCard 
          title="Avg Task Duration" 
          value={`${metrics.avgDurationMs}ms`} 
          icon={Clock} 
          colorClass="text-purple-400 bg-purple-400"
          subtext="Last 1 hour rolling avg"
        />
        <StatCard 
          title="Failed Tasks" 
          value={metrics.tasksFailed} 
          icon={XCircle} 
          trend={metrics.tasksFailed > 50 ? 'down' : 'neutral'}
          colorClass="text-red-400 bg-red-400"
          subtext="Requiring attention"
        />
      </div>

      {/* Main Chart & Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700/50 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-6">Task Throughput (TPM)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b" 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{fill: '#64748b', fontSize: 12}} 
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
            <h3 className="text-lg font-semibold text-white mb-4">Resource Usage</h3>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400 text-sm">CPU Usage</span>
                <span className="text-white font-bold text-sm">{metrics.cpuUsage}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${metrics.cpuUsage}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400 text-sm">Memory Usage</span>
                <span className="text-white font-bold text-sm">{metrics.memoryUsage}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                  className="bg-purple-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${metrics.memoryUsage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center text-slate-300 mb-2">
              <Activity className="w-4 h-4 mr-2 text-orange-400" />
              <span className="text-sm font-medium">Pending Tasks</span>
            </div>
            <div className="text-2xl font-bold text-white">24</div>
            <p className="text-xs text-slate-500 mt-1">Queue depth normal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;