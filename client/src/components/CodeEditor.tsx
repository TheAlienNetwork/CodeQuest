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
        wordWrap: 'on',
        wrappingIndent: 'indent',
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
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        autoSurround: 'languageDefined',
        bracketPairColorization: {
          enabled: true,
        },
        guides: {
          indentation: true,
          bracketPairs: true,
        },
        tabSize: 4,
        insertSpaces: true,
        detectIndentation: false,
        trimAutoWhitespace: true,
        acceptSuggestionOnEnter: 'on',
        acceptSuggestionOnCommitCharacter: true,
        snippetSuggestions: 'top',
        wordBasedSuggestions: 'currentDocument',
        folding: true,
        foldingStrategy: 'indentation',
        showFoldingControls: 'mouseover',
        matchBrackets: 'always',
        renderLineHighlight: 'line',
        renderWhitespace: 'selection',
        rulers: [79, 120],
      });

      // Define enhanced Python syntax highlighting theme
      monaco.editor.defineTheme('cyber-python-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          // Comments
          { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
          { token: 'comment.line', foreground: '6A9955', fontStyle: 'italic' },
          { token: 'comment.block', foreground: '6A9955', fontStyle: 'italic' },
          
          // Keywords
          { token: 'keyword', foreground: '00FFFF', fontStyle: 'bold' },
          { token: 'keyword.control', foreground: '00FFFF', fontStyle: 'bold' },
          { token: 'keyword.operator', foreground: '00FFFF' },
          { token: 'keyword.other', foreground: '00FFFF' },
          
          // Strings
          { token: 'string', foreground: '00FF88' },
          { token: 'string.quoted', foreground: '00FF88' },
          { token: 'string.quoted.single', foreground: '00FF88' },
          { token: 'string.quoted.double', foreground: '00FF88' },
          { token: 'string.quoted.triple', foreground: '00FF88' },
          { token: 'string.interpolated', foreground: '4EC9B0' },
          
          // Numbers
          { token: 'number', foreground: 'F472B6' },
          { token: 'number.integer', foreground: 'F472B6' },
          { token: 'number.float', foreground: 'F472B6' },
          { token: 'number.hex', foreground: 'F472B6' },
          { token: 'number.octal', foreground: 'F472B6' },
          { token: 'number.binary', foreground: 'F472B6' },
          
          // Functions and methods
          { token: 'entity.name.function', foreground: 'DCDCAA', fontStyle: 'bold' },
          { token: 'support.function', foreground: 'DCDCAA' },
          { token: 'support.function.builtin', foreground: '4FC1FF' },
          
          // Classes
          { token: 'entity.name.class', foreground: '4EC9B0', fontStyle: 'bold' },
          { token: 'entity.name.type', foreground: '4EC9B0' },
          
          // Variables and identifiers
          { token: 'variable', foreground: '9CDCFE' },
          { token: 'variable.parameter', foreground: '9CDCFE' },
          { token: 'variable.other', foreground: '9CDCFE' },
          { token: 'identifier', foreground: 'FFFFFF' },
          
          // Operators
          { token: 'operator', foreground: 'D4D4D4' },
          { token: 'delimiter', foreground: 'D4D4D4' },
          { token: 'delimiter.bracket', foreground: 'FFD700' },
          { token: 'delimiter.parenthesis', foreground: 'FFD700' },
          { token: 'delimiter.square', foreground: 'FFD700' },
          
          // Constants and booleans
          { token: 'constant', foreground: '569CD6', fontStyle: 'bold' },
          { token: 'constant.language', foreground: '569CD6', fontStyle: 'bold' },
          { token: 'constant.numeric', foreground: 'F472B6' },
          
          // Decorators
          { token: 'entity.name.decorator', foreground: 'C586C0' },
          { token: 'meta.decorator', foreground: 'C586C0' },
          
          // Invalid/error highlighting
          { token: 'invalid', foreground: 'F44747', background: '2D1B1B' },
          { token: 'invalid.illegal', foreground: 'F44747', background: '2D1B1B' },
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
          'editorIndentGuide.activeBackground': '#00FFFF',
          'editorBracketMatch.background': '#264F78',
          'editorBracketMatch.border': '#00FFFF',
          'editorBracketHighlight.foreground1': '#FFD700',
          'editorBracketHighlight.foreground2': '#DA70D6',
          'editorBracketHighlight.foreground3': '#87CEEB',
          'editorBracketHighlight.foreground4': '#98FB98',
          'editorBracketHighlight.foreground5': '#F0E68C',
          'editorBracketHighlight.foreground6': '#DDA0DD',
          'editorRuler.foreground': '#3A3D41',
          'editor.foldBackground': '#1C2128',
          'editorGutter.foldingControlForeground': '#6E7681',
        },
      });

      monaco.editor.setTheme('cyber-python-theme');

      newEditor.onDidChangeModelContent(() => {
        const value = newEditor.getValue();
        onChange(value);
      });

      // Add Python-specific auto-indentation
      newEditor.addCommand(monaco.KeyCode.Enter, () => {
        const position = newEditor.getPosition();
        if (position) {
          const model = newEditor.getModel();
          if (model) {
            const lineContent = model.getLineContent(position.lineNumber);
            const trimmedLine = lineContent.trim();
            
            // Check if current line ends with colon (Python block start)
            if (trimmedLine.endsWith(':')) {
              const currentIndent = lineContent.length - lineContent.trimStart().length;
              const newIndent = currentIndent + 4; // Python standard is 4 spaces
              const indentString = ' '.repeat(newIndent);
              
              newEditor.executeEdits('auto-indent', [{
                range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                text: '\n' + indentString,
              }]);
              
              // Move cursor to end of new line
              newEditor.setPosition({ lineNumber: position.lineNumber + 1, column: newIndent + 1 });
            } else {
              // Regular enter behavior with current indentation
              const currentIndent = lineContent.length - lineContent.trimStart().length;
              const indentString = ' '.repeat(currentIndent);
              
              newEditor.executeEdits('auto-indent', [{
                range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                text: '\n' + indentString,
              }]);
              
              // Move cursor to end of new line
              newEditor.setPosition({ lineNumber: position.lineNumber + 1, column: currentIndent + 1 });
            }
          }
        }
      });

      // Add Tab key handling for consistent indentation
      newEditor.addCommand(monaco.KeyCode.Tab, () => {
        const selection = newEditor.getSelection();
        if (selection && !selection.isEmpty()) {
          // Indent selected lines
          newEditor.getAction('editor.action.indentLines')?.run();
        } else {
          // Insert 4 spaces at cursor
          const position = newEditor.getPosition();
          if (position) {
            newEditor.executeEdits('tab-indent', [{
              range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
              text: '    ',
            }]);
          }
        }
      });

      // Add Shift+Tab for dedenting
      newEditor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Tab, () => {
        newEditor.getAction('editor.action.outdentLines')?.run();
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
    if (editor && code !== undefined && editor.getValue() !== code) {
      const position = editor.getPosition();
      editor.setValue(code);
      if (position) {
        editor.setPosition(position);
      }
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