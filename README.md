# API Blitz — Competition Platform

A full-stack API Competition Platform with real-time leaderboard, built-in API client, and admin dashboard.

## Tech Stack

- **Frontend:** React + Vite, TailwindCSS, React Router, Socket.io-client, Axios, Monaco Editor
- **Backend:** Node.js + Express, MongoDB + Mongoose, JWT Auth, Socket.io

## Project Structure

```
/API Blitz
├── /client      → Participant React app (port 5173)
├── /admin       → Admin React app (port 5174)
└── /server      → Node.js + Express backend (port 5000)
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

### Admin Panel Setup

```bash
cd admin
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
| `ADMIN_URL` | Admin panel URL for CORS |

**Client (`/client/.env`):**
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL |
| `VITE_SOCKET_URL` | Socket.io server URL |

## Usage

1. Start the backend server (port 5000)
2. Start the participant app (port 5173)
3. Start the admin panel (port 5174)
4. Login to admin at `http://localhost:5174` using credentials from `.env`
5. Create teams, challenges, and configure competition settings
6. Start the competition — teams can login and solve challenges

## Features

- **Participant Side:** Challenge board, built-in API client with Monaco editor, flag submission, live leaderboard
- **Admin Side:** Dashboard, team/challenge management, competition controls, submission monitoring
- **Real-time:** Socket.io for live leaderboard, timer sync, competition state changes
- **Security:** JWT access + refresh tokens (4h session), rate-limited flag submissions, flag never exposed to clients

---

## Challenge APIs

Self-hosted challenge APIs are served by the same backend under `/challenge-api/`. These are **public endpoints** (no JWT required) — participants interact with them using the built-in API client.

### Challenge 01 (Easy): "Warmup: Status Clearance"

Base: `http://localhost:5000/challenge-api/01`

```bash
# Step 1: Ping
curl http://localhost:5000/challenge-api/01/ping

# Step 2: Get the flag
curl http://localhost:5000/challenge-api/01/flag
```

### Challenge 02 (Medium): "Two-Step Access Token"

Base: `http://localhost:5000/challenge-api/02`

```bash
# Step 1: Create session (nonce returned in X-Session-Nonce header)
curl -X POST http://localhost:5000/challenge-api/02/session \
  -H "Content-Type: application/json" \
  -d '{"team":"myteam"}' -i

# Step 2: Exchange for token (use sessionId + nonce from step 1)
curl -X POST http://localhost:5000/challenge-api/02/token \
  -H "X-Session-Id: <sessionId>" \
  -H "X-Session-Nonce: <nonce>"

# Step 3: Access vault with Bearer token
curl http://localhost:5000/challenge-api/02/vault \
  -H "Authorization: Bearer <accessToken>"
```

### Challenge 03 (Hard): "Protocol: Four Locks"

Base: `http://localhost:5000/challenge-api/03`

```bash
# Step 1: POST handshake (read X-Directive header in response)
curl -X POST http://localhost:5000/challenge-api/03/handshake \
  -H "Content-Type: application/json" \
  -d '{"agent":"myagent"}' -i

# Step 2: PATCH mode (use directive value; read X-Step-Token in response)
curl -X PATCH http://localhost:5000/challenge-api/03/mode \
  -H "Content-Type: application/json" \
  -H "X-Handshake-Id: <handshakeId>" \
  -d '{"mode":"STEALTH"}' -i

# Step 3: POST keys (need step token + a special hidden header for full access)
curl -X POST http://localhost:5000/challenge-api/03/keys \
  -H "X-Handshake-Id: <handshakeId>" \
  -H "X-Step-Token: <stepToken>"

# Step 4: GET vault (flag is in X-Flag HEADER, not body!)
curl http://localhost:5000/challenge-api/03/vault \
  -H "X-Handshake-Id: <handshakeId>" \
  -H "X-KeyA: <keyA>" \
  -H "X-KeyB: <keyB>" -i
```

> **Note:** Sessions expire after 10 minutes. Each team gets their own session, so concurrent usage is safe.
