import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  label?: string;
  initialExpanded?: boolean;
}

const JsonItem: React.FC<{ 
  name: string | null; 
  value: any; 
  isLast: boolean; 
  depth: number; 
}> = ({ name, value, isLast, depth }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  
  const indent = depth * 1.5; // rem padding

  if (!isObject) {
    let displayValue = JSON.stringify(value);
    let valueColor = 'text-orange-300'; // string
    if (typeof value === 'number') valueColor = 'text-blue-300';
    if (typeof value === 'boolean') valueColor = 'text-purple-300';
    if (value === null) valueColor = 'text-slate-500';

    return (
      <div style={{ paddingLeft: `${indent}rem` }} className="font-mono text-xs leading-relaxed hover:bg-slate-800/50 rounded">
        {name && <span className="text-slate-400">"{name}": </span>}
        <span className={valueColor}>{displayValue}</span>
        {!isLast && <span className="text-slate-500">,</span>}
      </div>
    );
  }

  const isEmpty = isArray ? value.length === 0 : Object.keys(value).length === 0;
  const bracketOpen = isArray ? '[' : '{';
  const bracketClose = isArray ? ']' : '}';

  return (
    <div>
      <div 
        style={{ paddingLeft: `${indent}rem` }} 
        className="flex items-center font-mono text-xs leading-relaxed cursor-pointer hover:bg-slate-800/50 rounded group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="mr-1 text-slate-500 w-4 flex justify-center">
          {!isEmpty && (isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />)}
        </span>
        {name && <span className="text-purple-300 mr-1">"{name}":</span>}
        <span className="text-slate-300">{bracketOpen}</span>
        {!isExpanded && !isEmpty && <span className="text-slate-600 mx-1">...</span>}
        {isEmpty && <span className="text-slate-300">{bracketClose}</span>}
        {!isExpanded && !isEmpty && <span className="text-slate-300">{bracketClose}</span>}
        {!isLast && (!isExpanded || isEmpty) && <span className="text-slate-500">,</span>}
        {isArray && !isExpanded && <span className="ml-2 text-slate-600 text-[10px]">// {value.length} items</span>}
      </div>
      
      {isExpanded && !isEmpty && (
        <div>
          {Object.keys(value).map((key, index, arr) => (
            <JsonItem 
              key={key} 
              name={isArray ? null : key} 
              value={value[key]} 
              isLast={index === arr.length - 1} 
              depth={depth + 1} 
            />
          ))}
          <div style={{ paddingLeft: `${indent}rem` }} className="font-mono text-xs leading-relaxed hover:bg-slate-800/50 rounded">
            <span className="text-slate-300 ml-5">{bracketClose}</span>
            {!isLast && <span className="text-slate-500">,</span>}
          </div>
        </div>
      )}
    </div>
  );
};

const JsonViewer: React.FC<JsonViewerProps> = ({ data, label, initialExpanded = true }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700/50 overflow-hidden">
      {(label || data) && (
        <div className="flex justify-between items-center px-3 py-2 bg-slate-800/50 border-b border-slate-700/50">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label || 'JSON'}</span>
          <button onClick={handleCopy} className="text-slate-500 hover:text-white transition-colors">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      )}
      <div className="p-3 overflow-x-auto custom-scrollbar">
        <JsonItem name={null} value={data} isLast={true} depth={0} />
      </div>
    </div>
  );
};

export default JsonViewer;
