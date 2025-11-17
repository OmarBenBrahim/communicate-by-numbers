# Communicate by Numbers

A full-stack Next.js application for communicating via calculation trees. Users can create discussion chains by starting with a number and adding mathematical operations, similar to nested comments in social media.

## Live Demo
https://communicate-by-numbers.onrender.com/

## Tech Stack

- **Frontend & Backend:** Next.js 14 (TypeScript)
- **Database:** SQLite (better-sqlite3)
- **Styling:** Tailwind CSS
- **Data Fetching:** React Query (TanStack Query)
- **Authentication:** JWT + bcryptjs
- **Containerization:** Docker & Docker Compose

## Features

✅ User authentication (register/login)  
✅ View all calculation trees without authentication  
✅ Create starting numbers (authenticated users)  
✅ Add operations (+, -, *, /) to any node  
✅ Nested tree view with expandable nodes  
✅ Real-time updates (auto-refetch every 3 seconds)  
✅ Clean, component-based architecture  
✅ Type-safe with full TypeScript support  

## Project Structure

```
.
├── pages/
│   ├── api/
│   │   ├── auth/[...auth].ts       # Auth endpoints (register, login, me)
│   │   └── posts.ts                # Posts endpoints (tree, start, op)
│   ├── _app.tsx                    # App wrapper with providers
│   ├── index.tsx                   # Main page (tree view + forms)
│   ├── login.tsx                   # Login page
│   └── register.tsx                # Register page
├── components/
│   ├── TreeNode.tsx                # Expandable tree node component
│   ├── StartForm.tsx               # Form to start a chain
│   └── OperationForm.tsx           # Form to add operations
├── lib/
│   ├── db.ts                       # SQLite database initialization
│   ├── types.ts                    # TypeScript types
│   ├── jwt.ts                      # JWT utilities
│   ├── operations.ts               # Business logic for operations
│   ├── hooks.ts                    # React Query hooks
│   └── auth.tsx                    # Auth context & provider
├── styles/
│   └── globals.css                 # Global styles with Tailwind
├── docker-compose.yml              # Docker Compose config
├── Dockerfile                      # Docker build config
├── package.json                    # Dependencies
└── README.md                       # This file
```

## Local Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

The application will automatically initialize the SQLite database on first run.

## Docker Setup

Build and run with Docker Compose:

```bash
docker-compose up --build
```

The app will be available at `http://localhost:3000`.

Volumes:
- `./data` — Persistent SQLite database storage
- `./node_modules` — Cached dependencies
- `./` — Hot-reload during development

## API Endpoints

### Authentication

**POST /api/auth/register**
```json
{
  "username": "string",
  "password": "string"
}
```
Response: `{ token: string, user: { id, username } }`

**POST /api/auth/login**
```json
{
  "username": "string",
  "password": "string"
}
```
Response: `{ token: string, user: { id, username } }`

**GET /api/auth/me**  
Headers: `Authorization: Bearer <token>`  
Response: `{ user: { id, username } }`

### Posts

**GET /api/posts**  
Returns the complete nested tree of all nodes.

**POST /api/posts** (start a chain)
```json
{
  "action": "start",
  "value": number
}
```
Response: Node object

**POST /api/posts** (add operation)
```json
{
  "action": "op",
  "parentId": number,
  "opType": "+|-|*|/",
  "rightValue": number
}
```
Response: Node object

## Data Model

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

### Nodes Table
```sql
CREATE TABLE nodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER,
  type TEXT NOT NULL CHECK(type IN ('start', 'op')),
  op_type TEXT CHECK(op_type IN ('+', '-', '*', '/')),
  left_value REAL NOT NULL,
  right_value REAL,
  result REAL NOT NULL,
  author_id INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(parent_id) REFERENCES nodes(id),
  FOREIGN KEY(author_id) REFERENCES users(id)
);
```

## Authentication Flow

1. **Register/Login** → Receive JWT token
2. **Store token** → Saved in localStorage
3. **Authenticated requests** → Include `Authorization: Bearer <token>` header
4. **Token verification** → Server validates and retrieves user context

## Usage Example

1. **No auth needed** → Visit home page to see all trees
2. **Register** → Create account with username & password
3. **Start chain** → Click "Start New Chain", enter a number
4. **Add operation** → Select a node, choose operation & right value
5. **Expand/collapse** → Click arrows to explore tree branches
6. **Logout** → Click logout button

## Design Decisions

- **SQLite** → Simple, file-based, no external dependencies
- **React Query** → Automatic caching, refetching, mutations
- **JWT tokens** → Stateless auth, localStorage for persistence
- **Component-based** → Reusable `TreeNode`, forms for maintainability
- **Auth context** → Global auth state without Redux
- **API routes** → Unified Next.js backend, no separate server

## Testing

Basic smoke tests can be run (optional):

```bash
npm test
```

## Environment Variables

- `JWT_SECRET` — JWT signing key (defaults to 'dev-secret-key-change-in-production')
- `NODE_ENV` — 'development' or 'production'
- `PORT` — Server port (defaults to 3000)

## Deployment

Build for production:

```bash
npm run build
npm start
```

Deploy to Vercel, Netlify, or any Node.js hosting:
- Create `.env.production` with a secure `JWT_SECRET`
- Set environment variables in hosting platform
- Push to GitHub and connect to your hosting service

## Notes

- The database file is stored in `.data/app.db` and persists across restarts
- Unregistered users can view all trees but cannot create new chains
- All operations are validated on the backend
- Timestamps use milliseconds (JavaScript `Date.now()`)
- Division by zero returns `NaN`

## License

MIT
