# Setup Instructions - Frontend & Backend Connection

## Prerequisites
- Node.js installed
- MySQL installed and running
- Database `tpm_c1` created from `si_akreditasi_new2.sql`

## Step 1: Database Setup

1. Import the database:
```bash
mysql -u root -p < Backend/si_akreditasi_new2.sql
```

Or manually create database and import:
```sql
CREATE DATABASE tpm_c1;
USE tpm_c1;
SOURCE Backend/si_akreditasi_new2.sql;
```

## Step 2: Backend Setup

1. Navigate to Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in Backend directory with the following content:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=tpm_c1

# JWT Configuration
JWT_SECRET=devsecret
JWT_EXPIRES_IN=1d

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend Origins (comma-separated)
FRONTEND_ORIGIN=http://localhost:5173,http://localhost:3001
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

## Step 3: Frontend Setup

1. Navigate to Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in Frontend directory with the following content:
```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Step 4: Testing the Connection

1. Open your browser and go to `http://localhost:5173`
2. Login with one of the test accounts from the database:
   - Username: `waket1` / Password: (check database)
   - Username: `prodi_ti` / Password: (check database)
   - Username: `lppm` / Password: (check database)

## API Endpoints

The backend provides the following main API endpoints:

- `/api/login` - POST - Login
- `/api/logout` - POST - Logout  
- `/api/me` - GET - Get current user info
- `/api/health` - GET - Health check

All other endpoints require authentication and are prefixed with `/api/`

## Troubleshooting

### Backend won't start
- Check if MySQL is running
- Verify database credentials in `.env`
- Check if port 3000 is available

### Frontend can't connect to backend
- Verify backend is running on port 3000
- Check VITE_API_BASE_URL in frontend `.env`
- Check browser console for CORS errors

### Database connection errors
- Verify MySQL is running: `mysql -u root -p`
- Check database exists: `SHOW DATABASES;`
- Verify database name matches in `.env`

## Database Structure

The database `tpm_c1` includes tables for:
- Users and authentication
- Unit kerja (work units)
- Dosen (lecturers)
- Pegawai (employees)
- Tendik (education staff)
- Various tables for accreditation data (Tabel 1A, 1B, 2A, 2B, 2C, 2D)

## Notes

- Backend runs on port 3000
- Frontend runs on port 5173 (Vite default)
- Authentication uses JWT tokens stored in httpOnly cookies
- CORS is configured to allow requests from frontend origins

