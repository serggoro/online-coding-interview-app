import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import { CodeEditor } from '../components/CodeEditor';

interface CodeSession {
  id: string;
  code: string;
  language: string;
  userCount: number;
}

export const SessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [_session, setSession] = useState<CodeSession | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [userCount, setUserCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/sessions/${sessionId}`);
        if (!response.ok) {
          setError('Session not found');
          setLoading(false);
          return;
        }
        const data: CodeSession = await response.json();
        setSession(data);
        setCode(data.code);
        setLanguage(data.language);
        setUserCount(data.userCount);

        // Connect to Socket.IO
        const newSocket = io('http://localhost:3000', {
          reconnection: true
        });

        newSocket.on('connect', () => {
          console.log('Connected to server');
          newSocket.emit('join-session', sessionId);
        });

        newSocket.on('code-sync', (data: { code: string; language: string }) => {
          setCode(data.code);
          setLanguage(data.language);
        });

        newSocket.on('code-update', (data: { code: string }) => {
          setCode(data.code);
        });

        newSocket.on('language-update', (data: { language: string }) => {
          setLanguage(data.language);
        });

        newSocket.on('user-joined', (data: { userCount: number }) => {
          setUserCount(data.userCount);
        });

        newSocket.on('user-left', (data: { userCount: number }) => {
          setUserCount(data.userCount);
        });

        newSocket.on('error', (message: string) => {
          setError(message);
        });

        setSocket(newSocket);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load session');
        setLoading(false);
      }
    };

    fetchSession();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [sessionId]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (socket) {
      socket.emit('code-change', { sessionId, code: newCode });
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (socket) {
      socket.emit('language-change', { sessionId, language: newLanguage });
    }
  };

  const handleRunCode = () => {
    console.log('Running code:', code);
    if (socket) {
      socket.emit('run-code', { sessionId });
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
    <div className="h-screen flex flex-col bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Session {sessionId}</h1>
            <p className="text-gray-400 text-sm mt-1">
              Active Users: <span className="text-green-400 font-semibold">{userCount}</span>
            </p>
          </div>
          <button
            onClick={() => {
              const shareLink = `${window.location.origin}/session/${sessionId}`;
              navigator.clipboard.writeText(shareLink);
              alert('Share link copied to clipboard!');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
          >
            Copy Share Link
          </button>
        </div>
      </div>
      <div className="flex-1">
        <CodeEditor
          code={code}
          language={language}
          onChange={handleCodeChange}
          onLanguageChange={handleLanguageChange}
          onRunCode={handleRunCode}
        />
      </div>
    </div>
  );
};
