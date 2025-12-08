import io from 'socket.io-client';
import { createApp, sessions, generateSessionId } from '../index';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

interface CodeSyncData {
  code: string;
  language: string;
}

interface UserJoinedData {
  userCount: number;
}

interface CodeUpdateData {
  code: string;
}

interface LanguageUpdateData {
  language: string;
}

interface UserLeftData {
  userCount: number;
}

describe('Socket.IO Integration Tests', () => {
  let httpServer: HTTPServer;
  let socketIOServer: SocketIOServer;
  let serverUrl: string;
  const testPort = 3001;

  beforeAll(async () => {
    // Clear sessions before each test suite
    sessions.clear();
    
    // Create app instance
    const { httpServer: server, io } = createApp();
    httpServer = server;
    socketIOServer = io;
    serverUrl = `http://localhost:${testPort}`;

    // Start server
    await new Promise<void>((resolve) => {
      httpServer.listen(testPort, () => {
        resolve();
      });
    });
  });

  afterAll(async () => {
    // Clean up: close server
    sessions.clear();
    await new Promise<void>((resolve, reject) => {
      httpServer.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  afterEach(() => {
    // Clear sessions between tests
    sessions.clear();
  });

  describe('Session Management', () => {
    it('should allow client to join a session', async () => {
      // Create a session
      const sessionId = generateSessionId();
      sessions.set(sessionId, {
        id: sessionId,
        code: '// Initial code\n',
        language: 'javascript',
        createdAt: new Date(),
        users: new Set()
      });

      // Connect client
      const client = io(serverUrl);

      return new Promise<void>((resolve, reject) => {
        client.on('connect', () => {
          // Join session
          client.emit('join-session', sessionId);

          client.on('code-sync', (data: CodeSyncData) => {
            expect(data.code).toBe('// Initial code\n');
            expect(data.language).toBe('javascript');
            client.disconnect();
            resolve();
          });

          setTimeout(() => {
            client.disconnect();
            reject(new Error('Timeout: code-sync not received'));
          }, 5000);
        });

        client.on('connect_error', (error: Error) => {
          reject(error);
        });
      });
    });

    it('should notify user when joining a session', async () => {
      const sessionId = generateSessionId();
      sessions.set(sessionId, {
        id: sessionId,
        code: '// Code\n',
        language: 'javascript',
        createdAt: new Date(),
        users: new Set()
      });

      const client = io(serverUrl);

      return new Promise<void>((resolve, reject) => {
        client.on('connect', () => {
          client.emit('join-session', sessionId);

          client.on('user-joined', (data: UserJoinedData) => {
            expect(data.userCount).toBe(1);
            client.disconnect();
            resolve();
          });

          setTimeout(() => {
            client.disconnect();
            reject(new Error('Timeout: user-joined not received'));
          }, 5000);
        });

        client.on('connect_error', (error: Error) => {
          reject(error);
        });
      });
    });

    it('should return error when joining non-existent session', async () => {
      const client = io(serverUrl);

      return new Promise<void>((resolve, reject) => {
        client.on('connect', () => {
          client.emit('join-session', 'nonexistent');

          client.on('error', (error: string) => {
            expect(error).toBe('Session not found');
            client.disconnect();
            resolve();
          });

          setTimeout(() => {
            client.disconnect();
            reject(new Error('Timeout: error event not received'));
          }, 5000);
        });

        client.on('connect_error', (error: Error) => {
          reject(error);
        });
      });
    });
  });

  describe('Code Collaboration - Single Session', () => {
    it('should broadcast code changes from one client to another', async () => {
      const sessionId = generateSessionId();
      sessions.set(sessionId, {
        id: sessionId,
        code: '// Initial code\n',
        language: 'javascript',
        createdAt: new Date(),
        users: new Set()
      });

      const client1 = io(serverUrl);
      const client2 = io(serverUrl);
      const newCode = '// Updated code from client1\n';

      return new Promise<void>((resolve, reject) => {
        let client1Connected = false;
        let client2Connected = false;
        let client1Joined = false;
        let client2Joined = false;

        const startTest = () => {
          if (client1Connected && client2Connected && client1Joined && client2Joined) {
            // Emit code change from client1
            client1.emit('code-change', {
              sessionId,
              code: newCode
            });
          }
        };

        client1.on('connect', () => {
          client1Connected = true;
          client1.emit('join-session', sessionId);
          startTest();
        });

        client1.on('code-sync', () => {
          client1Joined = true;
          startTest();
        });

        client2.on('connect', () => {
          client2Connected = true;
          client2.emit('join-session', sessionId);
          startTest();
        });

        client2.on('code-sync', () => {
          client2Joined = true;
          startTest();
        });

        client2.on('code-update', (data: CodeUpdateData) => {
          try {
            expect(data.code).toBe(newCode);
            client1.disconnect();
            client2.disconnect();
            resolve();
          } catch (error) {
            client1.disconnect();
            client2.disconnect();
            reject(error);
          }
        });

        setTimeout(() => {
          client1.disconnect();
          client2.disconnect();
          reject(new Error('Timeout: code-update not received by client2'));
        }, 5000);

        client1.on('connect_error', (error: Error) => {
          reject(error);
        });

        client2.on('connect_error', (error: Error) => {
          reject(error);
        });
      });
    });

    it('should not send code update back to sender', async () => {
      const sessionId = generateSessionId();
      sessions.set(sessionId, {
        id: sessionId,
        code: '// Initial\n',
        language: 'javascript',
        createdAt: new Date(),
        users: new Set()
      });

      const client1 = io(serverUrl);
      const newCode = '// Updated\n';
      let codeUpdateReceivedOnSender = false;

      return new Promise<void>((resolve, reject) => {
        client1.on('connect', () => {
          client1.emit('join-session', sessionId);
        });

        client1.on('code-sync', () => {
          client1.emit('code-change', {
            sessionId,
            code: newCode
          });

          client1.on('code-update', () => {
            codeUpdateReceivedOnSender = true;
          });

          setTimeout(() => {
            try {
              expect(codeUpdateReceivedOnSender).toBe(false);
              client1.disconnect();
              resolve();
            } catch (error) {
              client1.disconnect();
              reject(error);
            }
          }, 1000);
        });

        client1.on('connect_error', (error: Error) => {
          reject(error);
        });
      });
    });
  });

  describe('Language Changes', () => {
    it('should broadcast language changes to all clients in session', async () => {
      const sessionId = generateSessionId();
      sessions.set(sessionId, {
        id: sessionId,
        code: '// Code\n',
        language: 'javascript',
        createdAt: new Date(),
        users: new Set()
      });

      const client1 = io(serverUrl);
      const client2 = io(serverUrl);
      const newLanguage = 'python';

      return new Promise<void>((resolve, reject) => {
        let client1Connected = false;
        let client2Connected = false;
        let client1Joined = false;

        const startTest = () => {
          if (client1Connected && client2Connected && client1Joined) {
            client1.emit('language-change', {
              sessionId,
              language: newLanguage
            });
          }
        };

        client1.on('connect', () => {
          client1Connected = true;
          client1.emit('join-session', sessionId);
          startTest();
        });

        client1.on('code-sync', () => {
          client1Joined = true;
          startTest();
        });

        client2.on('connect', () => {
          client2Connected = true;
          client2.emit('join-session', sessionId);
          startTest();
        });

        client1.on('language-update', (data: LanguageUpdateData) => {
          try {
            expect(data.language).toBe(newLanguage);
            client1.disconnect();
            client2.disconnect();
            resolve();
          } catch (error) {
            client1.disconnect();
            client2.disconnect();
            reject(error);
          }
        });

        client2.on('language-update', (data: LanguageUpdateData) => {
          try {
            expect(data.language).toBe(newLanguage);
          } catch (error) {
            client1.disconnect();
            client2.disconnect();
            reject(error);
          }
        });

        setTimeout(() => {
          client1.disconnect();
          client2.disconnect();
          reject(new Error('Timeout: language-update not received'));
        }, 5000);

        client1.on('connect_error', (error: Error) => {
          reject(error);
        });

        client2.on('connect_error', (error: Error) => {
          reject(error);
        });
      });
    });
  });

  describe('User Presence', () => {
    it('should track user count when multiple users join', async () => {
      const sessionId = generateSessionId();
      sessions.set(sessionId, {
        id: sessionId,
        code: '// Code\n',
        language: 'javascript',
        createdAt: new Date(),
        users: new Set()
      });

      const client1 = io(serverUrl);
      const client2 = io(serverUrl);
      const client3 = io(serverUrl);

      return new Promise<void>((resolve, reject) => {
        const userCounts: number[] = [];

        const handleUserJoined = (data: { userCount: number }) => {
          userCounts.push(data.userCount);
        };

        client1.on('connect', () => {
          client1.emit('join-session', sessionId);
        });

        client1.on('user-joined', handleUserJoined);

        client2.on('connect', () => {
          client2.emit('join-session', sessionId);
        });

        client2.on('user-joined', handleUserJoined);

        client3.on('connect', () => {
          client3.emit('join-session', sessionId);
        });

        client3.on('user-joined', handleUserJoined);

        setTimeout(() => {
          try {
            // Should have received user-joined events: [1, 2, 3]
            expect(userCounts.length).toBeGreaterThanOrEqual(2);
            expect(userCounts).toContain(2);
            expect(userCounts).toContain(3);
            client1.disconnect();
            client2.disconnect();
            client3.disconnect();
            resolve();
          } catch (error) {
            client1.disconnect();
            client2.disconnect();
            client3.disconnect();
            reject(error);
          }
        }, 2000);

        client1.on('connect_error', (error: Error) => {
          reject(error);
        });

        client2.on('connect_error', (error: Error) => {
          reject(error);
        });

        client3.on('connect_error', (error: Error) => {
          reject(error);
        });
      });
    });

    it('should notify remaining users when a client disconnects', async () => {
      const sessionId = generateSessionId();
      sessions.set(sessionId, {
        id: sessionId,
        code: '// Code\n',
        language: 'javascript',
        createdAt: new Date(),
        users: new Set()
      });

      const client1 = io(serverUrl);
      const client2 = io(serverUrl);

      return new Promise<void>((resolve, reject) => {
        let bothConnected = false;

        client1.on('connect', () => {
          client1.emit('join-session', sessionId);
        });

        client1.on('user-joined', () => {
          if (bothConnected) {
            // Both clients connected, now test disconnect
            client2.disconnect();
          }
        });

        client2.on('connect', () => {
          client2.emit('join-session', sessionId);
          bothConnected = true;
        });

        client1.on('user-left', (data: UserLeftData) => {
          try {
            expect(data.userCount).toBe(1);
            client1.disconnect();
            resolve();
          } catch (error) {
            client1.disconnect();
            reject(error);
          }
        });

        setTimeout(() => {
          client1.disconnect();
          client2.disconnect();
          reject(new Error('Timeout: user-left not received'));
        }, 5000);

        client1.on('connect_error', (error: Error) => {
          reject(error);
        });

        client2.on('connect_error', (error: Error) => {
          reject(error);
        });
      });
    });
  });

  describe('Code Execution', () => {
    it('should broadcast code execution request to all clients', async () => {
      const sessionId = generateSessionId();
      sessions.set(sessionId, {
        id: sessionId,
        code: '// Code\n',
        language: 'javascript',
        createdAt: new Date(),
        users: new Set()
      });

      const client1 = io(serverUrl);
      const client2 = io(serverUrl);

      return new Promise<void>((resolve, reject) => {
        let client1Joined = false;
        let client2Joined = false;

        const startTest = () => {
          if (client1Joined && client2Joined) {
            client1.emit('run-code', { sessionId });
          }
        };

        client1.on('connect', () => {
          client1.emit('join-session', sessionId);
        });

        client1.on('code-sync', () => {
          client1Joined = true;
          startTest();
        });

        client2.on('connect', () => {
          client2.emit('join-session', sessionId);
        });

        client2.on('code-sync', () => {
          client2Joined = true;
          startTest();
        });

        let executionCount = 0;

        client1.on('code-execution', () => {
          executionCount++;
        });

        client2.on('code-execution', () => {
          executionCount++;
        });

        setTimeout(() => {
          try {
            expect(executionCount).toBe(2);
            client1.disconnect();
            client2.disconnect();
            resolve();
          } catch (error) {
            client1.disconnect();
            client2.disconnect();
            reject(error);
          }
        }, 2000);

        client1.on('connect_error', (error: Error) => {
          reject(error);
        });

        client2.on('connect_error', (error: Error) => {
          reject(error);
        });
      });
    });
  });

  describe('Session State Persistence', () => {
    it('should persist code changes in session state', async () => {
      const sessionId = generateSessionId();
      sessions.set(sessionId, {
        id: sessionId,
        code: '// Initial\n',
        language: 'javascript',
        createdAt: new Date(),
        users: new Set()
      });

      const client1 = io(serverUrl);
      const newCode = '// Modified code\n';

      return new Promise<void>((resolve, reject) => {
        client1.on('connect', () => {
          client1.emit('join-session', sessionId);
        });

        client1.on('code-sync', () => {
          client1.emit('code-change', {
            sessionId,
            code: newCode
          });

          setTimeout(() => {
            try {
              const session = sessions.get(sessionId);
              expect(session?.code).toBe(newCode);
              client1.disconnect();
              resolve();
            } catch (error) {
              client1.disconnect();
              reject(error);
            }
          }, 500);
        });

        client1.on('connect_error', (error: Error) => {
          reject(error);
        });
      });
    });

    it('should persist language changes in session state', async () => {
      const sessionId = generateSessionId();
      sessions.set(sessionId, {
        id: sessionId,
        code: '// Code\n',
        language: 'javascript',
        createdAt: new Date(),
        users: new Set()
      });

      const client1 = io(serverUrl);
      const newLanguage = 'python';

      return new Promise<void>((resolve, reject) => {
        client1.on('connect', () => {
          client1.emit('join-session', sessionId);
        });

        client1.on('code-sync', () => {
          client1.emit('language-change', {
            sessionId,
            language: newLanguage
          });

          setTimeout(() => {
            try {
              const session = sessions.get(sessionId);
              expect(session?.language).toBe(newLanguage);
              client1.disconnect();
              resolve();
            } catch (error) {
              client1.disconnect();
              reject(error);
            }
          }, 500);
        });

        client1.on('connect_error', (error: Error) => {
          reject(error);
        });
      });
    });
  });

  describe('Multiple Concurrent Sessions', () => {
    it('should isolate code changes between different sessions', async () => {
      const sessionId1 = generateSessionId();
      const sessionId2 = generateSessionId();

      sessions.set(sessionId1, {
        id: sessionId1,
        code: '// Session 1\n',
        language: 'javascript',
        createdAt: new Date(),
        users: new Set()
      });

      sessions.set(sessionId2, {
        id: sessionId2,
        code: '// Session 2\n',
        language: 'javascript',
        createdAt: new Date(),
        users: new Set()
      });

      const client1 = io(serverUrl);
      const client2 = io(serverUrl);

      return new Promise<void>((resolve, reject) => {
        let client1Joined = false;
        let client2Joined = false;
        let client2UpdateCount = 0;

        client1.on('connect', () => {
          client1.emit('join-session', sessionId1);
        });

        client1.on('code-sync', () => {
          client1Joined = true;
          if (client2Joined) {
            client1.emit('code-change', {
              sessionId: sessionId1,
              code: '// Updated session 1\n'
            });
          }
        });

        client2.on('connect', () => {
          client2.emit('join-session', sessionId2);
        });

        client2.on('code-sync', () => {
          client2Joined = true;
        });

        client2.on('code-update', () => {
          client2UpdateCount++;
        });

        setTimeout(() => {
          try {
            // Client2 should not receive updates from client1's session
            expect(client2UpdateCount).toBe(0);
            client1.disconnect();
            client2.disconnect();
            resolve();
          } catch (error) {
            client1.disconnect();
            client2.disconnect();
            reject(error);
          }
        }, 2000);

        client1.on('connect_error', (error: Error) => {
          reject(error);
        });

        client2.on('connect_error', (error: Error) => {
          reject(error);
        });
      });
    });
  });
});
