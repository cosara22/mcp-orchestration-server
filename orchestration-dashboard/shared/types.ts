
export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  traceId?: string;
  taskId?: string;
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
  estimatedCost: number; // in USD
}

export interface TraceStep {
  name: string;
  timestamp: string;
  durationMs: number;
  status: 'OK' | 'ERROR';
  tokens?: TokenUsage;
  payload?: {
    input?: any;
    output?: any;
  };
}

export interface TaskTrace {
  traceId: string;
  taskId: string;
  taskName: string;
  status: TaskStatus;
  steps: TraceStep[];
  startTime: string;
  endTime?: string;
  agentId?: string;
  totalCost?: number;
  totalTokens?: number;
}

export interface DashboardMetrics {
  activeAgents: number;
  totalTasksCreated: number;
  tasksCompleted: number;
  tasksFailed: number;
  avgDurationMs: number;
  cpuUsage: number;
  memoryUsage: number;
  systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  totalCost24h: number;
  currentTokensPerSec: number;
}

export interface TimeSeriesPoint {
  time: string;
  value: number;
  category?: string;
  cost?: number;
}

export type AgentStatus = 'IDLE' | 'BUSY' | 'OFFLINE' | 'ERROR';

export interface Agent {
  id: string;
  name: string;
  type: string;
  status: AgentStatus;
  capabilities: string[];
  lastActive: string;
  currentTask?: string;
  uptime: number; // in hours
}

// --- Phase 2 New Types ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isThinking?: boolean; // for streaming effect
}

export interface TopologyNode {
  id: string;
  label: string;
  type: 'orchestrator' | 'agent' | 'tool';
  status: AgentStatus;
  x: number;
  y: number;
}

export interface TopologyLink {
  source: string;
  target: string;
  value: number; // traffic volume
  active: boolean;
}
