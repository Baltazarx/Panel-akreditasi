# Frontend & Backend Connection Summary

## Changes Made

### 1. Environment Configuration Files

**Backend/.env.example** - Template for backend environment variables
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=tpm_c1
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173,http://localhost:3000
```

**Frontend/.env.example** - Template for frontend environment variables
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 2. Fixed Authentication Field Mapping

**Backend/src/auth/login.route.js**
- Fixed `/me` endpoint to return `id_unit_prodi` instead of `id_unit`
- Now consistent with the JWT payload

**Frontend/src/hooks/useAuth.js**
- Updated to use `id_unit_prodi` instead of `id_unit`
- Now matches backend response structure

### 3. Created Setup Scripts

**setup.bat** - Windows setup script
- Automatically creates .env files
- Installs dependencies for both frontend and backend

**setup.sh** - Linux/Mac setup script
- Same functionality as setup.bat for Unix systems

### 4. Documentation

**SETUP.md** - Comprehensive setup guide
- Database setup instructions
- Backend configuration
- Frontend configuration
- Troubleshooting guide

**QUICKSTART.md** - Quick reference guide
- Fast setup instructions
- Common commands
- Login credentials reference

## Current Configuration

### Backend
- **Port**: 3000
- **Database**: tpm_c1
- **JWT Secret**: devsecret
- **CORS**: Enabled for localhost:5173 and localhost:3001

### Frontend
- **Port**: 5173 (Vite default)
- **API Base URL**: http://localhost:3000
- **Proxy**: Configured in vite.config.js

## Database Structure

The database `tpm_c1` includes:
- Authentication tables (users)
- Unit kerja (work units)
- Dosen (lecturers)
- Pegawai (employees)
- Tendik (education staff)
- Various accreditation tables (Tabel 1A-1B, 2A-2D)

## How to Connect

### Step 1: Import Database
```bash
mysql -u root -p < Backend/si_akreditasi_new2.sql
```

### Step 2: Create Environment Files

**Backend/.env**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=tpm_c1
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173,http://localhost:3000
```

**Frontend/.env**
```env
VITE_API_BASE_URL=http://localhost:3000
```

### Step 3: Start Backend
```bash
cd Backend
npm run dev
```

### Step 4: Start Frontend
```bash
cd Frontend
npm run dev
```

## Authentication Flow

1. User logs in with username/password via `/api/login`
2. Backend creates JWT token and stores in httpOnly cookie
3. Frontend receives token and stores it
4. Subsequent requests include token in cookies
5. Backend validates token for protected routes

## API Endpoints

### Public Endpoints
- `POST /api/login` - Login
- `GET /api/health` - Health check
- `GET /` - API status

### Protected Endpoints (require authentication)
- `POST /api/logout` - Logout
- `GET /api/me` - Current user info
- All other `/api/*` endpoints

## Testing

1. Open browser to http://localhost:5173
2. Login with credentials from database
3. Test CRUD operations on various tables
4. Check browser console for API calls
5. Verify data appears correctly

## Troubleshooting

### Connection Issues
- Verify both servers are running
- Check database connection in backend logs
- Verify CORS settings if frontend can't reach backend

### Authentication Issues
- Check JWT secret in backend .env
- Verify cookie settings in browser
- Check token expiration (default: 1 day)

### Database Issues
- Verify MySQL is running
- Check database credentials
- Ensure database exists: `SHOW DATABASES;`

## Next Steps

1. Run the setup script (`setup.bat` or `setup.sh`)
2. Import the database
3. Start both servers
4. Test the connection
5. Customize as needed

## Notes

- Backend uses cookie-based authentication
- Frontend uses fetch API with credentials
- All API calls automatically include credentials
- CORS is configured for development
- Database uses soft deletes (deleted_at field)

