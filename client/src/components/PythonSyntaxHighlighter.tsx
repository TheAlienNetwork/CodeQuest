import { useMemo } from 'react';

interface PythonSyntaxHighlighterProps {
  code: string;
  className?: string;
}

export default function PythonSyntaxHighlighter({ code, className = "" }: PythonSyntaxHighlighterProps) {
  const highlightedCode = useMemo(() => {
    if (!code) return '';

    // Python keywords
    const keywords = [
      'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally',
      'with', 'as', 'import', 'from', 'return', 'yield', 'pass', 'break', 'continue',
      'and', 'or', 'not', 'in', 'is', 'lambda', 'global', 'nonlocal', 'assert', 'del',
      'True', 'False', 'None'
    ];

    // Built-in functions
    const builtins = [
      'print', 'input', 'len', 'range', 'str', 'int', 'float', 'bool', 'list', 'dict',
      'set', 'tuple', 'type', 'isinstance', 'hasattr', 'getattr', 'setattr', 'zip',
      'enumerate', 'map', 'filter', 'sum', 'min', 'max', 'sorted', 'reversed', 'all', 'any'
    ];

    let highlighted = code;

    // Highlight strings (single and double quotes)
    highlighted = highlighted.replace(
      /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
      '<span class="text-[var(--cyber-green)]">$1$2$1</span>'
    );

    // Highlight comments
    highlighted = highlighted.replace(
      /(#.*$)/gm,
      '<span class="text-gray-400 italic">$1</span>'
    );

    // Highlight numbers
    highlighted = highlighted.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="text-[var(--cyber-cyan)]">$1</span>'
    );

    // Highlight keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-[var(--cyber-purple)] font-semibold">${keyword}</span>`);
    });

    // Highlight built-in functions
    builtins.forEach(builtin => {
      const regex = new RegExp(`\\b${builtin}\\b(?=\\s*\\()`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-[var(--cyber-pink)]">${builtin}</span>`);
    });

    // Highlight operators
    highlighted = highlighted.replace(
      /(\+|\-|\*|\/|%|==|!=|<=|>=|<|>|=|\+=|\-=|\*=|\/=)/g,
      '<span class="text-[var(--cyber-cyan)]">$1</span>'
    );

    // Highlight function definitions
    highlighted = highlighted.replace(
      /\b(def)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
      '<span class="text-[var(--cyber-purple)] font-semibold">$1</span> <span class="text-[var(--cyber-yellow)]">$2</span>'
    );

    // Highlight class definitions
    highlighted = highlighted.replace(
      /\b(class)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
      '<span class="text-[var(--cyber-purple)] font-semibold">$1</span> <span class="text-[var(--cyber-yellow)]">$2</span>'
    );

    return highlighted;
  }, [code]);

  return (
    <pre 
      className={`font-mono text-sm leading-relaxed whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
}