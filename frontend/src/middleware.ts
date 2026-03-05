import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Frontend middleware:
 * 1. Root "/" → redirect to landing page (unauthenticated) or dashboard (authenticated)
 * 2. Dashboard routes → enforce authentication + role-based access
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static/public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/pwa-icons') ||
    pathname === '/favicon.ico' ||
    pathname === '/sw.js' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/manifest.json'
  ) {
    return NextResponse.next();
  }

  // Decode JWT token from cookie
  const tokenCookie = request.cookies.get('token');
  let user: {
    id: string;
    email: string;
    role: string;
    schoolId: string;
  } | null = null;

  if (tokenCookie) {
    try {
      const payload = tokenCookie.value.split('.')[1];
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
      user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        schoolId: decoded.schoolId,
      };
    } catch {
      // Invalid token — treat as unauthenticated
    }
  }

  // ──────────────────────────────────────────────
  // Root page "/" → Homepage (unauthenticated) or Dashboard (authenticated)
  // ──────────────────────────────────────────────
  if (pathname === '/') {
    if (user) {
      // Authenticated → redirect to role-appropriate dashboard
      if (user.role === 'STUDENT') {
        return NextResponse.redirect(new URL('/dashboard/student/results', request.url));
      }
      if (user.role === 'PARENT') {
        return NextResponse.redirect(new URL('/dashboard/parent/students', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Unauthenticated → show school homepage (page.tsx)
    return NextResponse.next();
  }

  // ──────────────────────────────────────────────
  // Login/public pages → always allow
  // ──────────────────────────────────────────────
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')
  ) {
    // If already authenticated on login page, redirect to dashboard
    if (user && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ──────────────────────────────────────────────
  // Dashboard routes → require authentication
  // ──────────────────────────────────────────────
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login/school', request.url));
  }

  if (user && pathname.startsWith('/dashboard')) {
    const role = user.role;

    // Student access restrictions
    if (role === 'STUDENT') {
      const allowedStudentPaths = [
        '/dashboard/student/profile',
        '/dashboard/student/results',
        '/dashboard/student-calendar',
        '/dashboard/profile',
        '/dashboard/messages',
        '/dashboard/exams/',
        '/dashboard/study-plans',
        '/dashboard/my-tasks',
        '/dashboard/achievements',
        '/dashboard/groups',
        '/dashboard/recommendations',
      ];

      const isAllowedPath = allowedStudentPaths.some((path) =>
        pathname.startsWith(path),
      );

      if (!isAllowedPath) {
        return NextResponse.redirect(
          new URL('/dashboard/student/results', request.url),
        );
      }
    }

    // Teacher access restrictions
    if (role === 'TEACHER') {
      const blockedTeacherPaths = [
        '/dashboard/students/new',
        '/dashboard/students/edit',
        '/dashboard/exams/new',
        '/dashboard/exams/edit',
        '/dashboard/import',
        '/dashboard/settings',
        '/dashboard/users',
      ];

      const isBlockedPath = blockedTeacherPaths.some((path) =>
        pathname.startsWith(path),
      );

      if (isBlockedPath) {
        return NextResponse.redirect(
          new URL('/dashboard/exams', request.url),
        );
      }
    }

    // Parent access restrictions
    if (role === 'PARENT') {
      const allowedParentPaths = [
        '/dashboard/parent/profile',
        '/dashboard/parent/students',
        '/dashboard/parent/results',
        '/dashboard/student/results',
        '/dashboard/profile',
        '/dashboard/messages',
      ];

      const isAllowedPath = allowedParentPaths.some((path) =>
        pathname.startsWith(path),
      );

      if (!isAllowedPath) {
        return NextResponse.redirect(
          new URL('/dashboard/parent/students', request.url),
        );
      }
    }

    // SCHOOL_ADMIN and SUPER_ADMIN have full access
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
