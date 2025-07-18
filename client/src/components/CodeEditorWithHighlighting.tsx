import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Bot, Lightbulb } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onRunCode: () => void;
  onAnalyzeCode: () => void;
  onGetHint: () => void;
  isRunning: boolean;
  isAnalyzing: boolean;
}

export default function CodeEditorWithHighlighting({
  code,
  onChange,
  onRunCode,
  onAnalyzeCode,
  onGetHint,
  isRunning,
  isAnalyzing
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);

  useEffect(() => {
    const lines = code.split('\n');
    setLineNumbers(Array.from({ length: lines.length }, (_, i) => i + 1));
  }, [code]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = code.substring(0, start) + '    ' + code.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 4;
          textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    } else if (e.key === 'F5' || (e.ctrlKey && e.key === 'Enter')) {
      e.preventDefault();
      onRunCode();
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const highlightCode = (code: string): string => {
    let highlighted = code;
    
    // Replace in order: Comments first, then strings, then keywords, etc.
    // Comments
    highlighted = highlighted.replace(/(#.*$)/gm, '<span style="color: #6b7280; font-style: italic;">$1</span>');
    
    // Strings (avoiding already highlighted content)
    highlighted = highlighted.replace(/(["'])((?:\\.|(?!\1)[^\\<])*?)\1/g, '<span style="color: #22c55e;">$1$2$1</span>');
    
    // Keywords (avoiding already highlighted content)
    highlighted = highlighted.replace(/\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|pass|break|continue|and|or|not|in|is|lambda|global|nonlocal|assert|del|True|False|None)\b/g, '<span style="color: #a855f7; font-weight: bold;">$1</span>');
    
    // Built-in functions
    highlighted = highlighted.replace(/\b(print|input|len|range|str|int|float|bool|list|dict|set|tuple|type|isinstance|hasattr|getattr|setattr|zip|enumerate|map|filter|sum|min|max|sorted|reversed|all|any)\b(?=\s*\()/g, '<span style="color: #ec4899;">$1</span>');
    
    // Numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #06b6d4;">$1</span>');
    
    // Operators
    highlighted = highlighted.replace(/(\+|\-|\*|\/|%|==|!=|<=|>=|<|>|=|\+=|\-=|\*=|\/=)/g, '<span style="color: #06b6d4;">$1</span>');
    
    return highlighted;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="bg-[var(--cyber-gray)] border-b border-[var(--cyber-cyan)]/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-mono text-gray-400 ml-4">main.py</span>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={onRunCode}
            disabled={isRunning}
            className="btn-cyber-sm"
          >
            <Play className="w-4 h-4 mr-1" />
            {isRunning ? 'Running...' : 'Run (F5)'}
          </Button>
          <Button
            onClick={onAnalyzeCode}
            disabled={isAnalyzing}
            className="btn-cyber-sm"
          >
            <Bot className="w-4 h-4 mr-1" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
          <Button
            onClick={onGetHint}
            className="btn-cyber-sm"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            Hint
          </Button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 flex bg-[var(--cyber-dark)] text-white font-mono relative overflow-hidden">
        {/* Line Numbers */}
        <div className="bg-[var(--cyber-gray)] border-r border-[var(--cyber-cyan)]/30 px-3 py-4 select-none min-w-[60px] text-right">
          {lineNumbers.map((num) => (
            <div key={num} className="text-sm text-gray-400 leading-6 h-6">
              {num}
            </div>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative">
          {/* Code Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            className="absolute inset-0 bg-transparent text-white font-mono text-sm leading-6 p-4 resize-none outline-none"
            style={{
              fontFamily: 'JetBrains Mono, Consolas, "Courier New", monospace',
              lineHeight: '1.5',
              tabSize: 4,
              backgroundColor: 'transparent',
              caretColor: 'var(--cyber-cyan)',
            }}
            placeholder="# Write your Python code here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-[var(--cyber-gray)] border-t border-[var(--cyber-cyan)]/30 px-4 py-2 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Python 3.11</span>
          <span>Lines: {lineNumbers.length} | Chars: {code.length}</span>
        </div>
      </div>
    </div>
  );
}