import { useCallback } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  onRunCode: () => void;
}

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' }
];

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onChange,
  onLanguageChange,
  onRunCode
}) => {
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  }, [onChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }} className="bg-gray-900 text-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-700" style={{ flexShrink: 0 }}>
        <h2 className="text-lg font-semibold">Code Editor</h2>
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
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
      <div style={{ flex: 1, overflow: 'hidden', width: '100%', minHeight: 0 }}>
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="javascript"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'Fira Code, Consolas, monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true
          }}
        />
      </div>
    </div>
  );
};
