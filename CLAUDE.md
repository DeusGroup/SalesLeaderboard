# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- `npm run dev` - Start development server on port 5000
- `npm run build` - Build for production (client + server)
- `npm run start` - Start production server
- `npm run check` - Run TypeScript compiler checks
- `npm run db:push` - Push database schema changes to PostgreSQL

## Architecture Overview

This is a full-stack sales performance tracking application with a React frontend and Express backend.

### Core Structure
- **Frontend**: React 18 with TypeScript, located in `client/` directory
- **Backend**: Express.js with TypeScript, located in `server/` directory  
- **Shared**: Common schemas and types in `shared/schema.ts`
- **Database**: PostgreSQL with Drizzle ORM

### Key Technologies
- **Routing**: Wouter for frontend routing
- **State Management**: TanStack Query for server state
- **UI Components**: shadcn/ui components (Radix UI + Tailwind CSS)
- **Authentication**: Passport.js with session-based auth
- **File Uploads**: Multer for avatar uploads to `uploads/` directory
- **Styling**: Tailwind CSS with custom theme configuration

### Database Schema

The application uses two main tables:

**participants** table:
- Core metrics: `boardRevenue`, `mspRevenue`, `voiceSeats`, `totalDeals`
- Goal tracking: corresponding `*Goal` fields for each metric
- Profile: `name`, `role`, `department`, `avatarUrl`
- Calculated `score` field based on weighted metrics

**admin** table:
- Simple authentication with `username` and `password`

### Scoring Algorithm

Performance scores are calculated in `server/storage.ts:107-111`:
```
score = boardRevenue + (mspRevenue * 2) + (voiceSeats * 10) + (totalDeals * 1000)
```

### API Architecture

**Public endpoints**:
- `GET /api/leaderboard` - Returns participants ordered by score (cached for 2 seconds)

**Protected endpoints** (require admin authentication):
- `GET /api/participants` - List all participants
- `GET /api/participants/:id` - Get single participant
- `POST /api/participants` - Create new participant
- `PATCH /api/participants/:id/metrics` - Update participant metrics
- `PATCH /api/participants/:id/profile` - Update participant profile
- `DELETE /api/participants/:id` - Delete participant
- `POST /api/upload` - Upload files (avatars)

### Caching Strategy

Leaderboard data is cached in memory (`routes.ts:19-23`) with a 2-second TTL. Cache is automatically invalidated when participant data changes.

### Authentication Flow

- Session-based authentication using PostgreSQL session store
- Admin login at `/admin/login` with default credentials (admin/Welcome1)
- Protected routes use `requireAuth` middleware
- Frontend uses `ProtectedRoute` component with `useAuth` hook

### Frontend Routing

- `/` - Public leaderboard view
- `/admin/login` - Admin authentication
- `/admin/dashboard` - Admin participant management (protected)
- `/admin/profile/:id` - Individual participant profile editor (protected)

### File Upload System

Avatar uploads are handled via Multer with disk storage in the `uploads/` directory. Files are served statically at `/uploads/*` endpoint.

### Development Notes

- Server runs on port 5000 (or PORT environment variable)
- Vite development server is integrated for frontend hot reloading
- Database connection requires `DATABASE_URL` environment variable
- TypeScript configuration supports path aliases (`@/` maps to `client/src/`)
- Error handling includes structured logging for API requests