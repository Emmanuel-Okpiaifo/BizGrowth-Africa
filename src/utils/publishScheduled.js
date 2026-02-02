/**
 * Client-side helper to publish scheduled posts
 * Can be called manually from admin dashboard or automatically
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://www.bizgrowthafrica.com';

/**
 * Publish scheduled posts that are due
 * @returns {Promise<Object>} Result with published count and errors
 */
export async function publishScheduledPosts() {
	try {
		const response = await fetch(`${API_BASE_URL}/api/publish-scheduled.php`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error: ${response.status}`);
		}

		const result = await response.json();
		return result;
	} catch (error) {
		console.error('Error publishing scheduled posts:', error);
		return {
			published: 0,
			errors: [error.message],
			timestamp: new Date().toISOString()
		};
	}
}
