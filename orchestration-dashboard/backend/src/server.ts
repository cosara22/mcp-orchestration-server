import express from 'express';
import cors from 'cors';
import {
  getLatestMetrics,
  generateTimeSeriesData,
  generateAgentDistribution,
  generateMockAgents,
  generateMockLogs,
  generateMockTrace,
  sendAgentMessage,
  getTopologyData,
  replayTask
} from './services/mockData.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// メトリクスエンドポイント
app.get('/api/metrics', (req, res) => {
  const metrics = getLatestMetrics();
  res.json(metrics);
});

// 時系列データエンドポイント
app.get('/api/metrics/timeseries', (req, res) => {
  const points = parseInt(req.query.points as string) || 30;
  const baseValue = parseInt(req.query.baseValue as string) || 1000;
  const variance = parseInt(req.query.variance as string) || 200;

  const data = generateTimeSeriesData(points, baseValue, variance);
  res.json(data);
});

// エージェント分布エンドポイント
app.get('/api/metrics/agent-distribution', (req, res) => {
  const data = generateAgentDistribution();
  res.json(data);
});

// エージェント一覧エンドポイント
app.get('/api/agents', (req, res) => {
  const agents = generateMockAgents();
  res.json(agents);
});

// ログエンドポイント
app.get('/api/logs', (req, res) => {
  const count = parseInt(req.query.count as string) || 100;
  const logs = generateMockLogs(count);
  res.json(logs);
});

// トレースエンドポイント
app.get('/api/traces/:traceId', (req, res) => {
  const trace = generateMockTrace(req.params.traceId);
  res.json(trace);
});

// トポロジーエンドポイント
app.get('/api/topology', (req, res) => {
  const topology = getTopologyData();
  res.json(topology);
});

// エージェントメッセージエンドポイント
app.post('/api/agents/:agentId/message', async (req, res) => {
  const { agentId } = req.params;
  const { message } = req.body;

  const response = await sendAgentMessage(agentId, message);
  res.json({ response });
});

// タスクリプレイエンドポイント
app.post('/api/tasks/:taskId/replay', async (req, res) => {
  const { taskId } = req.params;
  const { payload } = req.body;

  const newTraceId = await replayTask(taskId, payload);
  res.json({ traceId: newTraceId });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
