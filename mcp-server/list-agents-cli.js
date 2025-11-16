import { createClient } from 'redis';

async function listAgents() {
  const redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  try {
    await redis.connect();

    const keys = await redis.keys('agent:*');
    const agents = [];

    for (const key of keys) {
      const agentData = await redis.get(key);
      if (agentData) {
        agents.push(JSON.parse(agentData));
      }
    }

    console.log(JSON.stringify(agents, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await redis.quit();
  }
}

listAgents();
