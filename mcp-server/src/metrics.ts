import client from 'prom-client';

// Create a Registry which registers the metrics
export const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
    app: 'mcp-orchestration-server'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

export const taskCreatedTotal = new client.Counter({
    name: 'mcp_task_created_total',
    help: 'Total number of tasks created',
    registers: [register]
});

export const taskCompletedTotal = new client.Counter({
    name: 'mcp_task_completed_total',
    help: 'Total number of tasks completed successfully',
    registers: [register]
});

export const taskFailedTotal = new client.Counter({
    name: 'mcp_task_failed_total',
    help: 'Total number of tasks failed',
    registers: [register]
});

export const taskDurationSeconds = new client.Histogram({
    name: 'mcp_task_duration_seconds',
    help: 'Duration of task execution in seconds',
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
    registers: [register]
});

export const activeAgents = new client.Gauge({
    name: 'mcp_active_agents',
    help: 'Number of currently active agents',
    registers: [register]
});
