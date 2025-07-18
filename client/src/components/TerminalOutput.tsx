import { useEffect, useRef } from 'react';
import { X, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TerminalOutputProps {
  output: string;
  error: string;
  isVisible: boolean;
  onClose: () => void;
}

function TerminalOutput({ output, error, isVisible, onClose }: TerminalOutputProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output, error]);

  if (!isVisible) return null;

  return (
    <div className="h-48 border-t border-[var(--cyber-cyan)]/30">
      <div className="bg-[var(--cyber-gray)] px-4 py-2 border-b border-[var(--cyber-cyan)]/30">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[var(--cyber-green)]" />
          <span className="text-sm font-mono text-[var(--cyber-green)]">Terminal</span>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="ml-auto text-gray-400 hover:text-white h-auto p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div
        ref={terminalRef}
        className="terminal-output h-full p-4 overflow-y-auto font-mono text-sm"
      >
        <div className="terminal-text">
          <div className="text-[var(--cyber-cyan)]">$ python main.py</div>

          {output && (
            <div className="mt-2 whitespace-pre-wrap text-white">
              {output}
            </div>
          )}

          {error && (
            <div className="mt-2 whitespace-pre-wrap text-red-400">
              <div className="text-red-300 font-semibold">Error:</div>
              {error}
            </div>
          )}

          {output && !error && (
            <div className="mt-2 text-[var(--cyber-cyan)]">
              ✓ Code executed successfully!
            </div>
          )}

          <div className="mt-4 text-gray-500">$</div>
        </div>
      </div>
    </div>
  );
}

export { TerminalOutput };