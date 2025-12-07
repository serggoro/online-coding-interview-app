import React from 'react';

export interface OutputPanelProps {
  output: string;
  error?: string;
  executionTime?: number;
  isRunning: boolean;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  output,
  error,
  executionTime,
  isRunning,
}) => {
  return (
    <div className="flex flex-col h-full bg-gray-900 border-t border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white">Output</h3>
        {executionTime !== undefined && !isRunning && (
          <span className="text-xs text-gray-400">
            Executed in {executionTime.toFixed(2)}ms
          </span>
        )}
        {isRunning && (
          <span className="text-xs text-blue-400 animate-pulse">
            Running...
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4">
        {isRunning ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm">Executing code...</p>
            </div>
          </div>
        ) : (
          <>
            {error ? (
              <div className="space-y-2">
                <div className="bg-red-900/20 border border-red-700 rounded p-3">
                  <div className="flex items-start">
                    <span className="text-red-500 font-bold mr-2">✗</span>
                    <div className="flex-1">
                      <p className="text-red-400 font-semibold text-sm mb-1">Error:</p>
                      <pre className="text-red-300 text-xs font-mono whitespace-pre-wrap break-words">
                        {error}
                      </pre>
                    </div>
                  </div>
                </div>
                {output && output !== '(no output)' && (
                  <div className="bg-gray-800 border border-gray-700 rounded p-3">
                    <p className="text-gray-400 font-semibold text-sm mb-1">Output before error:</p>
                    <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap break-words">
                      {output}
                    </pre>
                  </div>
                )}
              </div>
            ) : output ? (
              <div className="bg-gray-800 border border-gray-700 rounded p-3">
                <div className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap break-words flex-1">
                    {output}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="text-sm mb-1">No output yet</p>
                  <p className="text-xs">Click "Run Code" to execute</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
