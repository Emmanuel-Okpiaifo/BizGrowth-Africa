/**
 * Admin Authentication Utilities
 * Manages multiple user credentials
 */

// Admin users configuration
// In production, this could be loaded from environment variables or a secure API
const ADMIN_USERS = [
	{
		username: 'Admin',
		password: ']ofcwrD-!13+{v_P'
	},
	{
		username: 'Adeola',
		password: ';4WcxRwb5&VEjPFu'
	}
];

/**
 * Validate user credentials
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {boolean} - True if credentials are valid
 */
export function validateCredentials(username, password) {
	const user = ADMIN_USERS.find(
		u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
	);
	return !!user;
}

/**
 * Get user by username (case-insensitive)
 * @param {string} username - Username
 * @returns {object|null} - User object or null
 */
export function getUserByUsername(username) {
	return ADMIN_USERS.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated
 */
export function isAuthenticated() {
	return sessionStorage.getItem('admin_authenticated') === 'true';
}

/**
 * Get current logged-in username
 * @returns {string|null} - Username or null
 */
export function getCurrentUser() {
	return sessionStorage.getItem('admin_username');
}

/**
 * Set authentication session
 * @param {string} username - Username
 */
export function setAuthSession(username) {
	sessionStorage.setItem('admin_authenticated', 'true');
	sessionStorage.setItem('admin_username', username);
	sessionStorage.setItem('admin_auth_time', Date.now().toString());
}

/**
 * Clear authentication session
 */
export function clearAuthSession() {
	sessionStorage.removeItem('admin_authenticated');
	sessionStorage.removeItem('admin_username');
	sessionStorage.removeItem('admin_auth_time');
}
