import { createClient } from 'redis';

async function registerAgent() {
  const redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  try {
    await redis.connect();

    const agent = {
      agent_id: 'test-agent-1',
      agent_type: 'planning',
      status: 'idle',
      last_heartbeat: new Date().toISOString(),
      capabilities: ['task_planning', 'architecture_design'],
      current_task_id: null,
    };

    await redis.set(`agent:${agent.agent_id}`, JSON.stringify(agent));
    console.log('Agent registered:', JSON.stringify(agent, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await redis.quit();
  }
}

registerAgent();
