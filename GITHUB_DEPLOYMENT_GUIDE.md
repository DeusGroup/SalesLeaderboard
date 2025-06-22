# GitHub Deployment Guide - Sales Performance Tracker

## Overview
This guide covers preparing and deploying the Sales Performance Tracker as a full-stack application on GitHub.

## Repository Structure
```
sales-performance-tracker/
├── client/                 # React frontend
├── server/                 # Express backend
├── shared/                 # Shared types and schemas
├── database_backup_*.sql   # Database backup
├── package.json           # Dependencies
├── README.md              # Project documentation
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
└── deployment files       # Docker, Vercel, etc.
```

## Pre-Deployment Checklist

### 1. Environment Variables Setup
Create `.env.example` file:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/sales_tracker

# Session
SESSION_SECRET=your-session-secret-here

# File Upload (if using external storage)
# UPLOADTHING_SECRET=
# UPLOADTHING_APP_ID=

# Production Settings
NODE_ENV=production
PORT=5000
```

### 2. Update Package.json Scripts
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && npm run build",
    "build:server": "tsc server/**/*.ts --outDir dist",
    "start": "node dist/index.js",
    "start:dev": "npm run dev",
    "dev": "tsx server/index.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### 3. Database Migration Strategy
Choose one approach:

**Option A: SQL Backup Restoration**
- Include `database_backup_*.sql` in repo
- Provide restoration instructions in README

**Option B: Drizzle Migrations**
```bash
# Generate initial migration
npm run db:generate

# Apply migrations
npm run db:push
```

**Option C: Seed Script**
Create `server/seed.ts` with sample data for fresh installations.

## Deployment Options

### Option 1: Vercel (Recommended for Serverless)
1. **Frontend**: Deploy client to Vercel
2. **Backend**: Deploy server as Vercel Functions
3. **Database**: Use Neon, Supabase, or PlanetScale

**vercel.json**:
```json
{
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ]
}
```

### Option 2: Railway/Render (Full-Stack Deployment)
1. **Single deployment** with both frontend and backend
2. **Built-in PostgreSQL** database
3. **Automatic SSL** and domain

**Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

### Option 3: Traditional VPS (DigitalOcean, AWS EC2)
1. **Nginx** reverse proxy
2. **PM2** process manager
3. **PostgreSQL** database
4. **SSL** with Let's Encrypt

## Required Files for GitHub

### .gitignore
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/
client/dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite

# Uploads
uploads/

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary files
*.tmp
*.temp
```

### GitHub Actions Workflow
`.github/workflows/deploy.yml`:
```yaml
name: Deploy Application

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to production
      # Add your deployment commands here
      run: echo "Deploy to your chosen platform"
```

## Database Setup for Production

### 1. Cloud Database Options
- **Neon**: Serverless PostgreSQL
- **Supabase**: PostgreSQL with additional features
- **PlanetScale**: MySQL alternative
- **AWS RDS**: Managed PostgreSQL
- **Google Cloud SQL**: Managed PostgreSQL

### 2. Database Initialization
```bash
# For new deployments
npm run db:push

# For existing data
psql $DATABASE_URL < database_backup_20250622_203643.sql
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use platform-specific secret management
- Rotate database credentials regularly

### 2. Authentication
- Change default admin password
- Use strong session secrets
- Implement rate limiting

### 3. Database Security
- Use connection pooling
- Enable SSL connections
- Restrict database access by IP

## Monitoring and Maintenance

### 1. Logging
- Implement structured logging
- Use external log aggregation
- Monitor error rates

### 2. Performance
- Database query optimization
- CDN for static assets
- Response caching

### 3. Backups
- Automated daily backups
- Test restoration procedures
- Multiple backup locations

## Post-Deployment Steps

1. **Verify** all endpoints work correctly
2. **Test** database connectivity
3. **Configure** monitoring and alerts
4. **Set up** automated backups
5. **Update** DNS records
6. **Enable** SSL certificates
7. **Test** admin login functionality

## Troubleshooting Common Issues

### Database Connection Errors
- Verify DATABASE_URL format
- Check network connectivity
- Confirm database exists

### Build Failures
- Ensure all dependencies are listed
- Check Node.js version compatibility
- Verify build scripts

### Authentication Issues
- Verify session configuration
- Check admin credentials
- Confirm session storage

## Support and Resources

- **Database Backup**: `database_backup_20250622_203643.sql`
- **Admin Credentials**: username: `admin`, password: `Welcome1`
- **Default Port**: 5000
- **API Base**: `/api`