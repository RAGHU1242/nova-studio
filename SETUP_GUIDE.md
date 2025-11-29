# AlgoBattle Arena - Setup & Deployment Guide

## 📋 Phase 1: MVP - Complete ✅

AlgoBattle Arena is now at **MVP stage** with the following features fully implemented:

### ✅ Completed Features

**Authentication & User Management**
- Email/password registration and login with Zod validation
- JWT token-based authentication
- Session persistence via localStorage
- User profile management with avatar upload
- User stats tracking (wins/losses)

**Game Mechanics**
- Matchmaking queue system
- Rock-Paper-Scissors battle UI
- Mock match simulation with choice commits
- Match result calculation
- Leaderboard with rankings
- User statistics dashboard

**Backend API**
- `/api/auth/register` - User registration
- `/api/auth/login` - User login
- `/api/users/me` - Get current user profile
- `/api/match/join` - Join matchmaking queue
- `/api/match/leave` - Leave queue
- `/api/match/:matchId` - Get match details
- `/api/match/result` - Submit match result
- `/api/leaderboard` - Get global leaderboard
- `/api/leaderboard/:userId` - Get user rank
- `/api/history/:userId` - Get match history

**Frontend Pages**
- `/` - Home page with features and CTAs
- `/login` - Login form with validation
- `/register` - Registration form with validation
- `/dashboard` - User dashboard with stats and quick actions (protected)
- `/battle` - Battle arena with matchmaking (protected)
- `/leaderboard` - Global leaderboard rankings
- `/profile` - User profile management (protected)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or higher
- pnpm (recommended) or npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd algobattle-arena
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual values:

```env
# Firebase Configuration (optional for Phase 1)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# JWT Secret (for backend)
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Algorand (for Phase 2)
VITE_ALGORAND_NETWORK=testnet
VITE_ALGORAND_TESTNET_NODE=https://testnet-api.algonode.cloud
```

### Development

Start the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:8080`

Frontend is served at the same port (Vite proxy)
Backend API endpoints at `/api/*`

### Testing

Run the test suite:
```bash
pnpm test
```

### Type Checking

Check TypeScript types:
```bash
pnpm typecheck
```

### Formatting

Format code with Prettier:
```bash
pnpm format.fix
```

---

## 🏗 Project Structure

```
.
├── client/                 # React frontend (SPA)
│   ├── pages/             # Route pages
│   │   ├── HomePage.tsx   # Home page
│   │   ├── Login.tsx      # Login page
│   │   ├── Register.tsx   # Registration page
│   │   ├── Dashboard.tsx  # User dashboard (protected)
│   │   ├── BattleArena.tsx # Match gameplay (protected)
│   │   ├── Leaderboard.tsx # Global leaderboard
│   │   ├── Profile.tsx     # User profile (protected)
│   │   └── NotFound.tsx    # 404 page
│   ├── components/        # Reusable components
│   │   ├── Navbar.tsx     # Navigation bar
│   │   ├── WalletConnect.tsx # Wallet connector
│   │   ├── ProtectedRoute.tsx # Route protection
│   │   └── ui/            # Radix UI component library
│   ├── context/           # React context
│   │   └── AuthContext.tsx # Authentication state
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts     # Auth hook
│   │   ├── useApi.ts      # API request hook
│   │   └── use-toast.ts   # Toast notifications
│   ├── utils/             # Utility functions
│   │   ├── constants.ts   # App constants
│   │   ├── firebase.ts    # Firestore utilities
│   │   └── wallet.ts      # Wallet utilities
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Entry point
│   └── global.css         # Global styles
│
├── server/                # Express backend
│   ├── index.ts          # Server setup
│   ├── middleware/       # Express middleware
│   │   └── auth.ts       # JWT authentication
│   └── routes/           # API route handlers
│       ├── auth.ts       # Auth endpoints
│       ├── match.ts      # Match endpoints
│       ├── leaderboard.ts # Leaderboard endpoints
│       └── demo.ts       # Demo endpoint
│
├── shared/               # Shared code
│   └── api.ts           # API type definitions
│
├── package.json
├── tsconfig.json
├── vite.config.ts       # Frontend Vite config
├── vite.config.server.ts # Backend Vite config
├── postcss.config.js
├── tailwind.config.ts
├── .env.example         # Environment template
└── README.md            # This file
```

---

## 🔐 Authentication Flow

1. User signs up/logs in at `/login` or `/register`
2. Backend generates JWT token and returns user data
3. Token stored in localStorage
4. Token sent in `Authorization: Bearer <token>` header for protected endpoints
5. Protected pages redirect to login if not authenticated

**Note**: For production, implement:
- Refresh token rotation
- HttpOnly cookies (instead of localStorage)
- Token expiration handling
- Secure password hashing (bcrypt, not base64)

---

## 🎮 Game Flow (Current Mock Implementation)

1. User joins matchmaking queue with a stake (1-1000 ALGO)
2. System automatically pairs players when 2 are in queue
3. Players make their choice (Rock/Paper/Scissors) with 10s timeout
4. Both choices revealed simultaneously
5. Winner calculation: classic RPS rules
6. Rewards distributed: 90% to winner, 10% to DAO pool
7. Match result saved to history

**For Phase 2**: Replace mock with real WebSocket implementation and on-chain smart contracts

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect repository to Vercel/Netlify**
   - Go to https://vercel.com or https://netlify.com
   - Click "Import Project"
   - Select your GitHub repository
   - Configure environment variables
   - Deploy

3. **Environment Variables (in Vercel/Netlify dashboard)**
   - `VITE_FIREBASE_*` - Firebase config
   - `VITE_ALGORAND_*` - Algorand network config

### Backend (Render/Heroku)

1. **Build and test locally**
```bash
pnpm build
pnpm start
```

2. **Deploy to Render (Recommended)**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Configure:
     - **Build Command**: `pnpm install && pnpm build`
     - **Start Command**: `pnpm start`
   - Add environment variables
   - Deploy

3. **Deploy to Heroku**
   - Install Heroku CLI
   - `heroku create algobattle-arena-api`
   - `heroku config:set JWT_SECRET=your_secret`
   - `git push heroku main`

---

## 📦 Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router (routing)
- TanStack Query (data fetching)
- React Hook Form + Zod (form validation)
- Framer Motion (animations)
- Radix UI (components)
- Lucide React (icons)

**Backend**
- Express.js (Node.js framework)
- CORS middleware
- JWT authentication
- Express error handling

**Database** (Phase 2)
- Firestore (Cloud Firestore)

**Blockchain** (Phase 2)
- Algorand SDK
- TEAL smart contracts
- Pera Wallet integration

---

## 🔄 Phase 2: Advanced Features (Upcoming)

### Real-time Gameplay
- [ ] Socket.IO integration for live matchmaking
- [ ] Real-time game events (playerChoice, reveal, result)
- [ ] 10-second choice countdown with server validation
- [ ] Connection recovery and auto-reconnect

### Match History & Analytics
- [ ] Persistent match history in Firestore
- [ ] Advanced filtering and sorting
- [ ] Player statistics and analytics
- [ ] Match replay functionality

### Smart Contracts & On-chain Staking
- [ ] TEAL smart contract for escrow
- [ ] Stateless contract for stake management
- [ ] Commit-reveal pattern for cheat prevention
- [ ] Payout transactions via Algorand
- [ ] DAO pool management

### Enhanced Features
- [ ] Admin/DAO governance panel
- [ ] User banning and moderation
- [ ] Friend list and social features
- [ ] NFT badges and achievements
- [ ] Testnet → Mainnet migration path

---

## 🐛 Known Issues

1. **Chart component type error** - Pre-existing in UI library, doesn't affect functionality
2. **Wallet integration is mocked** - Phase 2 will implement real Pera Wallet + MyAlgoConnect
3. **Firestore not fully integrated** - Using mock data for Phase 1, will connect in Phase 2
4. **No real WebSocket** - Match results are simulated; Phase 2 will implement Socket.IO

---

## 🔒 Security Considerations

### Phase 1 (Current)
- ✅ JWT token-based auth
- ✅ Input validation with Zod
- ✅ CORS configured
- ⚠️ Mock password hashing (use bcrypt in production)
- ⚠️ Tokens in localStorage (use HttpOnly cookies)

### Phase 2 (Recommended)
- [ ] Implement real bcrypt password hashing
- [ ] Move tokens to HttpOnly secure cookies
- [ ] Add rate limiting on auth endpoints
- [ ] Implement refresh token rotation
- [ ] Add CSRF protection
- [ ] Validate all user inputs server-side
- [ ] Add security headers (CSP, HSTS, etc.)
- [ ] Implement proper error handling (no secret leaks)
- [ ] Use environment variables for all secrets
- [ ] Implement proper logging and monitoring

---

## 📝 API Documentation

### Authentication

**POST /api/auth/register**
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_1234567890",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**POST /api/auth/login**
```json
Request:
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: Same as register
```

### Matchmaking

**POST /api/match/join** (requires auth)
```json
Request:
{
  "stake": 10
}

Response (paired):
{
  "matched": true,
  "matchId": "match_1234567890"
}

Response (in queue):
{
  "matched": false,
  "message": "Added to matchmaking queue...",
  "queuePosition": 2
}
```

**GET /api/leaderboard?page=1&pageSize=10**
```json
Response:
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user_123",
      "name": "Champion",
      "wins": 48,
      "losses": 8,
      "winRate": 0.86,
      "totalEarnings": 5200
    }
  ],
  "total": 100
}
```

---

## 🧪 Testing

Currently no automated tests. Phase 2 should include:

- Unit tests for game logic (winner calculation)
- Integration tests for API endpoints
- E2E tests for user flows (signup → battle → leaderboard)
- WebSocket connection tests

```bash
pnpm test
```

---

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [React Router](https://reactrouter.com)
- [TanStack Query](https://tanstack.com/query/latest)
- [Express.js](https://expressjs.com)
- [Algorand Documentation](https://developer.algorand.org)

---

## 📄 License

MIT - See LICENSE file for details

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

- Create an issue on GitHub for bugs
- Check existing documentation in `/docs` folder
- Review code comments for implementation details

---

## 🎯 Roadmap

| Phase | Status | Features |
|-------|--------|----------|
| **Phase 1** | ✅ Complete | Auth, Profiles, Matchmaking UI, Leaderboard, Mock Gameplay |
| **Phase 2** | 🔄 In Progress | WebSocket Real-time, Smart Contracts, On-chain Staking |
| **Phase 3** | ⏳ Planned | DAO Governance, NFT Badges, Social Features |

---

**Last Updated**: 2024
**Version**: 1.0.0-MVP
