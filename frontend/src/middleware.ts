import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Skip middleware for public routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/login') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // Get token from cookie and decode it to get user info
    const tokenCookie = request.cookies.get('token');
    let user = null;

    if (tokenCookie) {
        try {
            // Decode JWT token (payload is in the middle part)
            const payload = tokenCookie.value.split('.')[1];
            const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
            user = {
                id: decoded.sub,
                email: decoded.email,
                role: decoded.role,
                schoolId: decoded.schoolId
            };
        } catch (e) {
            // Invalid token, redirect to login
            return NextResponse.redirect(new URL('/login/school', request.url));
        }
    }

    // If no user found and trying to access dashboard, redirect to login
    if (!user && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login/school', request.url));
    }

    // If user exists, enforce role-based access control
    if (user && pathname.startsWith('/dashboard')) {
        const role = user.role;

        // Student access restrictions
        if (role === 'STUDENT') {
            // Students can only access their profile, results, messages, and calendar pages
            const allowedStudentPaths = [
                '/dashboard/student/profile',
                '/dashboard/student/results',
                '/dashboard/student-calendar',
                '/dashboard/profile',
                '/dashboard/messages',
                '/dashboard/exams/', // Allow viewing exam results
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

            // Teachers can access reports and messages
            if (pathname.startsWith('/dashboard/reports') || pathname.startsWith('/dashboard/messages')) {
                return NextResponse.next();
            }
        }

        // Parent access restrictions
        if (role === 'PARENT') {
            // Parents can only access their profile, students, messages, and student results pages
            const allowedParentPaths = [
                '/dashboard/parent/profile',
                '/dashboard/parent/students',
                '/dashboard/parent/results',
                '/dashboard/student/results', // Allow parents to view their students' results
                '/dashboard/profile',
                '/dashboard/messages',
            ];

            const isAllowedPath = allowedParentPaths.some(path => 
                pathname.startsWith(path)
            );

            // Block access to all other dashboard routes
            if (!isAllowedPath) {
                // Redirect to parent students page if accessing unauthorized routes
                return NextResponse.redirect(new URL('/dashboard/parent/students', request.url));
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
