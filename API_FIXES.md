# Frontend-Backend API Fixes

## Issues Found and Fixed

### 1. Incorrect API Endpoint for Jabatan Fungsional

**Problem:**
- Frontend was calling `/api/jabatan-fungsional`
- Backend route is `/api/ref-jabatan-fungsional`
- Result: 404 Not Found error

**Fix:**
- Updated `Frontend/src/components/tables/DosenTable.jsx`
- Changed API call from `/jabatan-fungsional` to `/ref-jabatan-fungsional`

**File:** `Frontend/src/components/tables/DosenTable.jsx` (line 33)

### 2. SQL Syntax Error in Dosen Controller

**Problem:**
- SQL query had two WHERE clauses
- Line 35: `WHERE d.deleted_at IS NULL`
- Line 42-44: `WHERE u.id_unit = ?` (duplicate WHERE)
- Result: 500 Internal Server Error

**Fix:**
- Changed second WHERE to AND
- Now: `AND u.id_unit = ?`

**File:** `Backend/src/controllers/dosen.controller.js` (line 43)

## Summary

Two issues were preventing the frontend from loading data:

1. ✅ API endpoint mismatch for jabatan fungsional
2. ✅ SQL syntax error in dosen controller

Both issues have been fixed. The backend should now:
- ✅ Return data for `/api/dosen` endpoint
- ✅ Return data for `/api/ref-jabatan-fungsional` endpoint
- ✅ Work correctly with the frontend

## Testing

After restarting the backend, you should be able to:
1. Load the Dosen table without errors
2. See jabatan fungsional options in dropdowns
3. Create/edit dosen records

## Next Steps

Restart the backend server:
```bash
cd Backend
npm run dev
```

Then refresh the frontend in your browser.

