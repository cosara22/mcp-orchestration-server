const API_BASE = 'http://localhost:3001/api';

export const api = {
  // メトリクス関連
  async getMetrics() {
    const res = await fetch(`${API_BASE}/metrics`);
    return res.json();
  },

  async getTimeSeriesData(points: number = 30, baseValue: number = 1000, variance: number = 200) {
    const res = await fetch(`${API_BASE}/metrics/timeseries?points=${points}&baseValue=${baseValue}&variance=${variance}`);
    return res.json();
  },

  async getAgentDistribution() {
    const res = await fetch(`${API_BASE}/metrics/agent-distribution`);
    return res.json();
  },

  // エージェント関連
  async getAgents() {
    const res = await fetch(`${API_BASE}/agents`);
    return res.json();
  },

  async sendAgentMessage(agentId: string, message: string) {
    const res = await fetch(`${API_BASE}/agents/${agentId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return res.json();
  },

  // ログ関連
  async getLogs(count: number = 100) {
    const res = await fetch(`${API_BASE}/logs?count=${count}`);
    return res.json();
  },

  // トレース関連
  async getTrace(traceId: string) {
    const res = await fetch(`${API_BASE}/traces/${traceId}`);
    return res.json();
  },

  // トポロジー関連
  async getTopology() {
    const res = await fetch(`${API_BASE}/topology`);
    return res.json();
  },

  // タスクリプレイ
  async replayTask(taskId: string, payload: any) {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/replay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload })
    });
    return res.json();
  }
};
