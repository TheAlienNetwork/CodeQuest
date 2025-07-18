import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Bot, Lightbulb } from 'lucide-react';
import PythonSyntaxHighlighter from './PythonSyntaxHighlighter';

interface SimpleCodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onRunCode: () => void;
  onAnalyzeCode: () => void;
  onGetHint: () => void;
  isRunning: boolean;
  isAnalyzing: boolean;
}

export default function SimpleCodeEditor({
  code,
  onChange,
  onRunCode,
  onAnalyzeCode,
  onGetHint,
  isRunning,
  isAnalyzing
}: SimpleCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
      
      // Set cursor position after the tab
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

      {/* Editor */}
      <div className="flex-1 flex bg-[var(--cyber-dark)] text-white font-mono relative">
        {/* Line Numbers */}
        <div className="bg-[var(--cyber-gray)] border-r border-[var(--cyber-cyan)]/30 px-3 py-4 select-none">
          {lineNumbers.map((num) => (
            <div key={num} className="text-sm text-gray-400 leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Code Area with Syntax Highlighting */}
        <div className="flex-1 relative">
          {/* Syntax Highlighted Background */}
          <div className="absolute inset-0 p-4 pointer-events-none overflow-hidden">
            <PythonSyntaxHighlighter 
              code={code} 
              className="leading-6"
            />
          </div>

          {/* Code Area (Transparent overlay) */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 bg-transparent text-transparent font-mono text-sm leading-6 p-4 resize-none outline-none caret-white"
            style={{
              fontFamily: 'JetBrains Mono, Consolas, "Courier New", monospace',
              lineHeight: '1.5',
              tabSize: 4,
              backgroundColor: 'transparent',
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