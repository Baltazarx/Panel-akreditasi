#!/bin/bash

# Setup script for TPM C1 Frontend & Backend

echo "=========================================="
echo "TPM C1 Frontend & Backend Setup"
echo "=========================================="
echo ""

# Check if .env files exist
echo "Checking environment files..."

# Backend .env
if [ ! -f "Backend/.env" ]; then
    echo "Creating Backend/.env..."
    cat > Backend/.env << 'EOF'
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
EOF
    echo "✓ Backend/.env created"
else
    echo "✓ Backend/.env already exists"
fi

# Frontend .env
if [ ! -f "Frontend/.env" ]; then
    echo "Creating Frontend/.env..."
    cat > Frontend/.env << 'EOF'
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000
EOF
    echo "✓ Frontend/.env created"
else
    echo "✓ Frontend/.env already exists"
fi

echo ""
echo "Installing dependencies..."

# Install backend dependencies
echo "Installing Backend dependencies..."
cd Backend
npm install
cd ..

# Install frontend dependencies
echo "Installing Frontend dependencies..."
cd Frontend
npm install
cd ..

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Import database: mysql -u root -p < Backend/si_akreditasi_new2.sql"
echo "2. Start backend: cd Backend && npm run dev"
echo "3. Start frontend: cd Frontend && npm run dev"
echo ""
echo "Backend will run on: http://localhost:3000"
echo "Frontend will run on: http://localhost:5173"
echo ""

