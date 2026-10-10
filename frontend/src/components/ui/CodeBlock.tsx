import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  filename,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden border border-slate-800 bg-[#0b1329] shadow-md ${className}`}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#070d1e] border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          {filename && <span className="text-slate-300 font-medium">{filename}</span>}
          {!filename && <span className="uppercase text-[11px] text-indigo-400 font-bold">{language}</span>}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-[11px] font-medium cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200 dark-scroll max-h-[480px]">
        <pre className="selection:bg-indigo-700 selection:text-white">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
