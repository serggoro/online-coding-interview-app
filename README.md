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

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

## Running the Application

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
npm run dev
```

This starts the Vite development server with hot module replacement. The frontend typically runs on `http://localhost:5173`.

**Other frontend scripts:**
- `npm run build` – Build for production
- `npm run preview` – Preview production build locally

### Running Both Concurrently

If you want to run both backend and frontend simultaneously:

1. **Option 1:** Open two terminal windows/tabs
   - In terminal 1: `cd server && npm run dev`
   - In terminal 2: `cd client && npm run dev`

2. **Option 2:** Install and use `concurrently` (optional setup)
   ```bash
   npm install -D concurrently
   ```
   Then add to root `package.json` and run `npm run dev:all`.

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


