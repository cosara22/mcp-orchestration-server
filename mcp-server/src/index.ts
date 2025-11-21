#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { RedisClientType, createClient } from 'redis';
import { z } from 'zod';
import 'dotenv/config';

// Types
interface Task {
  task_id: string;
  agent_type: 'planning' | 'implementation' | 'testing' | 'documentation';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  assigned_agent_id: string | null;
  task_description: string;
  context: Record<string, any>;
  dependencies: string[];
  result: any;
  error: string | null;
  retry_count: number;
  max_retries: number;
  started_at: string | null;
  timeout_seconds: number;
}

interface Agent {
  agent_id: string;
  agent_type: string;
  status: 'idle' | 'busy' | 'offline';
  last_heartbeat: string;
  capabilities: string[];
  current_task_id: string | null;
}

// Redis Client
let redis: RedisClientType;

async function initRedis() {
  redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  redis.on('error', (err) => console.error('Redis Client Error', err));
  await redis.connect();
  console.error('Connected to Redis');
}

// Task Management Functions
async function createTask(params: {
  agent_type: string;
  task_description: string;
  context?: Record<string, any>;
  dependencies?: string[];
  max_retries?: number;
  timeout_seconds?: number;
}): Promise<Task> {
  const task_id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const task: Task = {
    task_id,
    agent_type: params.agent_type as Task['agent_type'],
    status: 'pending',
    created_at: now,
    updated_at: now,
    assigned_agent_id: null,
    task_description: params.task_description,
    context: params.context || {},
    dependencies: params.dependencies || [],
    result: null,
    error: null,
    retry_count: 0,
    max_retries: params.max_retries ?? 3,
    started_at: null,
    timeout_seconds: params.timeout_seconds ?? 300,
  };

  // Store task in Redis
  await redis.set(`task:${task_id}`, JSON.stringify(task));

  // Add to task queue for the specific agent type
  await redis.lPush(`queue:${params.agent_type}`, task_id);

  return task;
}

async function getTaskStatus(task_id: string): Promise<Task | null> {
  const taskData = await redis.get(`task:${task_id}`);
  if (!taskData) return null;
  return JSON.parse(taskData);
}

async function pollTasks(
  agent_id: string,
  max_tasks: number = 1
): Promise<Task[]> {
  // Get agent info
  const agentData = await redis.get(`agent:${agent_id}`);
  if (!agentData) {
    throw new Error(`Agent ${agent_id} not registered`);
  }

  const agent: Agent = JSON.parse(agentData);

  // Get tasks from queue
  const tasks: Task[] = [];
  for (let i = 0; i < max_tasks; i++) {
    const task_id = await redis.rPop(`queue:${agent.agent_type}`);
    if (!task_id) break;

    const task = await getTaskStatus(task_id);
    if (task) {
      // Update task status
      task.status = 'in_progress';
      task.assigned_agent_id = agent_id;
      task.assigned_agent_id = agent_id;
      task.updated_at = new Date().toISOString();
      task.started_at = new Date().toISOString();
      await redis.set(`task:${task_id}`, JSON.stringify(task));

      // Update agent status
      agent.status = 'busy';
      agent.current_task_id = task_id;
      agent.last_heartbeat = new Date().toISOString();
      await redis.set(`agent:${agent_id}`, JSON.stringify(agent));

      tasks.push(task);
    }
  }

  return tasks;
}

async function submitResult(params: {
  task_id: string;
  status: 'completed' | 'failed';
  result?: any;
  error?: string;
}): Promise<void> {
  const task = await getTaskStatus(params.task_id);
  if (!task) {
    throw new Error(`Task ${params.task_id} not found`);
  }

  // Check for failure and retry logic
  if (params.status === 'failed') {
    if (task.retry_count < task.max_retries) {
      // Retry
      task.status = 'pending';
      task.retry_count++;
      task.assigned_agent_id = null;
      task.started_at = null;
      task.error = params.error || 'Task failed, retrying';
      task.updated_at = new Date().toISOString();

      await redis.set(`task:${params.task_id}`, JSON.stringify(task));
      // Re-push to queue (Head for immediate retry)
      await redis.lPush(`queue:${task.agent_type}`, params.task_id);
      console.error(`Task ${params.task_id} failed. Retrying (${task.retry_count}/${task.max_retries})`);
    } else {
      // Dead Letter
      task.status = 'failed';
      task.result = null;
      task.error = params.error || 'Task failed after max retries';
      task.updated_at = new Date().toISOString();

      await redis.set(`task:${params.task_id}`, JSON.stringify(task));
      await redis.lPush('queue:dead-letter', params.task_id);
      console.error(`Task ${params.task_id} moved to Dead Letter Queue`);
    }
  } else {
    // Completed
    task.status = params.status;
    task.result = params.result || null;
    task.error = null;
    task.updated_at = new Date().toISOString();
    await redis.set(`task:${params.task_id}`, JSON.stringify(task));
  }

  // Update agent status
  if (task.assigned_agent_id) {
    const agentData = await redis.get(`agent:${task.assigned_agent_id}`);
    if (agentData) {
      const agent: Agent = JSON.parse(agentData);
      agent.status = 'idle';
      agent.current_task_id = null;
      agent.last_heartbeat = new Date().toISOString();
      await redis.set(`agent:${task.assigned_agent_id}`, JSON.stringify(agent));
    }
  }
}

async function listAgents(filter: 'all' | 'active' | 'idle' = 'all'): Promise<Agent[]> {
  const keys = await redis.keys('agent:*');
  const agents: Agent[] = [];

  for (const key of keys) {
    const agentData = await redis.get(key);
    if (agentData) {
      const agent: Agent = JSON.parse(agentData);

      if (filter === 'all') {
        agents.push(agent);
      } else if (filter === 'active' && agent.status !== 'offline') {
        agents.push(agent);
      } else if (filter === 'idle' && agent.status === 'idle') {
        agents.push(agent);
      }
    }
  }

  return agents;
}

async function registerAgent(params: {
  agent_id: string;
  agent_type: string;
  capabilities: string[];
}): Promise<Agent> {
  const agent: Agent = {
    agent_id: params.agent_id,
    agent_type: params.agent_type,
    status: 'idle',
    last_heartbeat: new Date().toISOString(),
    capabilities: params.capabilities,
    current_task_id: null,
  };

  await redis.set(`agent:${params.agent_id}`, JSON.stringify(agent));
  return agent;
}

async function getSharedState(key: string): Promise<any> {
  const data = await redis.get(`shared:${key}`);
  return data ? JSON.parse(data) : null;
}

async function setSharedState(key: string, value: any, ttl: number = 3600): Promise<void> {
  await redis.set(`shared:${key}`, JSON.stringify(value), { EX: ttl });
}

async function monitorTaskTimeouts() {
  setInterval(async () => {
    try {
      const keys = await redis.keys('task:*');
      const now = new Date();

      for (const key of keys) {
        const taskData = await redis.get(key);
        if (!taskData) continue;

        const task: Task = JSON.parse(taskData);
        if (task.status === 'in_progress' && task.started_at) {
          const startedAt = new Date(task.started_at);
          const elapsedSeconds = (now.getTime() - startedAt.getTime()) / 1000;

          if (elapsedSeconds > task.timeout_seconds) {
            console.error(`Task ${task.task_id} timed out after ${elapsedSeconds}s`);
            await submitResult({
              task_id: task.task_id,
              status: 'failed',
              error: `Task timed out after ${task.timeout_seconds}s`,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in timeout monitor:', error);
    }
  }, 60000); // Check every 60 seconds
}

async function getDeadLetterTasks(): Promise<Task[]> {
  const taskIds = await redis.lRange('queue:dead-letter', 0, -1);
  const tasks: Task[] = [];

  for (const taskId of taskIds) {
    const task = await getTaskStatus(taskId);
    if (task) {
      tasks.push(task);
    }
  }
  return tasks;
}

// MCP Server Setup
const server = new Server(
  {
    name: 'mcp-orchestration-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool Schemas
const CreateTaskSchema = z.object({
  agent_type: z.enum(['planning', 'implementation', 'testing', 'documentation']),
  task_description: z.string(),
  context: z.record(z.any()).optional(),
  dependencies: z.array(z.string()).optional(),
  max_retries: z.number().optional(),
  timeout_seconds: z.number().optional(),
});

const GetTaskStatusSchema = z.object({
  task_id: z.string(),
});

const PollTasksSchema = z.object({
  agent_id: z.string(),
  max_tasks: z.number().default(1),
});

const SubmitResultSchema = z.object({
  task_id: z.string(),
  status: z.enum(['completed', 'failed']),
  result: z.any().optional(),
  error: z.string().optional(),
});

const ListAgentsSchema = z.object({
  filter: z.enum(['all', 'active', 'idle']).default('all'),
});

const RegisterAgentSchema = z.object({
  agent_id: z.string(),
  agent_type: z.string(),
  capabilities: z.array(z.string()),
});

const GetSharedStateSchema = z.object({
  key: z.string(),
});

const SetSharedStateSchema = z.object({
  key: z.string(),
  value: z.any(),
  ttl: z.number().default(3600),
});

// List Tools Handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_task',
        description: '新しいタスクを作成し、適切なエージェントに割り当てる',
        inputSchema: {
          type: 'object',
          properties: {
            agent_type: {
              type: 'string',
              enum: ['planning', 'implementation', 'testing', 'documentation'],
              description: 'タスクを実行するエージェントのタイプ',
            },
            task_description: {
              type: 'string',
              description: 'タスクの詳細な説明',
            },
            context: {
              type: 'object',
              description: 'タスク実行に必要なコンテキスト情報',
            },
            dependencies: {
              type: 'array',
              items: { type: 'string' },
              description: '依存する他のタスクのID',
            },
          },
          required: ['agent_type', 'task_description'],
        },
      },
      {
        name: 'get_task_status',
        description: 'タスクの実行状態を取得する',
        inputSchema: {
          type: 'object',
          properties: {
            task_id: {
              type: 'string',
              description: 'タスクID',
            },
          },
          required: ['task_id'],
        },
      },
      {
        name: 'poll_tasks',
        description: '自分に割り当てられた未実行タスクを取得する',
        inputSchema: {
          type: 'object',
          properties: {
            agent_id: {
              type: 'string',
              description: 'エージェントID',
            },
            max_tasks: {
              type: 'number',
              description: '最大取得数',
              default: 1,
            },
          },
          required: ['agent_id'],
        },
      },
      {
        name: 'submit_result',
        description: 'タスクの実行結果を送信する',
        inputSchema: {
          type: 'object',
          properties: {
            task_id: {
              type: 'string',
              description: 'タスクID',
            },
            status: {
              type: 'string',
              enum: ['completed', 'failed'],
              description: '実行結果のステータス',
            },
            result: {
              type: 'object',
              description: '実行結果データ',
            },
            error: {
              type: 'string',
              description: 'エラーメッセージ (failed時)',
            },
          },
          required: ['task_id', 'status'],
        },
      },
      {
        name: 'list_agents',
        description: '登録されている全エージェントの状態を取得する',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              enum: ['all', 'active', 'idle'],
              description: 'フィルタ条件',
              default: 'all',
            },
          },
        },
      },
      {
        name: 'register_agent',
        description: '新しいエージェントを登録する',
        inputSchema: {
          type: 'object',
          properties: {
            agent_id: {
              type: 'string',
              description: 'エージェントID',
            },
            agent_type: {
              type: 'string',
              description: 'エージェントタイプ',
            },
            capabilities: {
              type: 'array',
              items: { type: 'string' },
              description: 'エージェントの能力リスト',
            },
          },
          required: ['agent_id', 'agent_type', 'capabilities'],
        },
      },
      {
        name: 'get_shared_state',
        description: '共有ステートストアからデータを取得する',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: '取得するデータのキー',
            },
          },
          required: ['key'],
        },
      },
      {
        name: 'set_shared_state',
        description: '共有ステートストアにデータを保存する',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: '保存するデータのキー',
            },
            value: {
              type: 'object',
              description: '保存するデータ',
            },
            ttl: {
              type: 'number',
              description: '有効期限(秒)',
              default: 3600,
            },
          },
          required: ['key', 'value'],
        },
      },
      {
        name: 'get_dead_letter_tasks',
        description: 'デッドレターキューにあるタスクを取得する',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Call Tool Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case 'create_task': {
        const params = CreateTaskSchema.parse(request.params.arguments);
        const task = await createTask(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(task, null, 2),
            },
          ],
        };
      }

      case 'get_task_status': {
        const params = GetTaskStatusSchema.parse(request.params.arguments);
        const task = await getTaskStatus(params.task_id);
        return {
          content: [
            {
              type: 'text',
              text: task ? JSON.stringify(task, null, 2) : 'Task not found',
            },
          ],
        };
      }

      case 'poll_tasks': {
        const params = PollTasksSchema.parse(request.params.arguments);
        const tasks = await pollTasks(params.agent_id, params.max_tasks);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tasks, null, 2),
            },
          ],
        };
      }

      case 'submit_result': {
        const params = SubmitResultSchema.parse(request.params.arguments);
        await submitResult(params);
        return {
          content: [
            {
              type: 'text',
              text: 'Result submitted successfully',
            },
          ],
        };
      }

      case 'list_agents': {
        const params = ListAgentsSchema.parse(request.params.arguments || {});
        const agents = await listAgents(params.filter);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(agents, null, 2),
            },
          ],
        };
      }

      case 'register_agent': {
        const params = RegisterAgentSchema.parse(request.params.arguments);
        const agent = await registerAgent(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(agent, null, 2),
            },
          ],
        };
      }

      case 'get_shared_state': {
        const params = GetSharedStateSchema.parse(request.params.arguments);
        const value = await getSharedState(params.key);
        return {
          content: [
            {
              type: 'text',
              text: value ? JSON.stringify(value, null, 2) : 'null',
            },
          ],
        };
      }

      case 'set_shared_state': {
        const params = SetSharedStateSchema.parse(request.params.arguments);
        await setSharedState(params.key, params.value, params.ttl);
        return {
          content: [
            {
              type: 'text',
              text: 'State saved successfully',
            },
          ],
        };
      }

      case 'get_dead_letter_tasks': {
        const tasks = await getDeadLetterTasks();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tasks, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Main
async function main() {
  await initRedis();
  monitorTaskTimeouts();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('MCP Orchestration Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
