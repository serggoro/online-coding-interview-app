import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import { CodeEditor } from '../components/CodeEditor';
import { OutputPanel } from '../components/OutputPanel';
import { executeCode, type ExecutionResult } from '../utils/codeExecution';

interface CodeSession {
  id: string;
  code: string;
  language: string;
  userCount: number;
}

export const SessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [_session, setSession] = useState<CodeSession | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const apiUrl = `${window.location.hostname === 'localhost' ? 'http://localhost:3000' : `http://${window.location.hostname}:3000`}`;
        console.log('Using API URL:', apiUrl);
        const response = await fetch(`${apiUrl}/api/sessions/${sessionId}`);
        if (!response.ok) {
          setError('Session not found');
          setLoading(false);
          return;
        }
        const data: CodeSession = await response.json();
        setSession(data);
        setCode(data.code);
        setLanguage(data.language);
        console.log('Fetched session from REST API:', { code: data.code, language: data.language, userCount: data.userCount });

        // Disconnect old socket if it exists
        if (socketRef.current) {
          console.log('Disconnecting old socket');
          socketRef.current.disconnect();
        }

        // Connect to Socket.IO
        const socketUrl = `${window.location.hostname === 'localhost' ? 'http://localhost:3000' : `http://${window.location.hostname}:3000`}`;
        console.log('Connecting to socket:', socketUrl);
        const newSocket = io(socketUrl, {
          reconnection: true,
          autoConnect: true
        });

        console.log('Socket.io client created');

        // Set up event listeners
        const handleCodeSync = (data: { code: string; language: string }) => {
          console.log('Socket: code-sync received:', { code: data.code.substring(0, 50), language: data.language });
          setCode(data.code);
          setLanguage(data.language);
        };

        const handleCodeUpdate = (data: { code: string }) => {
          console.log('Socket: code-update received');
          setCode(data.code);
        };

        const handleLanguageUpdate = (data: { language: string }) => {
          console.log('Socket: language-update received:', data.language);
          setLanguage(data.language);
        };

        const handleUserJoined = (data: { userCount: number }) => {
          console.log('Socket: user-joined event received, userCount:', data.userCount);
          setUserCount(data.userCount);
        };

        const handleUserLeft = (data: { userCount: number }) => {
          console.log('Socket: user-left event received, userCount:', data.userCount);
          setUserCount(data.userCount);
        };

        const handleError = (message: string) => {
          console.log('Socket: error event received:', message);
          setError(message);
        };

        const handleConnect = () => {
          console.log('Socket connected, socket ID:', newSocket.id);
          console.log('Emitting join-session for sessionId:', sessionId);
          newSocket.emit('join-session', sessionId);
        };

        newSocket.once('code-sync', handleCodeSync);
        newSocket.on('code-update', handleCodeUpdate);
        newSocket.on('language-update', handleLanguageUpdate);
        newSocket.on('user-joined', handleUserJoined);
        newSocket.on('user-left', handleUserLeft);
        newSocket.on('error', handleError);
        newSocket.once('connect', handleConnect);

        socketRef.current = newSocket;
        setLoading(false);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load session');
        setLoading(false);
      }
    };

    fetchSession();

    return () => {
      console.log('useEffect cleanup: disconnecting socket');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [sessionId]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (socketRef.current) {
      socketRef.current.emit('code-change', { sessionId, code: newCode });
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    // Get language-specific default templates
    const defaultTemplates: Record<string, string> = {
      javascript: '// Write your JavaScript code here\n',
      python: '# Write your Python code here\n',
    };

    const currentDefault = defaultTemplates[language] || '// Write your code here\n';
    const newDefault = defaultTemplates[newLanguage] || '// Write your code here\n';

    // If current code is empty or matches the default template, update to new template
    const trimmedCode = code.trim();
    const shouldUpdateCode = 
      !trimmedCode || 
      trimmedCode === currentDefault.trim() ||
      trimmedCode === '// Write your code here' ||
      trimmedCode === '# Write your code here';

    setLanguage(newLanguage);

    if (shouldUpdateCode) {
      const newCode = newDefault;
      setCode(newCode);
      if (socketRef.current) {
        socketRef.current.emit('language-change', { sessionId, language: newLanguage });
        socketRef.current.emit('code-change', { sessionId, code: newCode });
      }
    } else {
      if (socketRef.current) {
        socketRef.current.emit('language-change', { sessionId, language: newLanguage });
      }
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setExecutionResult(null);

    try {
      const result = await executeCode(code, language);
      setExecutionResult(result);
    } catch (err) {
      setExecutionResult({
        output: '',
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        executionTime: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-center">
          <p className="text-2xl mb-4">Error</p>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }} className="bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 p-4" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Session {sessionId}</h1>
            <p className="text-gray-400 text-sm mt-1">
              Active Users: <span className="text-green-400 font-semibold">{userCount}</span>
            </p>
          </div>
          <button
            onClick={async () => {
              const shareLink = `${window.location.origin}/session/${sessionId}`;
              console.log('Copy button clicked, link:', shareLink);
              try {
                await navigator.clipboard.writeText(shareLink);
                console.log('Successfully copied to clipboard');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch (err) {
                console.error('Failed to copy to clipboard:', err);
                // Fallback: use old execCommand method
                try {
                  const textarea = document.createElement('textarea');
                  textarea.value = shareLink;
                  document.body.appendChild(textarea);
                  textarea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textarea);
                  console.log('Copied using fallback method');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch (fallbackErr) {
                  console.error('Fallback copy also failed:', fallbackErr);
                }
              }
            }}
            className={`px-4 py-2 rounded text-white font-medium transition ${
              copied 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {copied ? '✓ Copied!' : 'Copy Share Link'}
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <CodeEditor
            code={code}
            language={language}
            onChange={handleCodeChange}
            onLanguageChange={handleLanguageChange}
            onRunCode={handleRunCode}
            isRunning={isRunning}
          />
        </div>
        <div style={{ height: '250px', flexShrink: 0 }}>
          <OutputPanel
            output={executionResult?.output || ''}
            error={executionResult?.error}
            executionTime={executionResult?.executionTime}
            isRunning={isRunning}
          />
        </div>
      </div>
    </div>
  );
};
