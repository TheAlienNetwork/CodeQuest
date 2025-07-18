import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export interface CodeExecutionResult {
  output: string;
  error: string;
  exitCode: number;
  executionTime: number;
}

export class CodeExecutionService {
  private tempDir = path.join(process.cwd(), 'temp');

  constructor() {
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async executeCode(code: string, userId: number): Promise<CodeExecutionResult> {
    const startTime = Date.now();
    const fileName = `user_${userId}_${Date.now()}.py`;
    const filePath = path.join(this.tempDir, fileName);

    try {
      // Write code to temporary file
      fs.writeFileSync(filePath, code);

      // Execute Python code with timeout and resource limits
      const { stdout, stderr } = await execAsync(`python "${filePath}"`, {
        timeout: 10000, // 10 second timeout
        maxBuffer: 1024 * 1024, // 1MB buffer
        cwd: this.tempDir,
        env: {
          ...process.env,
          PYTHONPATH: '',
          PATH: process.env.PATH,
        }
      });

      const executionTime = Date.now() - startTime;

      return {
        output: stdout,
        error: stderr,
        exitCode: 0,
        executionTime
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        output: error.stdout || '',
        error: error.stderr || error.message || 'Unknown execution error',
        exitCode: error.code || 1,
        executionTime
      };
    } finally {
      // Clean up temporary file
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error('Failed to clean up temp file:', cleanupError);
      }
    }
  }

  async validateCode(code: string, expectedOutput: string): Promise<boolean> {
    const result = await this.executeCode(code, 0);
    
    if (result.exitCode !== 0) {
      return false;
    }

    const actualOutput = result.output.trim();
    const expected = expectedOutput.trim();
    
    return actualOutput === expected;
  }

  private sanitizeCode(code: string): string {
    // Remove potentially dangerous imports and statements
    const dangerousPatterns = [
      /import\s+os/gi,
      /import\s+sys/gi,
      /import\s+subprocess/gi,
      /import\s+shutil/gi,
      /from\s+os\s+import/gi,
      /from\s+sys\s+import/gi,
      /from\s+subprocess\s+import/gi,
      /from\s+shutil\s+import/gi,
      /exec\s*\(/gi,
      /eval\s*\(/gi,
      /open\s*\(/gi,
      /__import__\s*\(/gi,
    ];

    let sanitizedCode = code;
    
    for (const pattern of dangerousPatterns) {
      sanitizedCode = sanitizedCode.replace(pattern, '# BLOCKED: Potentially dangerous operation');
    }

    return sanitizedCode;
  }
}

export const codeExecutionService = new CodeExecutionService();
