# Online Coding Interview App

A real-time collaborative coding interview platform that enables interviewers and candidates to write, execute, and discuss code together in a shared editor.

## Overview

The Online Coding Interview App is a web-based tool designed to facilitate remote technical interviews. It features:

- **Real-time collaborative code editing** powered by Socket.IO
- **Live code syntax highlighting** with Monaco Editor
- **Shared session management** for interview coordination
- **Integrated testing infrastructure** for code validation
- **Clean, intuitive UI** built with React and Tailwind CSS
- **Multi-language support** for JavaScript and Python with syntax highlighting

## Features

### Code Editor
- **Monaco Editor** for professional-grade code editing
- **Syntax highlighting** for JavaScript and Python
- **Language switching** via dropdown selector (preserves code and collaboration)
- **Real-time synchronization** across all connected users
- **Auto-layout** and responsive editor sizing

### Collaboration
- **Real-time code sync** - Changes propagate instantly to all session participants
- **Session management** - Create sessions and share links with others
- **User presence** - See active user count in current session
- **Language awareness** - All users see the same language mode

### Code Execution
- **Browser-only execution** - No code runs on the server, everything happens safely in your browser
- **JavaScript execution** - Sandboxed environment with limited scope (no DOM, network, or file system access)
- **Python execution** - Runs via Pyodide WebAssembly runtime (~2-3s first load, <100ms cached)
- **Live output** - See stdout, errors, and execution time in the output panel
- **Independent execution** - Each user runs code locally; results are not shared

## Supported Languages

Currently supported languages with full syntax highlighting:
- **JavaScript** - Client-side and server-side JS
- **Python** - Python 3 syntax highlighting

Future languages can be added via the `SUPPORTED_LANGUAGES` array in `CodeEditor.tsx`.

## Tech Stack

### Backend
- **Runtime:** Node.js with ES Modules
- **Framework:** Express.js for HTTP routing
- **Real-time Communication:** Socket.IO
- **Language:** TypeScript
- **Testing:** Jest with ts-jest
- **Additional:** CORS support, LRU caching

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Editor:** Monaco Editor (VS Code's editor component)
- **Styling:** Tailwind CSS with PostCSS
- **Routing:** React Router v6
- **Real-time Client:** Socket.IO Client
- **Testing:** Vitest with React Testing Library

## Project Structure

```
online-coding-interview-app/
├── package.json                     # Root package.json for concurrent dev scripts
├── package-lock.json
├── node_modules/
│
├── server/                          # Backend application
│   ├── src/
│   │   ├── index.ts                # Entry point, Express + Socket.IO setup
│   │   ├── utils.ts                # Utility functions
│   │   └── __tests__/
│   │       ├── utils.test.ts       # Unit tests for utilities
│   │       └── integration.test.ts # Integration tests
│   ├── dist/                       # Compiled JavaScript (generated)
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── client/                          # Frontend application
│   ├── src/
│   │   ├── main.tsx                # React entry point
│   │   ├── App.tsx                 # Root App component
│   │   ├── index.css               # Global styles
│   │   ├── components/
│   │   │   ├── CodeEditor.tsx      # Real-time collaborative editor
│   │   │   └── OutputPanel.tsx     # Code execution results display
│   │   ├── pages/
│   │   │   ├── HomePage.tsx        # Landing page
│   │   │   └── SessionPage.tsx     # Interview session page
│   │   ├── utils/
│   │   │   └── codeExecution.ts    # Browser-based code execution engine
│   │   └── test/
│   │       ├── setup.ts            # Test configuration
│   │       ├── HomePage.test.tsx   # HomePage component tests
│   │       └── CodeEditor.test.tsx # CodeEditor component tests
│   ├── dist/                       # Production build (generated)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── postcss.config.js
│
└── README.md                        # This file
```

## Setup

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher (comes with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd online-coding-interview-app
   ```

2. **Install root dependencies (for concurrently):**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

## Running the Application

### Quick Start (Both Backend and Frontend)

From the **project root**, run:

```bash
npm run dev
```

This starts both the backend (port `3000`) and frontend (port `5173`) concurrently with auto-reload enabled.

### Backend (Development Mode)

From the `server/` directory:

```bash
npm run dev
```

This starts the backend server with Node's `--watch` flag, enabling auto-reload on file changes. The server typically runs on `http://localhost:3000`.

**Other backend scripts:**
- `npm run start` – Run production build
- `npm run build` – Compile TypeScript to JavaScript
- `npm run test` – Run unit tests
- `npm run test:watch` – Run tests in watch mode
- `npm run test:all` – Run all tests (unit + integration)

### Frontend (Development Mode)

From the `client/` directory:

```bash
**Other frontend scripts:**
- `npm run build` – Build for production
- `npm run preview` – Preview production build locally
- `npm run test` – Run tests in watch mode
- `npm run test:run` – Run tests once

**Root-level scripts** (from project root):
- `npm run dev` – Run both backend and frontend concurrently
- `npm run dev:server` – Run backend only
- `npm run dev:client` – Run frontend only
- `npm run build` – Build both backend and frontend
- `npm run test` – Run all backend tests
This starts the backend server (port `3000`) and frontend dev server (port `5173`) simultaneously using `concurrently`. Both will auto-reload on file changes.

**Individual dev scripts** (if you prefer separate terminals):
- Backend only: `npm run dev:server` (or `cd server && npm run dev`)
- Frontend only: `npm run dev:client` (or `cd client && npm run dev`)

## Testing

### Backend Tests

From the `server/` directory:

**Run all tests:**
```bash
npm run test:all
```

**Run only unit tests:**
```bash
npm run test
```

**Run only integration tests:**
```bash
npm run test:integration
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

**Run tests with coverage report:**
```bash
npm run test:coverage
```

### Frontend Tests

From the `client/` directory:

**Run tests once:**
```bash
npm run test:run
```

**Run tests in watch mode:**
```bash
npm test
```

**Test Coverage:**
- **HomePage Tests (3 tests):**
  - Renders main UI elements (title, button, feature cards)
  - Creates session and navigates on button click
  - Displays error message when session creation fails

- **CodeEditor Tests (4 tests):**
  - Renders editor component with language selector
  - Changes language when selector is changed
  - Calls onRunCode when Run button is clicked
  - Displays JavaScript and Python language options

All tests use **Vitest** and **React Testing Library** for fast, reliable component testing.

## Environment Variables

The current implementation does not require environment variables. If you plan to add configurable settings (e.g., server port, database URL, API endpoints), create a `.env.local` file in the respective directory and update this section.

### Future Considerations
- Backend port configuration
- Frontend API endpoint configuration
- Database credentials (if persistence is added)
- Authentication/API keys (if external services are integrated)

## Development Workflow

1. **Making changes to the backend:**
   - Edit files in `server/src/`
   - The dev server auto-reloads (Node watch mode)
   - Run tests frequently: `npm run test:watch`

2. **Making changes to the frontend:**
   - Edit files in `client/src/`
   - Vite provides instant HMR (Hot Module Replacement)
   - Browser refreshes automatically
   - Run tests: `npm run test:run` (in client)

3. **Before committing:**
   - Ensure all backend tests pass: `npm run test:all` (in server)
   - Ensure all frontend tests pass: `npm run test:run` (in client)
   - Build the project: `npm run build` (in both server and client)

## Docker Deployment

The application is fully containerized and runs both backend and frontend in a single Docker container.

### Building the Docker Image

From the project root:

```bash
docker build -t online-coding-interview-app .
```

This creates a production-optimized image using a multi-stage build that:
1. Builds the frontend (React + Vite)
2. Builds the backend (TypeScript → JavaScript)
3. Creates a minimal production image with only necessary dependencies
4. Configures the backend to serve the frontend static files

### Running the Docker Container

```bash
docker run -p 3000:3000 online-coding-interview-app
```

The application will be available at `http://localhost:3000`

### Docker Configuration

- **Dockerfile**: Multi-stage build for optimal image size
- **.dockerignore**: Excludes unnecessary files (node_modules, tests, dev files)
- **Port**: Exposes port 3000
- **Environment**: Runs with `NODE_ENV=production`

### Production Features

- Frontend assets served by Express static middleware
- SPA fallback routing (all non-API routes serve index.html)
- Dynamic share link generation based on request host
- Single container deployment for simplified infrastructure

### Additional Docker Commands

```bash
# Build with custom tag
docker build -t myregistry/online-coding-interview:v1.0 .

# Run with custom port mapping
docker run -p 8080:3000 online-coding-interview-app

# Run in detached mode
docker run -d -p 3000:3000 --name interview-app online-coding-interview-app

# View logs
docker logs interview-app

# Stop container
docker stop interview-app

# Remove container
docker rm interview-app
```

### Deployment Platforms

The Docker image can be deployed to:
- **AWS ECS/Fargate**: Container orchestration
- **Google Cloud Run**: Serverless containers
- **Azure Container Instances**: Managed containers
- **DigitalOcean App Platform**: Simple container hosting
- **Heroku**: Container registry
- **Any Kubernetes cluster**: K8s deployment

## Future Work

- [ ] Additional language support (TypeScript, Java, C++, C#, Go, Rust, etc.)
- [x] Frontend unit tests for core components
- [ ] Frontend integration tests and E2E tests
- [ ] User authentication and authorization
- [ ] Session persistence (database integration)
- [x] Code execution sandbox (Browser-based WebAssembly)
- [ ] Interview templates and problem library
- [ ] Chat/voice integration
- [ ] Performance monitoring and analytics
- [x] Containerization and deployment (Docker single-container)
- [x] Code output panel and execution results

## Contributing

Guidelines for contributing to this project (to be defined).

## License

Specify the project license here.

## Support

For questions or issues, please open a GitHub issue or contact the development team.


