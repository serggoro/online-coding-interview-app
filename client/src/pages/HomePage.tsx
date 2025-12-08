import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateSession = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${window.location.origin}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.sessionId) {
        navigate(`/session/${data.sessionId}`);
      } else {
        setError('Failed to create session');
      }
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Online Coding Interview
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Real-time collaborative code editor for technical interviews
        </p>
        <button
          onClick={handleCreateSession}
          disabled={loading}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg text-white font-semibold text-lg transition"
        >
          {loading ? 'Creating Session...' : 'Create New Session'}
        </button>
        {error && (
          <p className="mt-4 text-red-400 text-sm">{error}</p>
        )}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="text-white font-semibold mb-2">Real-time Sync</h3>
            <p className="text-gray-400 text-sm">
              See code changes instantly as collaborators type
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-3xl mb-2">🔗</div>
            <h3 className="text-white font-semibold mb-2">Easy Sharing</h3>
            <p className="text-gray-400 text-sm">
              Share a link and collaborate with anyone
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-3xl mb-2">💻</div>
            <h3 className="text-white font-semibold mb-2">Multi-language</h3>
            <p className="text-gray-400 text-sm">
              Support for JavaScript, Python, Java, and more
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
