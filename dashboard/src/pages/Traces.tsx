import React, { useState } from 'react';
import { Search, Clock, CheckCircle, XCircle, Box } from 'lucide-react';
import { TaskTrace, TaskStatus } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

const TraceStep: React.FC<{
    name: string;
    duration: number;
    status: 'OK' | 'ERROR';
    isLast: boolean;
    timestamp: string;
}> = ({ name, duration, status, isLast, timestamp }) => (
    <div className="relative pl-8 pb-8">
        {/* Connector Line */}
        {!isLast && (
            <div className={`absolute left-3 top-8 w-0.5 h-full bg-slate-700`} />
        )}

        {/* Node Icon */}
        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-slate-900 ${status === 'OK' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'
            }`}>
            {status === 'OK' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        </div>

        {/* Content */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700/50 shadow-sm flex justify-between items-center">
            <div>
                <h4 className="text-white font-medium">{name}</h4>
                <p className="text-xs text-slate-500 mt-1">{new Date(timestamp).toLocaleTimeString()}</p>
            </div>
            <div className="flex items-center space-x-4">
                <span className={`text-xs font-mono px-2 py-1 rounded ${duration > 1000 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-700 text-slate-300'
                    }`}>
                    {duration}ms
                </span>
            </div>
        </div>
    </div>
);

const generateSampleTrace = (traceId: string): TaskTrace => {
    const steps = [
        { name: 'Task Created', duration: 5 },
        { name: 'Orchestrator Routing', duration: 25 },
        { name: 'Agent Assignment', duration: 15 },
        { name: 'Context Retrieval', duration: 150 },
        { name: 'Task Processing', duration: 2400 },
        { name: 'Result Submission', duration: 45 },
    ];

    const startTime = new Date();
    let accumulatedTime = 0;

    const traceSteps = steps.map(step => {
        accumulatedTime += step.duration;
        return {
            name: step.name,
            timestamp: new Date(startTime.getTime() + accumulatedTime).toISOString(),
            durationMs: step.duration,
            status: (Math.random() > 0.95 ? 'ERROR' : 'OK') as 'ERROR' | 'OK'
        };
    });

    const isFailed = traceSteps.some(s => s.status === 'ERROR');

    return {
        trace_id: traceId,
        task_id: `task-${Math.random().toString(36).substring(2, 8)}`,
        task_description: "Example Task Processing",
        status: isFailed ? TaskStatus.FAILED : TaskStatus.COMPLETED,
        events: [],
        duration: accumulatedTime,
        agent_type: "implementation",
    };
};

const Traces: React.FC = () => {
    const { t } = useLanguage();
    const [searchId, setSearchId] = useState('');
    const [trace, setTrace] = useState<TaskTrace | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchId) {
            // Simulate API lookup
            const mockTrace = generateSampleTrace(searchId);
            setTrace(mockTrace);
        }
    };

    // Load a sample trace on mount for demo
    React.useEffect(() => {
        const sampleTrace = generateSampleTrace("trace-sample-demo");
        setTrace(sampleTrace);
    }, []);

    const traceSteps = trace ? [
        { name: 'Task Created', durationMs: 5, status: 'OK' as const, timestamp: new Date().toISOString() },
        { name: 'Agent Assigned', durationMs: 25, status: 'OK' as const, timestamp: new Date().toISOString() },
        { name: 'Processing Started', durationMs: 15, status: 'OK' as const, timestamp: new Date().toISOString() },
        { name: 'Task Completed', durationMs: 150, status: 'OK' as const, timestamp: new Date().toISOString() },
    ] : [];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">{t('distributedTracing')}</h1>
                <p className="text-slate-400 text-sm">{t('distributedTracingDesc')}</p>
            </div>

            {/* Search Box */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 mb-8">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder={t('enterTraceId')}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        {t('analyze')}
                    </button>
                </form>
            </div>

            {trace && (
                <div className="animate-fade-in">
                    {/* Header Summary */}
                    <div className="flex items-center justify-between mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center">
                                <Box className="w-5 h-5 mr-2 text-primary-500" />
                                {trace.task_description}
                            </h2>
                            <div className="flex items-center mt-2 space-x-4 text-sm text-slate-400">
                                <span className="font-mono bg-slate-900 px-2 py-0.5 rounded">ID: {trace.task_id}</span>
                                <span>Agent: {trace.agent_type}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold mb-2 ${trace.status === TaskStatus.COMPLETED ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                {trace.status.toUpperCase()}
                            </div>
                            <div className="text-slate-400 text-sm flex items-center justify-end">
                                <Clock className="w-3 h-3 mr-1" />
                                {t('total')}: {trace.duration || 0}ms
                            </div>
                        </div>
                    </div>

                    {/* Waterfall / Timeline */}
                    <div className="pl-4">
                        {traceSteps.map((step, idx) => (
                            <TraceStep
                                key={idx}
                                name={step.name}
                                duration={step.durationMs}
                                status={step.status}
                                timestamp={step.timestamp}
                                isLast={idx === traceSteps.length - 1}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Traces;
