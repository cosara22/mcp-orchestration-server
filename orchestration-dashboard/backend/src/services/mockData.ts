import type { DashboardMetrics, LogEntry, LogLevel, TaskStatus, TaskTrace, TimeSeriesPoint, Agent, TraceStep, ChatMessage, TopologyNode, TopologyLink } from '../types.js';
import { LogLevel as LL, TaskStatus as TS } from '../types.js';

// Helper to generate random ID
const uuid = () => Math.random().toString(36).substring(2, 15);

const AGENT_TYPES = ['Researcher', 'Coder', 'Reviewer', 'Deployer'];

// Initial Mock Data State
let currentMetrics: DashboardMetrics = {
  activeAgents: 12,
  totalTasksCreated: 1250,
  tasksCompleted: 1180,
  tasksFailed: 45,
  avgDurationMs: 850,
  cpuUsage: 42,
  memoryUsage: 64,
  systemHealth: 'HEALTHY',
  totalCost24h: 42.50,
  currentTokensPerSec: 1250
};

// Generate some historical metrics for charts
export const generateTimeSeriesData = (points: number, baseValue: number, variance: number): TimeSeriesPoint[] => {
  const data: TimeSeriesPoint[] = [];
  const now = new Date();
  for (let i = points; i > 0; i--) {
    const time = new Date(now.getTime() - i * 60000); // per minute
    const val = Math.max(0, Math.floor(baseValue + (Math.random() * variance) - (variance / 2)));
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: val,
      cost: Number((val * 0.00002).toFixed(4)) // Rough simulated cost
    });
  }
  return data;
};

export const generateAgentDistribution = () => {
  return AGENT_TYPES.map(type => ({
    name: type,
    value: Math.floor(Math.random() * 50) + 10
  }));
};

// Generate Mock Agents
export const generateMockAgents = (): Agent[] => {
  const agents: Agent[] = [];
  const count = 12;

  for (let i = 0; i < count; i++) {
    const type = AGENT_TYPES[i % AGENT_TYPES.length]!;
    const statusRandom = Math.random();
    const status = statusRandom > 0.8 ? 'OFFLINE' : statusRandom > 0.4 ? 'BUSY' : 'IDLE';

    agents.push({
      id: `agent-${uuid().substring(0, 6)}`,
      name: `${type}-${String(i + 1).padStart(2, '0')}`,
      type: type,
      status: status as any,
      capabilities: ['text-processing', 'code-generation', 'web-search'].slice(0, Math.floor(Math.random() * 3) + 1),
      lastActive: new Date(Date.now() - Math.random() * 10000000).toISOString(),
      uptime: Math.floor(Math.random() * 100) + 1,
      currentTask: status === 'BUSY' ? `Processing task-${uuid().substring(0, 4)}` : undefined
    });
  }
  return agents;
};

// Generate Logs
export const generateMockLogs = (count: number): LogEntry[] => {
  const logs: LogEntry[] = [];
  const messages = [
    "Task assigned to agent",
    "Context window updated",
    "Model response received",
    "Tool execution started",
    "Tool execution completed",
    "Connection retry",
    "Timeout waiting for response"
  ];

  for (let i = 0; i < count; i++) {
    const isError = Math.random() > 0.9;
    const isWarn = !isError && Math.random() > 0.85;

    logs.push({
      id: uuid(),
      timestamp: new Date(Date.now() - i * 1000 * 60).toISOString(),
      level: isError ? LL.ERROR : isWarn ? LL.WARN : LL.INFO,
      message: isError ? "Task execution failed: Timeout" : messages[Math.floor(Math.random() * messages.length)]!,
      traceId: `trace-${uuid().substring(0, 6)}`,
      taskId: `task-${uuid().substring(0, 6)}`,
      context: { agent: AGENT_TYPES[Math.floor(Math.random() * AGENT_TYPES.length)] }
    });
  }
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Generate Mock Trace with Payloads
export const generateMockTrace = (traceId: string): TaskTrace => {
  const stepsBase = [
    { name: 'Task Created', duration: 5, hasPayload: true },
    { name: 'Orchestrator Routing', duration: 25, hasPayload: false },
    { name: 'Agent Assignment', duration: 15, hasPayload: true },
    { name: 'Context Retrieval', duration: 150, hasPayload: false },
    { name: 'LLM Processing', duration: 2400, hasPayload: true, tokens: true },
    { name: 'Result Parsing', duration: 45, hasPayload: true },
  ];

  const startTime = new Date();
  let accumulatedTime = 0;
  let totalCost = 0;
  let totalTokens = 0;

  const traceSteps: TraceStep[] = stepsBase.map(step => {
    accumulatedTime += step.duration;

    let tokens;
    let payload;

    if (step.tokens) {
      const input = Math.floor(Math.random() * 1000) + 500;
      const output = Math.floor(Math.random() * 2000) + 100;
      const cost = (input * 0.0000015) + (output * 0.0000060); // Simulated pricing
      totalCost += cost;
      totalTokens += (input + output);

      tokens = {
        input,
        output,
        total: input + output,
        estimatedCost: Number(cost.toFixed(6))
      };
    }

    if (step.hasPayload) {
      if (step.name === 'Task Created') {
        payload = {
          input: {
            user_prompt: "Analyze the Q3 sales data and generate a summary report.",
            constraints: ["Use bullet points", "Focus on North America"],
            priority: "HIGH"
          }
        };
      } else if (step.name === 'LLM Processing') {
        payload = {
          input: {
            model: "gpt-4-turbo",
            messages: [
              { role: "system", content: "You are a data analyst." },
              { role: "user", content: "Analyze Q3 data..." }
            ],
            temperature: 0.7
          },
          output: {
            id: "chatcmpl-123",
            object: "chat.completion",
            choices: [{
              message: { content: "Here is the analysis of Q3 sales data:\\n- Revenue up 15%\\n- New customer acquisition down 2%" }
            }]
          }
        };
      } else {
        payload = {
          input: { action: "process_step", meta: { step_id: uuid() } }
        };
      }
    }

    return {
      name: step.name,
      timestamp: new Date(startTime.getTime() + accumulatedTime).toISOString(),
      durationMs: step.duration,
      status: (Math.random() > 0.95 ? 'ERROR' : 'OK') as 'ERROR' | 'OK',
      tokens,
      payload
    };
  });

  const isFailed = traceSteps.some(s => s.status === 'ERROR');

  return {
    traceId,
    taskId: `task-${uuid().substring(0, 6)}`,
    taskName: "Generate Report for Q3",
    status: isFailed ? TS.FAILED : TS.COMPLETED,
    startTime: startTime.toISOString(),
    endTime: new Date(startTime.getTime() + accumulatedTime).toISOString(),
    agentId: "agent-researcher-01",
    steps: traceSteps,
    totalCost: Number(totalCost.toFixed(4)),
    totalTokens
  };
};

export const getLatestMetrics = (): DashboardMetrics => {
  // Simulate slight fluctuation
  currentMetrics = {
    ...currentMetrics,
    activeAgents: Math.max(5, Math.min(20, currentMetrics.activeAgents + (Math.random() > 0.5 ? 1 : -1))),
    cpuUsage: Math.floor(Math.random() * 30) + 20,
    totalTasksCreated: currentMetrics.totalTasksCreated + Math.floor(Math.random() * 2),
    currentTokensPerSec: Math.floor(Math.random() * 500) + 1000,
    totalCost24h: currentMetrics.totalCost24h + 0.005
  };
  return currentMetrics;
};

// --- Phase 2 Mock Services ---

// Mock Chat Logic
export const sendAgentMessage = async (agentId: string, message: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`[${agentId}] Received: "${message}". \\nBased on my capabilities, I have processed your request. Here is the simulated output demonstrating my tool usage.`);
    }, 1500);
  });
};

// Mock Topology Data
export const getTopologyData = (): { nodes: TopologyNode[], links: TopologyLink[] } => {
  const nodes: TopologyNode[] = [];
  const links: TopologyLink[] = [];

  // Central Orchestrator
  nodes.push({ id: 'orch', label: 'Orchestrator', type: 'orchestrator', status: 'BUSY', x: 400, y: 300 });

  // Agents around the center
  const agentCount = 8;
  const radius = 250;

  for (let i = 0; i < agentCount; i++) {
    const angle = (i / agentCount) * 2 * Math.PI;
    const x = 400 + radius * Math.cos(angle);
    const y = 300 + radius * Math.sin(angle);
    const type = AGENT_TYPES[i % AGENT_TYPES.length]!;
    const id = `agent-${i}`;

    nodes.push({
      id,
      label: `${type}-${i}`,
      type: 'agent',
      status: Math.random() > 0.2 ? 'IDLE' : 'BUSY',
      x,
      y
    });

    // Link to orchestrator
    links.push({ source: 'orch', target: id, value: Math.random(), active: Math.random() > 0.5 });

    // Random peer-to-peer links
    if (Math.random() > 0.7) {
      const targetId = `agent-${(i + 2) % agentCount}`;
      links.push({ source: id, target: targetId, value: 0.5, active: false });
    }
  }

  return { nodes, links };
};

// Replay Task Simulation
export const replayTask = async (taskId: string, modifiedPayload: any): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`trace-replay-${uuid().substring(0,6)}`);
    }, 1000);
  });
};
