import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Skip middleware for public routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname === '/login' ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // Get user from cookie or local storage (we'll check cookie first)
    const userCookie = request.cookies.get('user');
    let user = null;

    if (userCookie) {
        try {
            user = JSON.parse(userCookie.value);
        } catch (e) {
            // Invalid cookie, redirect to login
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // If no user found and trying to access dashboard, redirect to login
    if (!user && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If user exists, enforce role-based access control
    if (user && pathname.startsWith('/dashboard')) {
        const role = user.role;

        // Student access restrictions
        if (role === 'STUDENT') {
            // Students can only access their profile and results pages
            const allowedStudentPaths = [
                '/dashboard/student/profile',
                '/dashboard/student/results',
            ];

            const isAllowedPath = allowedStudentPaths.some(path => 
                pathname.startsWith(path)
            );

            // Block access to all other dashboard routes
            if (!isAllowedPath) {
                return NextResponse.redirect(new URL('/dashboard/student/results', request.url));
            }
        }

        // Teacher access restrictions
        if (role === 'TEACHER') {
            // Teachers cannot access these admin-only routes
            const blockedTeacherPaths = [
                '/dashboard/students/new',
                '/dashboard/students/edit',
                '/dashboard/exams/new',
                '/dashboard/exams/edit',
                '/dashboard/import',
                '/dashboard/settings',
                '/dashboard/users',
            ];

            const isBlockedPath = blockedTeacherPaths.some(path => 
                pathname.startsWith(path)
            );

            if (isBlockedPath) {
                return NextResponse.redirect(new URL('/dashboard/exams', request.url));
            }
        }

        // SCHOOL_ADMIN and SUPER_ADMIN have full access
        // No restrictions needed
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
