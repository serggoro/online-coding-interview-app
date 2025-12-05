import React from 'react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  onRunCode: () => void;
}

const LANGUAGES = ['javascript', 'python', 'typescript', 'java', 'cpp', 'csharp'];

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onChange,
  onLanguageChange,
  onRunCode
}) => {
  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Code Editor</h2>
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={onRunCode}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition"
          >
            Run Code
          </button>
        </div>
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 p-4 bg-gray-800 text-gray-100 font-mono text-sm resize-none focus:outline-none"
        spellCheck="false"
      />
    </div>
  );
};
