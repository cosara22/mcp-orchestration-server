export enum LogLevel {
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    DEBUG = 'debug'
}

export enum TaskStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    service?: string;
    task_id?: string;
    trace_id?: string;
    agent_type?: string;
    error?: any;
}

export interface TaskTrace {
    trace_id: string;
    task_id: string;
    task_description: string;
    status: TaskStatus;
    events: TraceEvent[];
    duration?: number;
    agent_type?: string;
}

export interface TraceEvent {
    timestamp: string;
    event: string;
    data?: any;
}

export interface DashboardMetrics {
    activeAgents: number;
    totalTasksCreated: number;
    tasksCompleted: number;
    tasksFailed: number;
    avgDurationSeconds: number;
    successRate: number;
    systemHealth: 'healthy' | 'degraded' | 'critical';
}

export interface TimeSeriesPoint {
    time: string;
    value: number;
    category?: string;
}

export interface PrometheusMetric {
    name: string;
    type: string;
    help: string;
    value: number;
    labels?: Record<string, string>;
}
