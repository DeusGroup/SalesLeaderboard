# Database Restore Instructions

## Prerequisites
- PostgreSQL 16+ installed
- Access to a PostgreSQL database server
- The backup file: `database_backup_20250622_203643.sql`

## Restore Steps

### 1. Create a New Database (if needed)
```bash
# Connect to PostgreSQL as admin
psql -U postgres

# Create new database
CREATE DATABASE sales_tracker;

# Exit psql
\q
```

### 2. Restore from Backup
```bash
# Method 1: Direct restore
psql -U postgres -d sales_tracker < database_backup_20250622_203643.sql

# Method 2: Using environment variable
export DATABASE_URL="postgresql://username:password@localhost:5432/sales_tracker"
psql $DATABASE_URL < database_backup_20250622_203643.sql
```

### 3. Verify Restoration
```bash
# Connect to the database
psql $DATABASE_URL

# Check tables exist
\dt

# Verify data
SELECT COUNT(*) FROM participants;
SELECT COUNT(*) FROM admin;

# Exit
\q
```

## Expected Results
- **participants table**: 5 records
- **admin table**: 1 record (username: admin, password: Welcome1)
- **session table**: Session data for authentication

## Troubleshooting
- If you get permission errors, ensure your PostgreSQL user has CREATE privileges
- If tables already exist, drop the database and recreate it before restoring
- For cloud databases (AWS RDS, Google Cloud SQL, etc.), use their respective connection strings