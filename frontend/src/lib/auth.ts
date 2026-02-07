/**
 * Set user data in localStorage for client-side access
 */
export function setUserData(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('auth', '1');
}

/**
 * Clear all user data from localStorage and cookies
 */
export function clearUserData() {
    if (typeof window !== 'undefined') {
        fetch('http://localhost:3001/auth/logout', { method: 'POST' });
    }

    localStorage.removeItem('user');
    localStorage.removeItem('auth');
    
    // Clear cookies
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

/**
 * Get user data from localStorage
 */
export function getUserData() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Check authentication flag
 */
export function isAuthenticated() {
    return localStorage.getItem('auth') === '1';
}
