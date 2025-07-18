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
      (window as any).require.config({ 
        paths: { 'vs': 'https://unpkg.com/monaco-editor@0.44.0/min/vs' }
      });
      (window as any).require(['vs/editor/editor.main'], (monacoModule: any) => {
        console.log('Monaco loaded successfully');
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
      console.log('Setting up Monaco editor with VS Code Dark+ theme');

      // Define VS Code Dark+ theme with proper token colors
      monaco.editor.defineTheme('vs-code-dark-plus', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          // Comments - Green and italic
          { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
          { token: 'comment.line', foreground: '6A9955', fontStyle: 'italic' },
          { token: 'comment.block', foreground: '6A9955', fontStyle: 'italic' },

          // Strings - Orange
          { token: 'string', foreground: 'CE9178' },
          { token: 'string.quoted', foreground: 'CE9178' },
          { token: 'string.quoted.single', foreground: 'CE9178' },
          { token: 'string.quoted.double', foreground: 'CE9178' },
          { token: 'string.quoted.triple', foreground: 'CE9178' },

          // Numbers - Light green
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'number.integer', foreground: 'B5CEA8' },
          { token: 'number.float', foreground: 'B5CEA8' },
          { token: 'number.hex', foreground: 'B5CEA8' },

          // Keywords - Purple/Blue
          { token: 'keyword', foreground: 'C586C0' },
          { token: 'keyword.control', foreground: 'C586C0' },
          { token: 'keyword.operator', foreground: 'C586C0' },
          { token: 'storage.type', foreground: 'C586C0' },

          // Functions - Yellow
          { token: 'entity.name.function', foreground: 'DCDCAA' },
          { token: 'support.function', foreground: 'DCDCAA' },

          // Variables - Light blue
          { token: 'variable', foreground: '9CDCFE' },
          { token: 'variable.parameter', foreground: '9CDCFE' },

          // Operators - White
          { token: 'keyword.operator.arithmetic', foreground: 'D4D4D4' },
          { token: 'keyword.operator.assignment', foreground: 'D4D4D4' },
          { token: 'keyword.operator.comparison', foreground: 'D4D4D4' },

          // Brackets - Gold  
          { token: 'punctuation.parenthesis', foreground: 'FFD700' },
          { token: 'punctuation.bracket', foreground: 'FFD700' },
          { token: 'punctuation.square', foreground: 'FFD700' },
          { token: 'delimiter.bracket', foreground: 'FFD700' },

          // Constants
          { token: 'constant.language', foreground: '569CD6' },
          { token: 'constant.language.boolean', foreground: '569CD6' },
          { token: 'constant.language.null', foreground: '569CD6' },

          // Classes
          { token: 'entity.name.class', foreground: '4EC9B0' },
          { token: 'entity.name.type', foreground: '4EC9B0' },
        ],
        colors: {
          'editor.background': '#1E1E1E',
          'editor.foreground': '#D4D4D4',
          'editorLineNumber.foreground': '#858585',
          'editorLineNumber.activeForeground': '#C6C6C6',
          'editor.lineHighlightBackground': '#2D2D30',
          'editor.selectionBackground': '#264F78',
          'editorCursor.foreground': '#AEAFAD',
        }
      });

      // Enhanced Python language configuration
      monaco.languages.setLanguageConfiguration('python', {
        comments: {
          lineComment: '#',
          blockComment: ['"""', '"""']
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"', notIn: ['string'] },
          { open: "'", close: "'", notIn: ['string', 'comment'] }
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" }
        ],
        indentationRules: {
          increaseIndentPattern: /^\s*(def\s|class\s|if\s|elif\s|else:|for\s|while\s|with\s|try:|except.*:|finally:|lambda.*:)\s*$/,
          decreaseIndentPattern: /^\s*(break|continue|pass|return|raise)\s*$/
        }
      });

      // Python syntax highlighting with Monarch
      monaco.languages.setMonarchTokensProvider('python', {
        defaultToken: '',
        tokenPostfix: '.python',

        keywords: [
          'False', 'None', 'True', 'and', 'as', 'assert', 'break', 'class', 'continue', 'def',
          'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import',
          'in', 'is', 'lambda', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with',
          'yield', 'async', 'await', 'nonlocal'
        ],

        builtins: [
          'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'bytearray', 'bytes', 'callable', 'chr',
          'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir', 'divmod', 'enumerate',
          'eval', 'exec', 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr',
          'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len',
          'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object', 'oct', 'open',
          'ord', 'pow', 'print', 'property', 'range', 'repr', 'reversed', 'round', 'set', 'setattr',
          'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip'
        ],

        operators: [
          '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
          '+', '-', '*', '/', '&', '|', '^', '%', '<<', '>>', '>>>', '+=', '-=', '*=', '/=',
          '&=', '|=', '^=', '%=', '<<=', '>>=', '>>>='
        ],

        symbols: /[=><!~?:&|+\-*\/\^%]+/,

        tokenizer: {
          root: [
            // Function calls
            [/\b([a-zA-Z_]\w*)\s*(?=\()/, {
              cases: {
                '@builtins': 'entity.name.function',
                '@default': 'entity.name.function'
              }
            }],

            // Keywords
            [/[a-zA-Z_]\w*/, {
              cases: {
                '@keywords': 'keyword',
                '@builtins': 'support.function',
                '@default': 'variable'
              }
            }],

            // Whitespace
            { include: '@whitespace' },

            // Numbers
            [/\d*\d+[lL]?/, 'number'],
            [/\d*\.\d+([eE][\-+]?\d+)?[fFdD]?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+[Ll]?/, 'number.hex'],
            [/0[0-7]+[Ll]?/, 'number.octal'],
            [/0[bB][0-1]+[Ll]?/, 'number.binary'],

            // Strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/"/, 'string', '@string_double'],
            [/'/, 'string', '@string_single'],
            [/"""/, 'string', '@string_triple_double'],
            [/'''/, 'string', '@string_triple_single'],

            // Delimiters and operators
            [/[{}()\[\]]/, 'delimiter.bracket'],
            [/@symbols/, {
              cases: {
                '@operators': 'keyword.operator.arithmetic',
                '@default': ''
              }
            }],
            [/[,;]/, 'punctuation.delimiter'],
          ],

          whitespace: [
            [/[ \t\r\n]+/, ''],
            [/#.*$/, 'comment'],
          ],

          string_double: [
            [/[^\\"]+/, 'string'],
            [/\\./, 'string.escape'],
            [/"/, 'string', '@pop']
          ],

          string_single: [
            [/[^\\']+/, 'string'],
            [/\\./, 'string.escape'],
            [/'/, 'string', '@pop']
          ],

          string_triple_double: [
            [/[^"]+/, 'string'],
            [/"""/, 'string', '@pop'],
            [/"/, 'string']
          ],

          string_triple_single: [
            [/[^']+/, 'string'],
            [/'''/, 'string', '@pop'],
            [/'/, 'string']
          ]
        }
      });

      // Create the editor
      const newEditor = monaco.editor.create(editorRef.current, {
        value: code,
        language: 'python',
        theme: 'vs-code-dark-plus',
        automaticLayout: true,
        fontSize: 14,
        fontFamily: "'Cascadia Code', 'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, Menlo, 'Ubuntu Mono', monospace",
        fontLigatures: true,
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        minimap: { enabled: false },
        padding: { top: 16, bottom: 16 },
        wordWrap: 'on',
        wrappingIndent: 'indent',

        // Auto-formatting and indentation
        autoIndent: 'full',
        formatOnType: true,
        formatOnPaste: true,
        insertSpaces: true,
        tabSize: 4,
        detectIndentation: false,
        trimAutoWhitespace: true,

        // Auto-closing
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        autoClosingOvertype: 'always',
        autoSurround: 'languageDefined',

        // Visual enhancements
        bracketPairColorization: {
          enabled: true,
          independentColorPoolPerBracketType: false
        },
        guides: {
          indentation: true,
          bracketPairs: true,
          bracketPairsHorizontal: true,
          highlightActiveIndentation: true
        },

        // Code folding
        folding: true,
        foldingStrategy: 'indentation',
        showFoldingControls: 'mouseover',
        foldingHighlight: true,

        // Selection and matching
        matchBrackets: 'always',
        selectionHighlight: true,
        occurrencesHighlight: true,

        // Rulers for line length
        rulers: [79, 88],

        // Multi-cursor
        multiCursorModifier: 'ctrlCmd',
        multiCursorMergeOverlapping: true,

        // Scrolling
        scrollbar: {
          vertical: 'auto',
          horizontal: 'auto',
          useShadows: false,
          verticalHasArrows: false,
          horizontalHasArrows: false,
          verticalScrollbarSize: 14,
          horizontalScrollbarSize: 14,
          arrowSize: 11
        },

        // Performance
        wordBasedSuggestions: 'currentDocument',

        // Editor behavior
        dragAndDrop: true,
        copyWithSyntaxHighlighting: true,
        emptySelectionClipboard: true,
        useTabStops: true
      });

      // Add Python-specific keyboard shortcuts
      newEditor.addCommand(monaco.KeyCode.Enter, () => {
        const model = newEditor.getModel();
        const position = newEditor.getPosition();

        if (model && position) {
          const lineContent = model.getLineContent(position.lineNumber);
          const currentIndent = lineContent.length - lineContent.trimStart().length;
          const shouldIndent = /:\s*$/.test(lineContent.trim());

          if (shouldIndent) {
            const newIndent = currentIndent + 4;
            const indentString = ' '.repeat(newIndent);

            newEditor.executeEdits('auto-indent', [{
              range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
              text: '\n' + indentString,
            }]);

            newEditor.setPosition({ lineNumber: position.lineNumber + 1, column: newIndent + 1 });
          } else {
            const indentString = ' '.repeat(currentIndent);

            newEditor.executeEdits('auto-indent', [{
              range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
              text: '\n' + indentString,
            }]);

            newEditor.setPosition({ lineNumber: position.lineNumber + 1, column: currentIndent + 1 });
          }
        }
      });

      // Tab for indentation
      newEditor.addCommand(monaco.KeyCode.Tab, () => {
        const selection = newEditor.getSelection();
        if (selection && !selection.isEmpty()) {
          newEditor.getAction('editor.action.indentLines')?.run();
        } else {
          const position = newEditor.getPosition();
          if (position) {
            newEditor.executeEdits('tab-indent', [{
              range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
              text: '    ',
            }]);
          }
        }
      });

      // Shift+Tab for outdenting
      newEditor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Tab, () => {
        newEditor.getAction('editor.action.outdentLines')?.run();
      });

      // VS Code shortcuts
      newEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
        newEditor.getAction('editor.action.commentLine')?.run();
      });

      newEditor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.UpArrow, () => {
        newEditor.getAction('editor.action.moveLinesUpAction')?.run();
      });

      newEditor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.DownArrow, () => {
        newEditor.getAction('editor.action.moveLinesDownAction')?.run();
      });

      // Force theme application after a delay
      setTimeout(() => {
        console.log('Applying theme and forcing re-tokenization');
        monaco.editor.setTheme('vs-code-dark-plus');
        newEditor.updateOptions({ theme: 'vs-code-dark-plus' });

        // Force re-tokenization by updating the model
        const model = newEditor.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, 'python');

          // Trigger re-tokenization by modifying and restoring content
          const currentValue = model.getValue();
          model.setValue(' ');
          setTimeout(() => {
            model.setValue(currentValue);
            console.log('Theme and syntax highlighting applied');
          }, 50);
        }
      }, 1000);

      // Content change listener
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
      <div className="bg-[#2D2D30] border-b border-[#3E3E42] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-[#FF5F56] rounded-full"></div>
            <div className="w-3 h-3 bg-[#FFBD2E] rounded-full"></div>
            <div className="w-3 h-3 bg-[#27CA3F] rounded-full"></div>
          </div>
          <span className="text-sm font-mono text-[#CCCCCC]">main.py</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={onGetHint}
            variant="outline"
            size="sm"
            className="bg-[#0E639C]/20 border-[#007ACC]/50 text-[#007ACC] hover:bg-[#007ACC]/30 transition-colors"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Hint
          </Button>
          <Button
            onClick={onRunCode}
            disabled={isRunning}
            size="sm"
            className="bg-[#0E639C] hover:bg-[#1177BB] text-white transition-colors"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
          <Button
            onClick={onAnalyzeCode}
            disabled={isAnalyzing}
            className="bg-[#C586C0] hover:bg-[#D4A5D4] text-white transition-colors"
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
        className="flex-1 overflow-hidden"
        onKeyDown={handleKeyDown}
        style={{ height: '100%' }}
      />
    </div>
  );
}