
import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, XCircle, Box, ArrowRight, Database, DollarSign, Code, X, GitFork, Play } from 'lucide-react';
import { api } from '../services/api';
import { TaskTrace, TaskStatus, TraceStep as ITraceStep } from '../types';
import JsonViewer from '../components/JSONViewer';
import Modal from '../components/Modal';

const TraceStep: React.FC<{ 
  step: ITraceStep; 
  isLast: boolean;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ step, isLast, isSelected, onSelect }) => (
  <div className="relative pl-8 pb-8 group">
    {/* Connector Line */}
    {!isLast && (
      <div className={`absolute left-3 top-8 w-0.5 h-full bg-slate-700 group-hover:bg-slate-600 transition-colors`} />
    )}
    
    {/* Node Icon */}
    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-slate-900 transition-all ${
      step.status === 'OK' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'
    } ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-slate-900' : ''}`}>
      {step.status === 'OK' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
    </div>

    {/* Content */}
    <div 
      onClick={onSelect}
      className={`p-4 rounded-lg border shadow-sm flex justify-between items-center cursor-pointer transition-all ${
        isSelected 
          ? 'bg-slate-800 border-primary-500/50 shadow-lg shadow-primary-500/10' 
          : 'bg-slate-800 border-slate-700/50 hover:border-slate-600 hover:bg-slate-750'
      }`}
    >
      <div>
        <h4 className={`font-medium transition-colors ${isSelected ? 'text-primary-400' : 'text-white'}`}>{step.name}</h4>
        <p className="text-xs text-slate-500 mt-1">{new Date(step.timestamp).toLocaleTimeString()}</p>
      </div>
      <div className="flex flex-col items-end space-y-1">
         <span className={`text-xs font-mono px-2 py-1 rounded ${
           step.durationMs > 1000 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-700 text-slate-300'
         }`}>
           {step.durationMs}ms
         </span>
         {step.tokens && (
           <span className="text-[10px] text-slate-500 flex items-center">
             <Database className="w-3 h-3 mr-1" />
             {step.tokens.total} toks
           </span>
         )}
      </div>
    </div>
  </div>
);

const Traces: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [trace, setTrace] = useState<TaskTrace | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  
  // Replay State
  const [isReplayModalOpen, setIsReplayModalOpen] = useState(false);
  const [replayPayload, setReplayPayload] = useState('');
  const [isReplaying, setIsReplaying] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId) {
      const newTrace = await api.getTrace(searchId);
      setTrace(newTrace);
      setSelectedStepIndex(null);
    }
  };

  // Load a sample trace on mount
  useEffect(() => {
    const loadTrace = async () => {
      const trace = await api.getTrace("trace-init-demo");
      setTrace(trace);
    };
    loadTrace();
  }, []);

  const selectedStep = trace && selectedStepIndex !== null ? trace.steps[selectedStepIndex] : null;

  const openReplayModal = () => {
    if (!trace) return;
    // Find the initial input payload
    const firstStepWithPayload = trace.steps.find(s => s.payload?.input);
    const initialPayload = firstStepWithPayload?.payload?.input || { note: "No initial payload found" };
    setReplayPayload(JSON.stringify(initialPayload, null, 2));
    setIsReplayModalOpen(true);
  };

  const handleReplaySubmit = async () => {
    setIsReplaying(true);
    try {
      const jsonPayload = JSON.parse(replayPayload);
      const result = await api.replayTask(trace?.taskId || 'unknown', jsonPayload);
      const newTraceId = result.traceId;
      
      setIsReplayModalOpen(false);
      setSearchId(newTraceId);
      // Simulate navigation to new trace
      const newTrace = api.getTrace(newTraceId);
      setTrace(newTrace);
      setSelectedStepIndex(null);
    } catch (e) {
      alert("Invalid JSON");
    } finally {
      setIsReplaying(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-6 flex-shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Distributed Tracing</h1>
          <p className="text-slate-400 text-sm">Visualize task lifecycle, payload inspection, and cost analysis</p>
        </div>
        {trace && (
          <button 
            onClick={openReplayModal}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-primary-600/20 hover:text-primary-400 border border-slate-700 rounded-lg text-slate-300 transition-all text-sm font-medium"
          >
            <GitFork size={16} />
            Fork & Retry
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 mb-4 flex-shrink-0">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
             <input 
               type="text" 
               placeholder="Enter Trace ID (e.g., trace-xyz...)"
               className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-primary-500 focus:outline-none text-sm"
               value={searchId}
               onChange={(e) => setSearchId(e.target.value)}
             />
          </div>
          <button 
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Analyze
          </button>
        </form>
      </div>

      {trace && (
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Left Panel: Trace Timeline */}
          <div className="w-1/2 flex flex-col gap-4 min-h-0">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center">
                  <Box className="w-5 h-5 mr-2 text-primary-500" />
                  {trace.taskName}
                </h2>
                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                  trace.status === TaskStatus.COMPLETED ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {trace.status}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-xs block">Total Cost</span>
                  <span className="text-white font-mono flex items-center">
                    <DollarSign className="w-3 h-3 mr-1 text-green-400" />
                    {trace.totalCost?.toFixed(5)}
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-xs block">Tokens</span>
                  <span className="text-white font-mono flex items-center">
                    <Database className="w-3 h-3 mr-1 text-blue-400" />
                    {trace.totalTokens}
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-xs block">Duration</span>
                  <span className="text-white font-mono flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-orange-400" />
                    {trace.steps.reduce((acc, s) => acc + s.durationMs, 0)}ms
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="pl-2 pt-2">
                {trace.steps.map((step, idx) => (
                  <TraceStep 
                    key={idx}
                    step={step}
                    isLast={idx === trace.steps.length - 1}
                    isSelected={selectedStepIndex === idx}
                    onSelect={() => setSelectedStepIndex(idx)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Inspector */}
          <div className="w-1/2 bg-slate-800 rounded-xl border border-slate-700/50 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-white flex items-center">
                <Code className="w-4 h-4 mr-2 text-primary-400" />
                Payload Inspector
              </h3>
              {selectedStep && (
                <button onClick={() => setSelectedStepIndex(null)} className="text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
              {selectedStep ? (
                <>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300">Metadata</h4>
                    <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 text-xs">
                      <div>
                        <span className="text-slate-500 block">Step Name</span>
                        <span className="text-white">{selectedStep.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Timestamp</span>
                        <span className="text-white">{new Date(selectedStep.timestamp).toISOString()}</span>
                      </div>
                      {selectedStep.tokens && (
                        <>
                          <div>
                            <span className="text-slate-500 block">Token Usage</span>
                            <span className="text-blue-300">{selectedStep.tokens.total} (In: {selectedStep.tokens.input}, Out: {selectedStep.tokens.output})</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Est. Cost</span>
                            <span className="text-green-300">${selectedStep.tokens.estimatedCost}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {selectedStep.payload ? (
                    <>
                      {selectedStep.payload.input && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-slate-300">Input / Prompt</h4>
                          <JsonViewer data={selectedStep.payload.input} label="Input Payload" />
                        </div>
                      )}
                      {selectedStep.payload.output && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-slate-300">Output / Response</h4>
                          <JsonViewer data={selectedStep.payload.output} label="Output Payload" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-8 text-slate-500 italic bg-slate-900/30 rounded-lg border border-slate-800 border-dashed">
                      No payload data captured for this step.
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 opacity-60">
                  <Box size={48} strokeWidth={1} />
                  <p>Select a trace step to inspect details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Replay Modal */}
      <Modal
        isOpen={isReplayModalOpen}
        onClose={() => setIsReplayModalOpen(false)}
        title="Fork & Replay Task"
        footer={
          <>
            <button 
              onClick={() => setIsReplayModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleReplaySubmit}
              disabled={isReplaying}
              className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-500 text-white rounded flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isReplaying ? 'Processing...' : <><Play size={14} /> Run Task</>}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Modify the initial input parameters to create a new task execution trace based on this one.
          </p>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Input Payload (JSON)</label>
            <textarea
              value={replayPayload}
              onChange={(e) => setReplayPayload(e.target.value)}
              className="w-full h-64 bg-slate-950 border border-slate-700 rounded p-3 text-sm font-mono text-slate-200 focus:border-primary-500 focus:outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Traces;
