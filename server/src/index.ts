import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

export interface CodeSession {
  id: string;
  code: string;
  language: string;
  createdAt: Date;
  users: Set<string>;
}

export const sessions = new Map<string, CodeSession>();

// Generate a simple unique ID for room names
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function createApp() {
  const app = express();
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  app.use(cors());
  app.use(express.json());

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({ message: 'Online Coding Interview API', status: 'running' });
  });

  // REST API endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/sessions', (req, res) => {
    const sessionId = generateSessionId();
    const session: CodeSession = {
      id: sessionId,
      code: '// Write your code here\n',
      language: 'javascript',
      createdAt: new Date(),
      users: new Set()
    };
    sessions.set(sessionId, session);
    res.json({ sessionId, shareLink: `http://localhost:5173/session/${sessionId}` });
  });

  app.get('/api/sessions/:sessionId', (req, res) => {
    const session = sessions.get(req.params.sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json({
      id: session.id,
      code: session.code,
      language: session.language,
      userCount: session.users.size
    });
  });

  // Socket.IO events for real-time collaboration
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a session
    socket.on('join-session', (sessionId: string) => {
      const session = sessions.get(sessionId);
      if (!session) {
        socket.emit('error', 'Session not found');
        return;
      }

      socket.join(sessionId);
      session.users.add(socket.id);

      // Send current code to the joining user
      socket.emit('code-sync', {
        code: session.code,
        language: session.language
      });

      // Notify others that a new user joined
      io.to(sessionId).emit('user-joined', {
        userCount: session.users.size
      });

      console.log(`User ${socket.id} joined session ${sessionId}. Users in room: ${session.users.size}`);
    });

    // Handle code changes
    socket.on('code-change', (data: { sessionId: string; code: string }) => {
      const session = sessions.get(data.sessionId);
      if (!session) return;

      session.code = data.code;

      // Broadcast to all users in the session except the sender
      socket.to(data.sessionId).emit('code-update', {
        code: data.code
      });
    });

    // Handle language changes
    socket.on('language-change', (data: { sessionId: string; language: string }) => {
      const session = sessions.get(data.sessionId);
      if (!session) return;

      session.language = data.language;

      // Broadcast to all users in the session
      io.to(data.sessionId).emit('language-update', {
        language: data.language
      });
    });

    // Handle run code (placeholder)
    socket.on('run-code', (data: { sessionId: string }) => {
      console.log(`Run code requested for session ${data.sessionId}`);
      io.to(data.sessionId).emit('code-execution', {
        message: 'Code execution not yet implemented'
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // Remove user from all sessions
      sessions.forEach((session, sessionId) => {
        if (session.users.has(socket.id)) {
          session.users.delete(socket.id);
          io.to(sessionId).emit('user-left', {
            userCount: session.users.size
          });
          // Clean up empty sessions after 1 hour
          if (session.users.size === 0) {
            setTimeout(() => {
              if (session.users.size === 0) {
                sessions.delete(sessionId);
                console.log(`Session ${sessionId} deleted (empty)`);
              }
            }, 60 * 60 * 1000);
          }
        }
      });
    });
  });

  return { app, httpServer, io };
}

export function startServer(port: number = parseInt(process.env.PORT || '3000')) {
  const { app, httpServer, io } = createApp();
  
  httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  return { app, httpServer, io };
}
