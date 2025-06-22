# Sales Performance Tracker

A dynamic sales performance tracking application that transforms team performance data into engaging, actionable insights.

## Features

- **Real-time Leaderboard** - Track sales team performance with live updates
- **Performance Metrics** - Monitor board revenue, MSP revenue, voice seats, and total deals
- **Goal Tracking** - Set and track individual performance goals
- **Admin Dashboard** - Manage participants and view detailed analytics
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Interactive Visualizations** - Advanced charts and progress indicators

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for data fetching
- **Tailwind CSS** + **shadcn/ui** for styling
- **Recharts** for data visualization
- **Framer Motion** for animations

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **Passport.js** for authentication
- **Multer** for file uploads
- **Session-based** authentication

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 16+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd sales-performance-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Set up the database**
```bash
# Option 1: Restore from backup
psql $DATABASE_URL < database_backup_20250622_203643.sql

# Option 2: Initialize with Drizzle
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Database Setup

### Using the Backup
The repository includes a complete database backup with sample data:
- **5 sales participants** with performance metrics
- **1 admin user** (username: `admin`, password: `Welcome1`)

```bash
# Restore the backup
psql $DATABASE_URL < database_backup_20250622_203643.sql
```

### Fresh Installation
For a clean installation without sample data:
```bash
npm run db:push
```

## API Endpoints

### Public Endpoints
- `GET /api/leaderboard` - Get leaderboard data

### Protected Endpoints (Admin Only)
- `POST /api/participants` - Create new participant
- `PUT /api/participants/:id` - Update participant
- `DELETE /api/participants/:id` - Delete participant
- `POST /api/participants/:id/avatar` - Upload avatar

### Authentication
- `POST /api/login` - Admin login
- `POST /api/logout` - Admin logout
- `GET /api/user` - Get current user

## Admin Access

**Default Admin Credentials:**
- Username: `admin`
- Password: `Welcome1`

*Change these credentials after first login for security.*

## Deployment

### Environment Variables
Required environment variables for production:
```env
DATABASE_URL=your-production-database-url
SESSION_SECRET=your-strong-session-secret
NODE_ENV=production
PORT=5000
```

### Build for Production
```bash
npm run build
npm start
```

### Deployment Options
- **Vercel** - Serverless deployment (recommended)
- **Railway/Render** - Full-stack hosting
- **VPS** - Traditional server deployment

See `GITHUB_DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## Database Schema

### Participants Table
- `id` - Unique identifier
- `name` - Participant name
- `board_revenue` - Current board revenue
- `msp_revenue` - Current MSP revenue
- `voice_seats` - Current voice seats
- `total_deals` - Total deals closed
- `score` - Calculated performance score
- `role` - Job role
- `department` - Department
- `avatar_url` - Profile picture URL
- Goal fields for each metric

### Admin Table
- `id` - Unique identifier
- `username` - Admin username
- `password` - Hashed password

## Performance Features

### Scoring System
The performance score is calculated based on:
- Board Revenue (weighted)
- MSP Revenue
- Voice Seats (weighted)
- Total Deals (weighted)

### Caching
- Leaderboard data is cached for 2 seconds
- Automatic cache invalidation on data updates

### Real-time Updates
- Frontend automatically refreshes leaderboard data
- Optimistic updates for better user experience

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

### Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── auth.ts          # Authentication logic
│   ├── db.ts            # Database connection
│   ├── routes.ts        # API routes
│   └── storage.ts       # Data access layer
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema
└── database_backup_*.sql # Database backup
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- Session-based authentication
- Password hashing with bcrypt
- SQL injection protection with Drizzle ORM
- Input validation with Zod schemas
- CORS protection
- Rate limiting recommended for production

## Support

- Check `DATABASE_RESTORE.md` for database restoration help
- See `GITHUB_DEPLOYMENT_GUIDE.md` for deployment assistance
- Review the backup file for sample data structure

## License

This project is licensed under the MIT License - see the LICENSE file for details.