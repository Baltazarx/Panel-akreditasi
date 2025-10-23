# Quick Start Guide

## Prerequisites
- MySQL Server running
- Node.js installed

## Quick Setup (Windows)

Run the setup script:
```bash
setup.bat
```

Or manually:
1. Create `.env` files in Backend and Frontend directories (see SETUP.md)
2. Install dependencies in both directories

## Import Database

```bash
mysql -u root -p < Backend/si_akreditasi_new2.sql
```

## Start Backend

```bash
cd Backend
npm run dev
```

Backend runs on: http://localhost:3000

## Start Frontend

In a new terminal:
```bash
cd Frontend
npm run dev
```

Frontend runs on: http://localhost:5173

## Login Credentials

Use the accounts from the database:
- Username: `waket1` / Password: (check database)
- Username: `prodi_ti` / Password: (check database)
- Username: `prodi_mi` / Password: (check database)
- Username: `lppm` / Password: (check database)
- Username: `tpm` / Password: (check database)
- Username: `kepegawaian` / Password: (check database)

## API Endpoints

- `GET /` - API status
- `GET /api/health` - Health check
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/me` - Current user info

All other endpoints require authentication.

## Troubleshooting

### Can't connect to database
- Check MySQL is running
- Verify credentials in Backend/.env
- Check database exists: `SHOW DATABASES;`

### Frontend can't reach backend
- Verify backend is running on port 3000
- Check VITE_API_BASE_URL in Frontend/.env
- Check browser console for errors

### Port already in use
- Backend: Change PORT in Backend/.env
- Frontend: Change port in Frontend/vite.config.js

