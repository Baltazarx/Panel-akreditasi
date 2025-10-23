@echo off
REM Setup script for TPM C1 Frontend & Backend (Windows)

echo ==========================================
echo TPM C1 Frontend & Backend Setup
echo ==========================================
echo.

REM Check if .env files exist
echo Checking environment files...

REM Backend .env
if not exist "Backend\.env" (
    echo Creating Backend\.env...
    (
        echo # Database Configuration
        echo DB_HOST=localhost
        echo DB_PORT=3306
        echo DB_USER=root
        echo DB_PASS=
        echo DB_NAME=tpm_c1
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=devsecret
        echo JWT_EXPIRES_IN=1d
        echo.
        echo # Server Configuration
        echo PORT=3000
        echo NODE_ENV=development
        echo.
        echo # Frontend Origins (comma-separated)
        echo FRONTEND_ORIGIN=http://localhost:5173,http://localhost:3000
    ) > Backend\.env
    echo [OK] Backend\.env created
) else (
    echo [OK] Backend\.env already exists
)

REM Frontend .env
if not exist "Frontend\.env" (
    echo Creating Frontend\.env...
    (
        echo # Backend API URL
        echo VITE_API_BASE_URL=http://localhost:3000
    ) > Frontend\.env
    echo [OK] Frontend\.env created
) else (
    echo [OK] Frontend\.env already exists
)

echo.
echo Installing dependencies...

REM Install backend dependencies
echo Installing Backend dependencies...
cd Backend
call npm install
cd ..

REM Install frontend dependencies
echo Installing Frontend dependencies...
cd Frontend
call npm install
cd ..

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Import database: mysql -u root -p ^< Backend\si_akreditasi_new2.sql
echo 2. Start backend: cd Backend ^&^& npm run dev
echo 3. Start frontend: cd Frontend ^&^& npm run dev
echo.
echo Backend will run on: http://localhost:3000
echo Frontend will run on: http://localhost:5173
echo.

pause

