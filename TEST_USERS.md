# Test Users & Login Guide

## Created Test Users

✅ All users have been created successfully with hashed passwords!

### 🏫 School Admin
- **Email:** admin@test.com  
- **Password:** 1234  
- **Login Page:** http://localhost:3000/login/school

### 👨‍🏫 Teacher
- **Email:** teacher@test.com  
- **Password:** 1234  
- **Login Page:** http://localhost:3000/login/school

### 🎓 Student
- **Student Number:** 2024001  
- **Password:** 1234  
- **Login Page:** http://localhost:3000/login/student

### 👨‍👩‍👧 Parent
- **Student Number:** 2024001 *(child's student number)*  
- **Password:** 1234  
- **Login Page:** http://localhost:3000/login/parent

## How to Test

1. **Open homepage:** http://localhost:3000
2. **Click** on one of the login buttons
3. **Enter credentials** from above
4. **Click "Giriş Yap"**

## Important Changes

- ✅ Parent login now uses **student number** (not email)
- ✅ All passwords are **bcrypt hashed** in database
- ✅ CORS enabled for frontend
- ✅ JWT authentication working

## Run Seed Again

If you need to recreate/update test users:
```bash
cd backend
npm run seed
```
