# Online Coding Interview App

A real-time collaborative coding interview platform that enables interviewers and candidates to write, execute, and discuss code together in a shared editor.

## Overview

The Online Coding Interview App is a web-based tool designed to facilitate remote technical interviews. It features:

- **Real-time collaborative code editing** powered by Socket.IO
- **Live code syntax highlighting** with Monaco Editor
- **Shared session management** for interview coordination
- **Integrated testing infrastructure** for code validation
- **Clean, intuitive UI** built with React and Tailwind CSS

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
│   │   │   └── CodeEditor.tsx      # Real-time collaborative editor
│   │   └── pages/
│   │       ├── HomePage.tsx        # Landing page
│   │       └── SessionPage.tsx     # Interview session page
│   ├── dist/                       # Production build (generated)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
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

Currently, the frontend does not have automated tests configured. This is a planned addition for future development.

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

3. **Before committing:**
   - Ensure all tests pass: `npm run test:all` (in server)
   - Build the project: `npm run build` (in both server and client)

## Deployment

This section is a placeholder for future deployment guidance.

### Future Considerations
- Containerization with Docker
- Deployment platforms (Vercel, Netlify for frontend; Heroku, AWS for backend)
- Environment-specific configuration
- CI/CD pipeline setup


