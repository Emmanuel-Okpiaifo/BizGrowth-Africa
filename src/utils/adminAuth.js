/**
 * Admin Authentication Utilities
 * Password verification is done server-side (api/admin-auth-check.php); no passwords stored in frontend.
 */

import { getApiBaseUrl } from './apiBaseUrl';

// Display names only (for UI); no passwords – verification is server-side
const ADMIN_USERS = [
	{ username: 'Admin', displayName: 'Admin' },
	{ username: 'Adeola', displayName: 'Adeola Ayanda' },
	{ username: 'Rachael', displayName: 'Rachael Aimola' },
	{ username: 'Mayowa', displayName: 'Oluwamayowa Adewuyi' },
	{ username: 'Eniola', displayName: 'Eniola Oyewole' },
	{ username: 'Ade', displayName: 'Ade Olowojoba' }
];

/**
 * Validate user credentials via server (checks password against hashes).
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<{ valid: boolean, username?: string }>} - { valid: true, username } on success, { valid: false } on failure
 */
export async function validateCredentials(username, password) {
	const base = getApiBaseUrl();
	const url = base ? `${base}/api/admin-auth-check.php` : '/api/admin-auth-check.php';
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: (username || '').trim(), password: password || '' })
		});
		const data = await res.json();
		if (data && data.success === true && data.username) {
			return { valid: true, username: data.username };
		}
	} catch (e) {
		// Network or parse error
	}
	return { valid: false };
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
 * Get current logged-in user display name (e.g. "Adeola Ayanda") or username if no displayName
 * @returns {string|null} - Display name or null
 */
export function getCurrentUser() {
	const raw = sessionStorage.getItem('admin_username');
	if (!raw) return null;
	const user = getUserByUsername(raw);
	return user ? (user.displayName || user.username) : raw;
}

/**
 * Whether the current user is the super admin (sees all content; others see only their own).
 * @returns {boolean}
 */
export function isSuperAdmin() {
	const raw = sessionStorage.getItem('admin_username');
	if (!raw) return false;
	return raw.trim().toLowerCase() === 'admin';
}

/**
 * Author-matching identifiers for the current user (so articles with author "Adeola" or "Adeola Ayanda" both match)
 * @returns {string[]} - Array of lowercase strings to match against article.author
 */
export function getCurrentUserIdentifiers() {
	const raw = sessionStorage.getItem('admin_username');
	if (!raw) return [];
	const user = getUserByUsername(raw);
	if (!user) return [raw.trim().toLowerCase()];
	const names = [user.username];
	if (user.displayName && user.displayName.trim() !== user.username) names.push(user.displayName.trim());
	return [...new Set(names)].map(n => n.trim().toLowerCase()).filter(Boolean);
}

/**
 * Set authentication session
 * @param {string} username - Username
 */
export function setAuthSession(username) {
	const now = Date.now().toString();
	sessionStorage.setItem('admin_authenticated', 'true');
	sessionStorage.setItem('admin_username', username);
	sessionStorage.setItem('admin_auth_time', now);
	sessionStorage.setItem('admin_last_activity', now);
}

/**
 * Update last activity timestamp (used for 4-hour inactivity logout).
 * Call on user interaction (throttled) so session stays active while in use.
 */
export function updateLastActivity() {
	if (isAuthenticated()) {
		sessionStorage.setItem('admin_last_activity', Date.now().toString());
	}
}

/**
 * Clear authentication session
 */
export function clearAuthSession() {
	sessionStorage.removeItem('admin_authenticated');
	sessionStorage.removeItem('admin_username');
	sessionStorage.removeItem('admin_auth_time');
	sessionStorage.removeItem('admin_last_activity');
}
