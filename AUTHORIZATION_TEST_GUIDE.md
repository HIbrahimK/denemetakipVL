# Authorization Testing Guide

## Overview
This document outlines the testing steps to verify that the authorization security fixes are working correctly.

## What Was Fixed

### Backend Changes
1. **ExamsController** - Added JWT auth and role-based guards
   - Students: NO ACCESS to any exam endpoints
   - Teachers: READ-ONLY access (GET endpoints only)
   - School Admins: FULL ACCESS

2. **ImportController** - Admin-only access
   - Students: NO ACCESS
   - Teachers: NO ACCESS  
   - School Admins: FULL ACCESS

3. **SchoolsController** - All endpoints now require authentication
   - All roles can GET school info
   - Only admins can PUT/POST

4. **StudentsService** - Resource ownership validation
   - Students can ONLY access their own exam results
   - Teachers/Admins can access any student's results
   - Attempting to access other students' data returns 403 Forbidden

### Frontend Changes
1. **Next.js Middleware** - Route-level protection
   - Students: Restricted to `/dashboard/student/profile` and `/dashboard/student/results`
   - Teachers: Cannot access student/exam creation, import, or settings
   - Admins: Full access to all routes

2. **Auth Utility** - Cookie-based authentication
   - User data stored in both localStorage and cookies
   - Middleware reads from cookies for server-side validation

## Test Scenarios

### Test 1: Student Access Restrictions

#### Backend API Tests
```bash
# Login as student first
POST http://localhost:3001/auth/login-student
{
  "studentNumber": "123456",
  "password": "password123"
}
# Save the access_token from response

# Try to access exam statistics (SHOULD FAIL - 403)
GET http://localhost:3001/exams/EXAM_ID/statistics
Authorization: Bearer <student_token>
# Expected: 403 Forbidden

# Try to access own results (SHOULD SUCCEED)
GET http://localhost:3001/students/me/exams
Authorization: Bearer <student_token>
# Expected: 200 OK with own exam results

# Try to access another student's results (SHOULD FAIL - 403)
GET http://localhost:3001/students/OTHER_STUDENT_ID/exams
Authorization: Bearer <student_token>
# Expected: 403 Forbidden with message "Öğrenciler sadece kendi sonuçlarını görüntüleyebilir"

# Try to create an exam (SHOULD FAIL - 403)
POST http://localhost:3001/exams
Authorization: Bearer <student_token>
# Expected: 403 Forbidden

# Try to import data (SHOULD FAIL - 403)
POST http://localhost:3001/import/upload
Authorization: Bearer <student_token>
# Expected: 403 Forbidden
```

#### Frontend Route Tests
1. Login as student at: `http://localhost:3000/login/student`
2. Try to navigate to: `http://localhost:3000/dashboard/exams/EXAM_ID/results`
   - **Expected**: Redirect to `/dashboard/student/results`
3. Try to navigate to: `http://localhost:3000/dashboard/students`
   - **Expected**: Redirect to `/dashboard/student/results`
4. Try to navigate to: `http://localhost:3000/dashboard/import`
   - **Expected**: Redirect to `/dashboard/student/results`
5. Navigate to: `http://localhost:3000/dashboard/student/results`
   - **Expected**: SUCCESS - Shows own results only
6. Navigate to: `http://localhost:3000/dashboard/student/profile`
   - **Expected**: SUCCESS - Shows own profile

### Test 2: Teacher Access Restrictions

#### Backend API Tests
```bash
# Login as teacher first
POST http://localhost:3001/auth/login-school
{
  "email": "teacher@school.com",
  "password": "password123"
}

# Try to view exams list (SHOULD SUCCEED)
GET http://localhost:3001/exams?schoolId=SCHOOL_ID
Authorization: Bearer <teacher_token>
# Expected: 200 OK

# Try to view exam statistics (SHOULD SUCCEED)
GET http://localhost:3001/exams/EXAM_ID/statistics
Authorization: Bearer <teacher_token>
# Expected: 200 OK

# Try to create an exam (SHOULD FAIL - 403)
POST http://localhost:3001/exams
Authorization: Bearer <teacher_token>
# Expected: 403 Forbidden

# Try to delete an exam (SHOULD FAIL - 403)
DELETE http://localhost:3001/exams/EXAM_ID
Authorization: Bearer <teacher_token>
# Expected: 403 Forbidden

# Try to import data (SHOULD FAIL - 403)
POST http://localhost:3001/import/upload
Authorization: Bearer <teacher_token>
# Expected: 403 Forbidden

# Try to view any student's results (SHOULD SUCCEED)
GET http://localhost:3001/students/STUDENT_ID/exams
Authorization: Bearer <teacher_token>
# Expected: 200 OK
```

#### Frontend Route Tests
1. Login as teacher at: `http://localhost:3000/login/school`
2. Navigate to: `http://localhost:3000/dashboard/exams`
   - **Expected**: SUCCESS - Can view exam list
3. Navigate to: `http://localhost:3000/dashboard/exams/EXAM_ID/results`
   - **Expected**: SUCCESS - Can view all student results
4. Try to navigate to: `http://localhost:3000/dashboard/exams/new`
   - **Expected**: Redirect to `/dashboard/exams`
5. Try to navigate to: `http://localhost:3000/dashboard/students/new`
   - **Expected**: Redirect to `/dashboard/exams`
6. Try to navigate to: `http://localhost:3000/dashboard/import`
   - **Expected**: Redirect to `/dashboard/exams`
7. Try to navigate to: `http://localhost:3000/dashboard/settings`
   - **Expected**: Redirect to `/dashboard/exams`

### Test 3: Admin Full Access

#### Backend API Tests
```bash
# Login as admin
POST http://localhost:3001/auth/login-school
{
  "email": "admin@school.com",
  "password": "password123"
}

# All operations should succeed
GET http://localhost:3001/exams
POST http://localhost:3001/exams
PATCH http://localhost:3001/exams/EXAM_ID
DELETE http://localhost:3001/exams/EXAM_ID
GET http://localhost:3001/exams/EXAM_ID/statistics
POST http://localhost:3001/import/upload
GET http://localhost:3001/students/STUDENT_ID/exams
```

#### Frontend Route Tests
1. Login as admin at: `http://localhost:3000/login/school`
2. Try all routes - all should be accessible:
   - `/dashboard`
   - `/dashboard/exams`
   - `/dashboard/exams/new`
   - `/dashboard/exams/EXAM_ID/results`
   - `/dashboard/students`
   - `/dashboard/students/new`
   - `/dashboard/import`
   - `/dashboard/settings`

### Test 4: Unauthenticated Access

#### Backend API Tests
```bash
# Try to access protected endpoints without token (SHOULD ALL FAIL - 401)
GET http://localhost:3001/exams
# Expected: 401 Unauthorized

GET http://localhost:3001/students/me/exams
# Expected: 401 Unauthorized
```

#### Frontend Route Tests
1. Without logging in, try to navigate to: `http://localhost:3000/dashboard`
   - **Expected**: Redirect to `/login`
2. Without logging in, try to navigate to: `http://localhost:3000/dashboard/exams`
   - **Expected**: Redirect to `/login`

## Expected Error Messages

- **401 Unauthorized**: "Unauthorized" (No valid JWT token)
- **403 Forbidden (Student accessing others' data)**: "Öğrenciler sadece kendi sonuçlarını görüntüleyebilir"
- **403 Forbidden (General)**: "Bu kaynağa erişim yetkiniz yok" or default Forbidden message

## Files Modified

### Backend
- `backend/src/exams/exams.controller.ts` - Added guards and role restrictions
- `backend/src/import/import.controller.ts` - Added admin-only access
- `backend/src/schools/schools.controller.ts` - Added authentication to GET endpoints
- `backend/src/students/students.controller.ts` - Pass user to service for ownership check
- `backend/src/students/students.service.ts` - Added ownership validation logic

### Frontend
- `frontend/src/middleware.ts` - NEW: Route protection middleware
- `frontend/src/lib/auth.ts` - NEW: Auth utility functions with cookie support
- `frontend/src/app/login/school/page.tsx` - Use auth utility
- `frontend/src/app/login/student/page.tsx` - Use auth utility
- `frontend/src/app/login/parent/page.tsx` - Use auth utility
- `frontend/src/app/dashboard/layout.tsx` - Use clearUserData utility

## Important Notes

1. **Prisma Client**: After backend changes, regenerate Prisma client:
   ```bash
   cd backend
   npx prisma generate
   ```

2. **Test Users**: Ensure you have test users with different roles:
   - Student user
   - Teacher user (role: 'TEACHER')
   - Admin user (role: 'SCHOOL_ADMIN')

3. **Browser Cache**: Clear browser cookies/localStorage when testing to ensure clean state

4. **API vs Route Protection**: Both layers must be tested:
   - Frontend middleware prevents UI navigation
   - Backend guards prevent direct API calls
   - A determined user can bypass frontend, so backend security is critical
