
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
      // Enhanced Python language configuration with better syntax support
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
          { open: "'", close: "'", notIn: ['string', 'comment'] },
          { open: '"""', close: '"""' },
          { open: "'''", close: "'''" }
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
        },
        onEnterRules: [
          {
            beforeText: /^\s*(?:def|class|if|elif|else|for|while|with|try|except|finally).*:\s*$/,
            action: { indentAction: monaco.languages.IndentAction.Indent }
          }
        ]
      });

      // Register enhanced Python tokenizer
      monaco.languages.setMonarchTokensProvider('python', {
        defaultToken: 'identifier',
        tokenPostfix: '.python',
        
        keywords: [
          'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else',
          'except', 'exec', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
          'lambda', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'
        ],
        
        builtins: [
          'True', 'False', 'None', 'print', 'input', 'len', 'range', 'str', 'int', 'float', 
          'bool', 'list', 'dict', 'set', 'tuple', 'type', 'isinstance', 'hasattr', 'getattr', 
          'setattr', 'abs', 'all', 'any', 'bin', 'callable', 'chr', 'classmethod', 'compile',
          'delattr', 'dir', 'divmod', 'enumerate', 'eval', 'filter', 'format', 'frozenset',
          'globals', 'hash', 'help', 'id', 'iter', 'locals', 'map', 'max', 'min', 'next',
          'object', 'oct', 'open', 'ord', 'pow', 'property', 'repr', 'reversed', 'round',
          'sorted', 'staticmethod', 'sum', 'super', 'vars', 'zip'
        ],
        
        operators: [
          '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=', '&&', '||', '++', '--',
          '+', '-', '*', '/', '&', '|', '^', '%', '<<', '>>', '>>>', '+=', '-=', '*=', '/=',
          '&=', '|=', '^=', '%=', '<<=', '>>=', '>>>='
        ],
        
        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        
        tokenizer: {
          root: [
            // Function definitions and calls
            [/\b([a-zA-Z_]\w*)\s*(?=\()/, 'function'],
            
            // Identifiers (must come after function check)
            [/[a-zA-Z_]\w*/, {
              cases: {
                '@keywords': 'keyword',
                '@builtins': 'function',
                '@default': 'variable'
              }
            }],
            
            // Whitespace
            { include: '@whitespace' },
            
            // Numbers
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number'],
            [/0[xX][0-9a-fA-F]+/, 'number'],
            [/\d+/, 'number'],
            
            // Strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/"/, 'string', '@string_double'],
            [/'/, 'string', '@string_single'],
            [/"""/, 'string', '@string_triple_double'],
            [/'''/, 'string', '@string_triple_single'],
            
            // Delimiters and operators
            [/[{}()\[\]]/, 'delimiter.bracket'],
            [/@symbols/, 'operator'],
            [/[,;]/, 'delimiter'],
          ],
          
          whitespace: [
            [/[ \t\r\n]+/, 'white'],
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

      // Define enhanced VS Code Dark+ theme with proper Python syntax highlighting
      monaco.editor.defineTheme('vs-code-dark-plus', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          // Comments - Green italic
          { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
          { token: 'comment.line', foreground: '6A9955', fontStyle: 'italic' },
          { token: 'comment.block', foreground: '6A9955', fontStyle: 'italic' },
          
          // Strings - Orange
          { token: 'string', foreground: 'CE9178' },
          { token: 'string.quoted', foreground: 'CE9178' },
          { token: 'string.quoted.single', foreground: 'CE9178' },
          { token: 'string.quoted.double', foreground: 'CE9178' },
          { token: 'string.quoted.triple', foreground: 'CE9178' },
          { token: 'string.escape', foreground: 'D7BA7D' },
          
          // Numbers - Light Green
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'number.integer', foreground: 'B5CEA8' },
          { token: 'number.float', foreground: 'B5CEA8' },
          { token: 'number.hex', foreground: 'B5CEA8' },
          { token: 'number.octal', foreground: 'B5CEA8' },
          { token: 'number.binary', foreground: 'B5CEA8' },
          
          // Functions - Yellow
          { token: 'function', foreground: 'DCDCAA' },
          { token: 'entity.name.function', foreground: 'DCDCAA' },
          { token: 'support.function', foreground: 'DCDCAA' },
          { token: 'support.function.builtin', foreground: 'DCDCAA' },
          { token: 'meta.function-call', foreground: 'DCDCAA' },
          
          // Variables - Light Blue
          { token: 'variable', foreground: '9CDCFE' },
          { token: 'variable.parameter', foreground: '9CDCFE' },
          { token: 'variable.other', foreground: '9CDCFE' },
          { token: 'identifier', foreground: '9CDCFE' },
          { token: 'meta.definition.variable', foreground: '9CDCFE' },
          
          // Operators - White
          { token: 'operator', foreground: 'D4D4D4' },
          { token: 'keyword.operator.arithmetic', foreground: 'D4D4D4' },
          { token: 'keyword.operator.assignment', foreground: 'D4D4D4' },
          { token: 'keyword.operator.comparison', foreground: 'D4D4D4' },
          { token: 'keyword.operator.logical', foreground: 'D4D4D4' },
          
          // Brackets - Gold
          { token: 'delimiter.bracket', foreground: 'FFD700' },
          { token: 'delimiter.parenthesis', foreground: 'FFD700' },
          { token: 'delimiter.square', foreground: 'FFD700' },
          { token: 'delimiter.curly', foreground: 'FFD700' },
          
          // Python keywords - Blue/Purple
          { token: 'keyword', foreground: '569CD6' },
          { token: 'keyword.control', foreground: 'C586C0' },
          { token: 'keyword.operator', foreground: 'D4D4D4' },
          { token: 'keyword.other', foreground: 'C586C0' },
          
          // Classes - Teal
          { token: 'entity.name.class', foreground: '4EC9B0' },
          { token: 'entity.name.type', foreground: '4EC9B0' },
          { token: 'support.type', foreground: '4EC9B0' },
          
          // Constants - Blue
          { token: 'constant', foreground: '569CD6' },
          { token: 'constant.language', foreground: '569CD6' },
          { token: 'constant.numeric', foreground: 'B5CEA8' },
          { token: 'constant.language.boolean', foreground: '569CD6' },
          { token: 'constant.language.null', foreground: '569CD6' },
          
          // Delimiters - Default
          { token: 'delimiter', foreground: 'D4D4D4' },
          
          // Decorators - Purple
          { token: 'entity.name.decorator', foreground: 'C586C0' },
          { token: 'punctuation.decorator', foreground: 'C586C0' },
          
          // Python specific
          { token: 'support.function.builtin.python', foreground: 'DCDCAA' },
          { token: 'variable.language.self', foreground: '569CD6' },
          { token: 'variable.language.cls', foreground: '569CD6' },
          
          // Invalid - Red
          { token: 'invalid', foreground: 'F44747', background: '2D1B1B' },
          { token: 'invalid.illegal', foreground: 'F44747', background: '2D1B1B' }
        ],
        colors: {
          'editor.background': '#1E1E1E',
          'editor.foreground': '#D4D4D4',
          'editor.lineHighlightBackground': '#2D2D30',
          'editor.selectionBackground': '#264F78',
          'editor.inactiveSelectionBackground': '#3A3D41',
          'editorLineNumber.foreground': '#858585',
          'editorLineNumber.activeForeground': '#C6C6C6',
          'editor.selectionHighlightBackground': '#ADD6FF26',
          'editor.wordHighlightBackground': '#575757',
          'editor.wordHighlightStrongBackground': '#004972',
          'editorCursor.foreground': '#AEAFAD',
          'editorWhitespace.foreground': '#404040',
          'editorIndentGuide.background': '#404040',
          'editorIndentGuide.activeBackground': '#707070',
          'editorBracketMatch.background': '#0064001a',
          'editorBracketMatch.border': '#888888',
          'scrollbarSlider.background': '#79797966',
          'scrollbarSlider.hoverBackground': '#646464b3',
          'scrollbarSlider.activeBackground': '#bfbfbf66',
          'editor.findMatchBackground': '#515C6A',
          'editor.findMatchHighlightBackground': '#EA5C0055',
          'editor.findRangeHighlightBackground': '#3A3D4166',
          'editorHoverWidget.background': '#252526',
          'editorHoverWidget.border': '#454545',
          'editorSuggestWidget.background': '#252526',
          'editorSuggestWidget.border': '#454545',
          'editorSuggestWidget.selectedBackground': '#094771'
        }
      });

      // Set the theme as default
      monaco.editor.setTheme('vs-code-dark-plus');
      
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
        
        // IntelliSense and suggestions
        suggest: {
          showKeywords: true,
          showSnippets: true,
          showFunctions: true,
          showConstructors: true,
          showFields: true,
          showVariables: true,
          showClasses: true,
          showStructs: true,
          showInterfaces: true,
          showModules: true,
          showProperties: true,
          showEvents: true,
          showOperators: true,
          showUnits: true,
          showValues: true,
          showConstants: true,
          showEnums: true,
          showEnumMembers: true,
          showColors: true,
          showFiles: true,
          showReferences: true,
          showFolders: true,
          showTypeParameters: true,
          insertMode: 'insert',
          filterGraceful: true,
          snippetsPreventQuickSuggestions: false
        },
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false
        },
        parameterHints: {
          enabled: true,
          cycle: true
        },
        
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
        unfoldOnClickAfterEndOfLine: false,
        
        // Selection and matching
        matchBrackets: 'always',
        selectionHighlight: true,
        occurrencesHighlight: true,
        
        // Rulers for line length
        rulers: [79, 88],
        
        // Hover and links
        hover: {
          enabled: true,
          delay: 300,
          sticky: true
        },
        links: true,
        
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
        
        // Find widget
        find: {
          autoFindInSelection: 'never',
          seedSearchStringFromSelection: 'always',
          addExtraSpaceOnTop: true
        },
        
        // Accessibility
        accessibilitySupport: 'auto',
        accessibilityPageSize: 10,
        
        // Performance
        wordBasedSuggestions: 'currentDocument',
        wordBasedSuggestionsOnlySameLanguage: false,
        
        // Snippets
        acceptSuggestionOnEnter: 'on',
        acceptSuggestionOnCommitCharacter: true,
        snippetSuggestions: 'top',
        
        // Editor behavior
        dragAndDrop: true,
        copyWithSyntaxHighlighting: true,
        emptySelectionClipboard: true,
        useTabStops: true,
        wordSeparators: "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?"
      });

      // Enhanced Python auto-indentation
      newEditor.addCommand(monaco.KeyCode.Enter, () => {
        const model = newEditor.getModel();
        const position = newEditor.getPosition();
        
        if (model && position) {
          const lineContent = model.getLineContent(position.lineNumber);
          const trimmedLine = lineContent.trim();
          
          // Calculate current indentation
          const currentIndent = lineContent.length - lineContent.trimStart().length;
          
          // Check if we need to increase indentation
          const shouldIndent = /^\s*(def\s|class\s|if\s|elif\s|else:|for\s|while\s|with\s|try:|except.*:|finally:|lambda.*:)\s*$/.test(lineContent);
          
          if (shouldIndent) {
            const newIndent = currentIndent + 4;
            const indentString = ' '.repeat(newIndent);
            
            newEditor.executeEdits('auto-indent', [{
              range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
              text: '\n' + indentString,
            }]);
            
            newEditor.setPosition({ lineNumber: position.lineNumber + 1, column: newIndent + 1 });
          } else {
            // Maintain current indentation
            const indentString = ' '.repeat(currentIndent);
            
            newEditor.executeEdits('auto-indent', [{
              range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
              text: '\n' + indentString,
            }]);
            
            newEditor.setPosition({ lineNumber: position.lineNumber + 1, column: currentIndent + 1 });
          }
        }
      });

      // Enhanced Tab handling
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

      // Add VS Code keyboard shortcuts
      newEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
        newEditor.getAction('editor.action.addSelectionToNextFindMatch')?.run();
      });

      newEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
        newEditor.getAction('editor.action.commentLine')?.run();
      });

      newEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK, () => {
        newEditor.getAction('editor.action.deleteLines')?.run();
      });

      newEditor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.UpArrow, () => {
        newEditor.getAction('editor.action.moveLinesUpAction')?.run();
      });

      newEditor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.DownArrow, () => {
        newEditor.getAction('editor.action.moveLinesDownAction')?.run();
      });

      // Format document
      newEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI, () => {
        newEditor.getAction('editor.action.formatDocument')?.run();
      });

      // Force syntax highlighting refresh
      setTimeout(() => {
        const model = newEditor.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, 'python');
          monaco.editor.setTheme('vs-code-dark-plus');
          newEditor.updateOptions({ theme: 'vs-code-dark-plus' });
        }
      }, 100);

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
