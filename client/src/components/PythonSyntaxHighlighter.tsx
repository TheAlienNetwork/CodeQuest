import { useMemo } from 'react';

interface PythonSyntaxHighlighterProps {
  code: string;
  className?: string;
}

export default function PythonSyntaxHighlighter({ code, className = "" }: PythonSyntaxHighlighterProps) {
  const highlightedCode = useMemo(() => {
    if (!code) return '';

    // Python keywords (enhanced like VS Code)
    const keywords = [
      'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally',
      'with', 'as', 'import', 'from', 'return', 'yield', 'pass', 'break', 'continue',
      'and', 'or', 'not', 'in', 'is', 'lambda', 'global', 'nonlocal', 'assert', 'del',
      'async', 'await', 'raise', 'match', 'case'
    ];

    // Boolean and None literals  
    const literals = ['True', 'False', 'None'];

    // Built-in functions (enhanced)
    const builtins = [
      'print', 'input', 'len', 'range', 'str', 'int', 'float', 'bool', 'list', 'dict',
      'set', 'tuple', 'type', 'isinstance', 'hasattr', 'getattr', 'setattr', 'zip',
      'enumerate', 'map', 'filter', 'sum', 'min', 'max', 'sorted', 'reversed', 'all', 'any',
      'open', 'iter', 'next', 'round', 'abs', 'pow', 'divmod', 'hex', 'oct', 'bin',
      'chr', 'ord', 'hash', 'id', 'eval', 'exec', 'compile', 'repr', 'format'
    ];

    // Special methods and decorators
    const decorators = ['@property', '@staticmethod', '@classmethod', '@dataclass'];
    const magicMethods = ['__init__', '__str__', '__repr__', '__len__', '__add__', '__sub__'];

    let highlighted = code;

    // Highlight multiline strings and docstrings first
    highlighted = highlighted.replace(
      /("""[\s\S]*?"""|'''[\s\S]*?''')/g,
      '<span class="text-[var(--cyber-green)] italic">$1</span>'
    );

    // Highlight single line strings (avoiding already highlighted multiline strings)
    highlighted = highlighted.replace(
      /(["'])((?:\\.|(?!\1)[^\\<])*?)\1/g,
      '<span class="text-[var(--cyber-green)]">$1$2$1</span>'
    );

    // Highlight decorators
    highlighted = highlighted.replace(
      /(@\w+)/g,
      '<span class="text-[var(--cyber-pink)] font-semibold">$1</span>'
    );

    // Highlight comments (but not inside strings)
    highlighted = highlighted.replace(
      /(#[^<]*$)/gm,
      '<span class="text-gray-400 italic">$1</span>'
    );

    // Highlight f-strings
    highlighted = highlighted.replace(
      /\b(f["'])((?:\\.|(?!\2)[^\\<])*?)\2/g,
      '<span class="text-[var(--cyber-green)]"><span class="text-[var(--cyber-pink)]">$1</span>$2<span class="text-[var(--cyber-green)]">$2</span></span>'
    );

    // Highlight numbers (integers, floats, hex, binary, octal)
    highlighted = highlighted.replace(
      /\b(0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+\.?\d*([eE][+-]?\d+)?)\b/g,
      '<span class="text-[var(--cyber-cyan)] font-medium">$1</span>'
    );

    // Highlight boolean literals and None
    literals.forEach(literal => {
      const regex = new RegExp(`\\b${literal}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-[var(--cyber-blue)] font-bold">${literal}</span>`);
    });

    // Highlight keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-[var(--cyber-purple)] font-semibold">${keyword}</span>`);
    });

    // Highlight built-in functions (with and without parentheses)
    builtins.forEach(builtin => {
      const regex = new RegExp(`\\b${builtin}\\b(?=\\s*\\()?`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-[var(--cyber-pink)]">${builtin}</span>`);
    });

    // Highlight magic methods
    magicMethods.forEach(method => {
      const regex = new RegExp(`\\b${method}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-[var(--cyber-pink)] font-semibold">${method}</span>`);
    });

    // Highlight class names (capitalized words)
    highlighted = highlighted.replace(
      /\b([A-Z][a-zA-Z0-9_]*)\b/g,
      '<span class="text-[var(--cyber-blue)]">$1</span>'
    );

    // Highlight operators and special symbols
    highlighted = highlighted.replace(
      /(\+|\-|\*{1,2}|\/{1,2}|%|==|!=|<=|>=|<|>|=|\+=|\-=|\*=|\/=|%=|\||\&|\^|~|<<|>>|\.\.\.|->)/g,
      '<span class="text-[var(--cyber-cyan)] font-medium">$1</span>'
    );

    // Highlight parentheses, brackets, and braces
    highlighted = highlighted.replace(
      /([(){}\[\]])/g,
      '<span class="text-white font-bold">$1</span>'
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