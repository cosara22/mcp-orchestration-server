import { DashboardMetrics, LogEntry, TaskTrace, TimeSeriesPoint } from '../types';

const API_BASE = '/api';
const METRICS_ENDPOINT = '/metrics';

// Mock data generator for development (will be replaced with real API calls)
const generateMockMetrics = (): DashboardMetrics => ({
    activeAgents: Math.floor(Math.random() * 8) + 2,
    totalTasksCreated: Math.floor(Math.random() * 500) + 1000,
    tasksCompleted: Math.floor(Math.random() * 450) + 950,
    tasksFailed: Math.floor(Math.random() * 50) + 10,
    avgDurationSeconds: Math.random() * 5 + 2,
    successRate: 94 + Math.random() * 4,
    systemHealth: 'healthy',
});

const generateTimeSeriesData = (points: number): TimeSeriesPoint[] => {
    const data: TimeSeriesPoint[] = [];
    const now = new Date();
    for (let i = points; i > 0; i--) {
        const time = new Date(now.getTime() - i * 60000);
        data.push({
            time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: Math.floor(Math.random() * 30) + 30,
        });
    }
    return data;
};

const generateMockLogs = (count: number): LogEntry[] => {
    const logs: LogEntry[] = [];
    const messages = [
        'Task created',
        'Task assigned to agent',
        'Task started processing',
        'Task completed successfully',
        'Agent registered',
        'Agent heartbeat received',
        'Task timeout warning',
    ];

    for (let i = 0; i < count; i++) {
        const isError = Math.random() > 0.9;
        const isWarn = !isError && Math.random() > 0.85;

        logs.push({
            timestamp: new Date(Date.now() - i * 1000 * 30).toISOString(),
            level: isError ? 'error' : isWarn ? 'warn' : 'info',
            message: isError ? 'Task execution failed: Timeout' : messages[Math.floor(Math.random() * messages.length)],
            trace_id: `trace-${Math.random().toString(36).substring(2, 8)}`,
            task_id: `task-${Math.random().toString(36).substring(2, 8)}`,
            agent_type: ['planning', 'implementation', 'testing', 'documentation'][Math.floor(Math.random() * 4)],
            service: 'mcp-orchestration-server',
        });
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const apiService = {
    // Get latest metrics
    async getMetrics(): Promise<DashboardMetrics> {
        try {
            // TODO: Replace with actual API call to backend
            // const response = await fetch(`${API_BASE}/metrics`);
            // return await response.json();
            return generateMockMetrics();
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
            throw error;
        }
    },

    // Get time series data for charts
    async getTimeSeriesData(metric: string, points: number = 20): Promise<TimeSeriesPoint[]> {
        try {
            // TODO: Replace with actual API call
            // const response = await fetch(`${API_BASE}/metrics/timeseries?metric=${metric}&points=${points}`);
            // return await response.json();
            return generateTimeSeriesData(points);
        } catch (error) {
            console.error('Failed to fetch time series data:', error);
            throw error;
        }
    },

    // Get logs
    async getLogs(limit: number = 100, filters?: any): Promise<LogEntry[]> {
        try {
            // TODO: Replace with actual API call
            // const queryParams = new URLSearchParams({ limit: limit.toString(), ...filters });
            // const response = await fetch(`${API_BASE}/logs?${queryParams}`);
            // return await response.json();
            return generateMockLogs(limit);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            throw error;
        }
    },

    // Get trace by ID
    async getTrace(traceId: string): Promise<TaskTrace | null> {
        try {
            // TODO: Replace with actual API call
            // const response = await fetch(`${API_BASE}/traces/${traceId}`);
            // return await response.json();
            return null;
        } catch (error) {
            console.error('Failed to fetch trace:', error);
            throw error;
        }
    },

    // Get Prometheus metrics (raw)
    async getPrometheusMetrics(): Promise<string> {
        try {
            const response = await fetch(METRICS_ENDPOINT);
            return await response.text();
        } catch (error) {
            console.error('Failed to fetch Prometheus metrics:', error);
            throw error;
        }
    },
};
