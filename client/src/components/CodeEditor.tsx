import { useEffect, useRef, useState } from 'react';
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

export default function CodeEditor({
  code,
  onChange,
  onRunCode,
  onAnalyzeCode,
  onGetHint,
  isRunning,
  isAnalyzing
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [monaco, setMonaco] = useState<any>(null);
  const [editor, setEditor] = useState<any>(null);

  useEffect(() => {
    // Load Monaco Editor
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js';
    script.onload = () => {
      (window as any).require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } });
      (window as any).require(['vs/editor/editor.main'], (monacoModule: any) => {
        setMonaco(monacoModule);
      });
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (monaco && editorRef.current && !editor) {
      const newEditor = monaco.editor.create(editorRef.current, {
        value: code,
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, monospace',
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        padding: { top: 16, bottom: 16 },
        suggest: {
          showKeywords: true,
          showSnippets: true,
        },
        quickSuggestions: {
          other: true,
          comments: true,
          strings: true,
        },
        parameterHints: {
          enabled: true,
        },
        autoIndent: 'full',
        formatOnType: true,
        formatOnPaste: true,
      });

      // Define custom theme
      monaco.editor.defineTheme('cyber-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6A9955' },
          { token: 'keyword', foreground: '00FFFF' },
          { token: 'string', foreground: '00FF88' },
          { token: 'number', foreground: 'F472B6' },
          { token: 'function', foreground: '8B5CF6' },
          { token: 'variable', foreground: 'FFFFFF' },
        ],
        colors: {
          'editor.background': '#0D1117',
          'editor.foreground': '#FFFFFF',
          'editor.lineHighlightBackground': '#1C2128',
          'editor.selectionBackground': '#264F78',
          'editor.inactiveSelectionBackground': '#3A3D41',
          'editorLineNumber.foreground': '#6E7681',
          'editorLineNumber.activeForeground': '#00FFFF',
          'editor.selectionHighlightBackground': '#264F78',
          'editor.wordHighlightBackground': '#264F78',
          'editor.wordHighlightStrongBackground': '#264F78',
          'editorCursor.foreground': '#00FFFF',
          'editorWhitespace.foreground': '#3A3D41',
          'editorIndentGuide.background': '#3A3D41',
          'editorIndentGuide.activeBackground': '#6E7681',
          'editorBracketMatch.background': '#264F78',
          'editorBracketMatch.border': '#888888',
        },
      });

      monaco.editor.setTheme('cyber-theme');

      newEditor.onDidChangeModelContent(() => {
        const value = newEditor.getValue();
        onChange(value);
      });

      setEditor(newEditor);
    }

    return () => {
      if (editor) {
        editor.dispose();
      }
    };
  }, [monaco, code, onChange]);

  useEffect(() => {
    if (editor && editor.getValue() !== code) {
      editor.setValue(code);
    }
  }, [code, editor]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'Enter')) {
      e.preventDefault();
      onRunCode();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="bg-[var(--cyber-gray)] border-b border-[var(--cyber-cyan)]/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-sm font-mono text-gray-400">main.py</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={onGetHint}
            variant="outline"
            size="sm"
            className="bg-[var(--cyber-purple)]/20 border-[var(--cyber-purple)]/50 text-[var(--cyber-purple)] hover:bg-[var(--cyber-purple)]/30"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Hint
          </Button>
          <Button
            onClick={onRunCode}
            disabled={isRunning}
            className="btn-cyber"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
          <Button
            onClick={onAnalyzeCode}
            disabled={isAnalyzing}
            className="bg-[var(--cyber-purple)] hover:bg-[var(--cyber-purple)]/80 text-white"
            size="sm"
          >
            <Bot className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div
        ref={editorRef}
        className="flex-1 code-editor font-mono text-sm"
        onKeyDown={handleKeyDown}
        style={{ height: '100%' }}
      />
    </div>
  );
}
