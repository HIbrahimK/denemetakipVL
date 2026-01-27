/**
 * Set user data in both localStorage and cookie for middleware access
 */
export function setUserData(user: any, token: string) {
    // Store in localStorage for client-side access
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Store user in cookie for middleware access
    document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
}

/**
 * Clear all user data from localStorage and cookies
 */
export function clearUserData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear cookies
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

/**
 * Get user data from localStorage
 */
export function getUserData() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Get token from localStorage
 */
export function getToken() {
    return localStorage.getItem('token');
}
