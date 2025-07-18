import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Bot, Lightbulb, Eye, HelpCircle } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onRunCode: () => void;
  onAnalyzeCode: () => void;
  isRunning: boolean;
  isAnalyzing: boolean;
}

export default function CodeEditorWithHighlighting({
  code,
  onChange,
  onRunCode,
  onAnalyzeCode,
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
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (e.key === 'Tab') {
      e.preventDefault();
      
      if (e.shiftKey) {
        // Unindent - remove up to 4 spaces at the beginning of line(s)
        const lines = code.split('\n');
        const startLine = code.substring(0, start).split('\n').length - 1;
        const endLine = code.substring(0, end).split('\n').length - 1;
        
        let newCode = '';
        let cursorOffset = 0;
        
        lines.forEach((line, index) => {
          if (index >= startLine && index <= endLine) {
            if (line.startsWith('    ')) {
              line = line.substring(4);
              if (index === startLine) cursorOffset = -4;
            } else if (line.startsWith('   ')) {
              line = line.substring(3);
              if (index === startLine) cursorOffset = -3;
            } else if (line.startsWith('  ')) {
              line = line.substring(2);
              if (index === startLine) cursorOffset = -2;
            } else if (line.startsWith(' ')) {
              line = line.substring(1);
              if (index === startLine) cursorOffset = -1;
            }
          }
          newCode += line + (index < lines.length - 1 ? '\n' : '');
        });
        
        onChange(newCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = Math.max(0, start + cursorOffset);
        }, 0);
      } else {
        // Indent - add 4 spaces
        const newValue = code.substring(0, start) + '    ' + code.substring(end);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      
      // Auto-indentation logic
      const lines = code.substring(0, start).split('\n');
      const currentLine = lines[lines.length - 1];
      const indentMatch = currentLine.match(/^(\s*)/);
      let currentIndent = indentMatch ? indentMatch[1] : '';
      
      // Increase indent after colons (Python control structures)
      if (currentLine.trim().endsWith(':')) {
        currentIndent += '    ';
      }
      
      const newValue = code.substring(0, start) + '\n' + currentIndent + code.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + currentIndent.length;
      }, 0);
    } else if (e.key === 'Backspace' && start === end) {
      // Smart backspace - remove full indentation if at beginning of indent
      const beforeCursor = code.substring(0, start);
      const lines = beforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];
      
      if (currentLine.length > 0 && currentLine.match(/^\s+$/) && currentLine.length % 4 === 0) {
        // Remove 4 spaces at once
        e.preventDefault();
        const newValue = code.substring(0, start - 4) + code.substring(end);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 4;
        }, 0);
      }
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

  // Enhanced syntax highlighting with CSS classes
  const getHighlightedCode = (code: string): React.ReactNode => {
    if (!code) return code;
    
    const lines = code.split('\n');
    return lines.map((line, lineIndex) => (
      <div key={lineIndex} className="code-line">
        {highlightLine(line)}
      </div>
    ));
  };

  const highlightLine = (line: string): React.ReactNode => {
    if (!line) return '\n';
    
    const elements: React.ReactNode[] = [];
    let remaining = line;
    let index = 0;
    
    while (remaining.length > 0) {
      // Check for comments
      const commentMatch = remaining.match(/^(#.*)/);
      if (commentMatch) {
        elements.push(
          <span key={index++} style={{ color: '#608B4E', fontStyle: 'italic' }}>
            {commentMatch[1]}
          </span>
        );
        remaining = remaining.slice(commentMatch[1].length);
        continue;
      }
      
      // Check for strings
      const stringMatch = remaining.match(/^(["'])((?:\\.|(?!\1)[^\\])*?)\1/);
      if (stringMatch) {
        elements.push(
          <span key={index++} style={{ color: '#CE9178' }}>
            {stringMatch[0]}
          </span>
        );
        remaining = remaining.slice(stringMatch[0].length);
        continue;
      }
      
      // Check for keywords
      const keywordMatch = remaining.match(/^(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|pass|break|continue|and|or|not|in|is|lambda|global|nonlocal|assert|del|async|await|raise|match|case)\b/);
      if (keywordMatch) {
        elements.push(
          <span key={index++} style={{ color: '#569CD6', fontWeight: '500' }}>
            {keywordMatch[1]}
          </span>
        );
        remaining = remaining.slice(keywordMatch[1].length);
        continue;
      }
      
      // Check for literals
      const literalMatch = remaining.match(/^(True|False|None)\b/);
      if (literalMatch) {
        elements.push(
          <span key={index++} style={{ color: '#569CD6', fontWeight: '500' }}>
            {literalMatch[1]}
          </span>
        );
        remaining = remaining.slice(literalMatch[1].length);
        continue;
      }
      
      // Check for built-in functions
      const builtinMatch = remaining.match(/^(print|input|len|range|str|int|float|bool|list|dict|set|tuple|type|isinstance|hasattr|getattr|setattr|zip|enumerate|map|filter|sum|min|max|sorted|reversed|all|any|open|iter|next|round|abs|pow|divmod|hex|oct|bin|chr|ord|hash|id|eval|exec|compile|repr|format)\b/);
      if (builtinMatch) {
        elements.push(
          <span key={index++} style={{ color: '#DCDCAA' }}>
            {builtinMatch[1]}
          </span>
        );
        remaining = remaining.slice(builtinMatch[1].length);
        continue;
      }
      
      // Check for numbers
      const numberMatch = remaining.match(/^(0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+\.?\d*([eE][+-]?\d+)?)/);
      if (numberMatch) {
        elements.push(
          <span key={index++} style={{ color: '#B5CEA8' }}>
            {numberMatch[1]}
          </span>
        );
        remaining = remaining.slice(numberMatch[1].length);
        continue;
      }
      
      // Check for parentheses, brackets, braces (bright cyan)
      const bracketMatch = remaining.match(/^([(){}[\]])/);
      if (bracketMatch) {
        elements.push(
          <span key={index++} style={{ color: '#00D4AA', fontWeight: 'bold' }}>
            {bracketMatch[1]}
          </span>
        );
        remaining = remaining.slice(bracketMatch[1].length);
        continue;
      }
      
      // Check for operators (bright magenta)
      const operatorMatch = remaining.match(/^([+\-*/=<>!&|^%,.])/);
      if (operatorMatch) {
        elements.push(
          <span key={index++} style={{ color: '#FF6B9D' }}>
            {operatorMatch[1]}
          </span>
        );
        remaining = remaining.slice(operatorMatch[1].length);
        continue;
      }
      
      // Check for colons and semicolons (bright orange)
      const punctuationMatch = remaining.match(/^([;:])/);
      if (punctuationMatch) {
        elements.push(
          <span key={index++} style={{ color: '#FF9500', fontWeight: 'bold' }}>
            {punctuationMatch[1]}
          </span>
        );
        remaining = remaining.slice(punctuationMatch[1].length);
        continue;
      }
      
      // Default: add single character
      elements.push(remaining[0]);
      remaining = remaining.slice(1);
    }
    
    return elements;
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
          {/* Syntax Highlighting Overlay */}
          <div
            ref={highlightRef}
            className="absolute inset-0 p-4 font-mono text-sm leading-6 pointer-events-none overflow-hidden whitespace-pre-wrap break-words"
            style={{
              fontFamily: 'JetBrains Mono, Consolas, "Courier New", monospace',
              lineHeight: '1.5',
              color: 'transparent',
              backgroundColor: 'transparent',
            }}
          >
            {getHighlightedCode(code)}
          </div>
          
          {/* Code Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            className="absolute inset-0 bg-transparent text-transparent font-mono text-sm leading-6 p-4 resize-none outline-none caret-cyan-400"
            style={{
              fontFamily: 'JetBrains Mono, Consolas, "Courier New", monospace',
              lineHeight: '1.5',
              tabSize: 4,
              backgroundColor: 'transparent',
              caretColor: '#00FFFF',
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