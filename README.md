# API Blitz — Competition Platform

A full-stack CTF-style API Competition Platform with real-time leaderboard, built-in API client, and admin dashboard.

## Tech Stack

- **Frontend:** React + Vite, TailwindCSS, React Router, Socket.io-client, Axios, Monaco Editor
- **Backend:** Node.js + Express, MongoDB + Mongoose, JWT Auth, Socket.io

## Project Structure

```
/competition-platform
├── /client      → React + Vite frontend
└── /server      → Node.js + Express backend
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm install
npm run dev
```

### Frontend Setup

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

### Environment Variables

**Server (`/server/.env`):**
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT access token secret |
| `JWT_REFRESH_SECRET` | JWT refresh token secret |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `CLIENT_URL` | Frontend URL for CORS |

**Client (`/client/.env`):**
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL |
| `VITE_SOCKET_URL` | Socket.io server URL |

## Usage

1. Start the backend server (port 5000)
2. Start the frontend dev server (port 5173)
3. Login as admin at `/admin/login` using credentials from `.env`
4. Create teams, challenges, and configure competition settings
5. Start the competition — teams can login and solve challenges

## Features

- **Participant Side:** Challenge board, built-in API client with Monaco editor, flag submission, live leaderboard
- **Admin Side:** Dashboard, team/challenge management, competition controls, submission monitoring
- **Real-time:** Socket.io for live leaderboard, timer sync, competition state changes
- **Security:** JWT access + refresh tokens, rate-limited flag submissions, flag never exposed to clients
