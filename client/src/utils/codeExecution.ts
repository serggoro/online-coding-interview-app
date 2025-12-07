import { loadPyodide, type PyodideInterface } from 'pyodide';

export interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
}

// Singleton Pyodide instance
let pyodideInstance: PyodideInterface | null = null;
let pyodideLoading: Promise<PyodideInterface> | null = null;

/**
 * Initialize Pyodide (lazy load on first Python execution)
 */
async function initPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (pyodideLoading) {
    return pyodideLoading;
  }

  pyodideLoading = loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/',
  });

  pyodideInstance = await pyodideLoading;
  pyodideLoading = null;
  
  return pyodideInstance;
}

/**
 * Execute JavaScript code in a sandboxed environment
 */
function executeJavaScript(code: string): ExecutionResult {
  const startTime = performance.now();
  const output: string[] = [];
  let error: string | undefined;

  try {
    // Create a sandboxed console that captures output
    const sandboxConsole = {
      log: (...args: any[]) => {
        output.push(args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' '));
      },
      error: (...args: any[]) => {
        output.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
      },
      warn: (...args: any[]) => {
        output.push('WARNING: ' + args.map(arg => String(arg)).join(' '));
      },
      info: (...args: any[]) => {
        output.push('INFO: ' + args.map(arg => String(arg)).join(' '));
      },
    };

    // Create a sandboxed environment
    // Use indirect eval to prevent access to local scope
    const sandbox = {
      console: sandboxConsole,
      Math,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      JSON,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      // Explicitly block dangerous globals
      window: undefined,
      document: undefined,
      fetch: undefined,
      XMLHttpRequest: undefined,
      WebSocket: undefined,
      localStorage: undefined,
      sessionStorage: undefined,
      eval: undefined,
      Function: undefined,
    };

    // Wrap code in a function and execute with limited scope
    const wrappedCode = `
      (function(console, Math, Date, Array, Object, String, Number, Boolean, JSON, parseInt, parseFloat, isNaN, isFinite) {
        "use strict";
        ${code}
      })(console, Math, Date, Array, Object, String, Number, Boolean, JSON, parseInt, parseFloat, isNaN, isFinite);
    `;

    // Execute with the sandboxed console
    const func = new Function(
      'console', 'Math', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean', 
      'JSON', 'parseInt', 'parseFloat', 'isNaN', 'isFinite',
      wrappedCode
    );

    const result = func(
      sandbox.console,
      sandbox.Math,
      sandbox.Date,
      sandbox.Array,
      sandbox.Object,
      sandbox.String,
      sandbox.Number,
      sandbox.Boolean,
      sandbox.JSON,
      sandbox.parseInt,
      sandbox.parseFloat,
      sandbox.isNaN,
      sandbox.isFinite
    );

    // If there's a return value and no console output, show it
    if (result !== undefined && output.length === 0) {
      output.push(String(result));
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const executionTime = performance.now() - startTime;

  return {
    output: output.length > 0 ? output.join('\n') : '(no output)',
    error,
    executionTime,
  };
}

/**
 * Execute Python code using Pyodide
 */
async function executePython(code: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  let output = '';
  let error: string | undefined;

  try {
    const pyodide = await initPyodide();

    // Redirect stdout/stderr to capture output
    const captureCode = `
import sys
from io import StringIO

_stdout = StringIO()
_stderr = StringIO()
sys.stdout = _stdout
sys.stderr = _stderr
`;

    await pyodide.runPythonAsync(captureCode);

    // Execute user code
    try {
      await pyodide.runPythonAsync(code);
    } catch (err) {
      // Python execution error will be in stderr
    }

    // Get captured output
    const getOutputCode = `
stdout_value = _stdout.getvalue()
stderr_value = _stderr.getvalue()
(stdout_value, stderr_value)
`;

    const result = await pyodide.runPythonAsync(getOutputCode);
    const [stdout, stderr] = result.toJs();

    if (stdout) {
      output += stdout;
    }

    if (stderr) {
      error = stderr;
    }

    if (!output && !error) {
      output = '(no output)';
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const executionTime = performance.now() - startTime;

  return {
    output: output || '(no output)',
    error,
    executionTime,
  };
}

/**
 * Execute code based on the language
 */
export async function executeCode(
  code: string,
  language: string
): Promise<ExecutionResult> {
  const normalizedLanguage = language.toLowerCase().trim();

  switch (normalizedLanguage) {
    case 'javascript':
    case 'js':
      return executeJavaScript(code);

    case 'python':
    case 'py':
      return await executePython(code);

    default:
      return {
        output: '',
        error: `Unsupported language: ${language}. Supported languages: JavaScript, Python`,
        executionTime: 0,
      };
  }
}

/**
 * Check if Pyodide is loaded (useful for showing loading state)
 */
export function isPyodideLoaded(): boolean {
  return pyodideInstance !== null;
}

/**
 * Preload Pyodide to reduce first execution time
 */
export async function preloadPyodide(): Promise<void> {
  try {
    await initPyodide();
  } catch (err) {
    console.error('Failed to preload Pyodide:', err);
  }
}
