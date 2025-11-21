
import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { TopologyNode, TopologyLink } from '../types';
import { ZoomIn, ZoomOut, RefreshCw, Maximize } from 'lucide-react';

const Topology: React.FC = () => {
  const [nodes, setNodes] = useState<TopologyNode[]>([]);
  const [links, setLinks] = useState<TopologyLink[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const loadData = () => {
    const data = api.getTopology();
    setNodes(data.nodes);
    setLinks(data.links);
  };

  useEffect(() => {
    loadData();
    // Auto refresh topology
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getNodeColor = (node: TopologyNode) => {
    if (node.type === 'orchestrator') return '#8b5cf6'; // Violet
    if (node.status === 'BUSY') return '#3b82f6'; // Blue
    if (node.status === 'ERROR') return '#ef4444'; // Red
    return '#10b981'; // Green
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Topology</h1>
          <p className="text-slate-400 text-sm">Real-time visualization of agent orchestration network</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={loadData} className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-300">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden shadow-inner shadow-slate-950">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <svg ref={svgRef} className="w-full h-full">
          <defs>
             <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
               <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
             </marker>
             <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
               <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
             </marker>
             <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
               <feGaussianBlur stdDeviation="3" result="blur" />
               <feComposite in="SourceGraphic" in2="blur" operator="over" />
             </filter>
          </defs>
          
          {/* Links */}
          {links.map((link, i) => {
            const source = nodes.find(n => n.id === link.source);
            const target = nodes.find(n => n.id === link.target);
            if (!source || !target) return null;

            const isActive = link.active;
            
            return (
              <g key={i}>
                <line 
                  x1={source.x} y1={source.y} x2={target.x} y2={target.y}
                  stroke={isActive ? '#3b82f6' : '#334155'}
                  strokeWidth={isActive ? 2 : 1}
                  markerEnd={isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                  strokeDasharray={isActive ? 'none' : '5,5'}
                  className="transition-all duration-500"
                />
                {isActive && (
                  <circle r="3" fill="#60a5fa">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path={`M${source.x},${source.y} L${target.x},${target.y}`} />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <g 
              key={node.id} 
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer transition-all duration-300"
            >
              {/* Pulse effect for busy/orch nodes */}
              {(node.status === 'BUSY' || node.type === 'orchestrator') && (
                <circle r="25" fill={getNodeColor(node)} opacity="0.2">
                  <animate attributeName="r" from="20" to="30" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              <circle 
                r="20" 
                fill="#1e293b" 
                stroke={getNodeColor(node)} 
                strokeWidth="3"
                filter={hoveredNode === node.id ? 'url(#glow)' : ''}
              />
              
              <text 
                textAnchor="middle" 
                dy="5" 
                fill="white" 
                fontSize="10" 
                fontWeight="bold"
                pointerEvents="none"
              >
                {node.type === 'orchestrator' ? 'ORCH' : node.type.substring(0, 3).toUpperCase()}
              </text>

              <text
                y="35"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                className="uppercase tracking-wide"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur border border-slate-800 p-3 rounded-lg text-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-violet-500"></span>
            <span className="text-slate-300">Orchestrator</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-slate-300">Idle Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-slate-300">Busy Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-slate-500 border-dashed"></span>
            <span className="text-slate-500">Inactive Link</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-0.5 bg-blue-500"></span>
            <span className="text-blue-400">Active Traffic</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topology;
