/**
 * Image Upload Utility
 * Handles both server-side upload and external URL validation
 */

/**
 * Upload image to server
 * @param {File} file - Image file to upload
 * @param {string} type - Content type ('articles', 'opportunities', 'tenders')
 * @returns {Promise<string>} Image URL
 */
export async function uploadImage(file, type = 'general') {
	// Validate file type
	const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
	if (!allowedTypes.includes(file.type)) {
		throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.');
	}

	// Validate file size (5MB max)
	const maxSize = 5 * 1024 * 1024; // 5MB
	if (file.size > maxSize) {
		throw new Error('File size exceeds 5MB limit.');
	}

	// Create form data
	const formData = new FormData();
	formData.append('image', file);
	formData.append('type', type);

	try {
		const response = await fetch('/api/upload-image.php', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Upload failed');
		}

		const result = await response.json();
		return result.url;
	} catch (error) {
		console.error('Image upload error:', error);
		throw error;
	}
}

/**
 * Validate external image URL
 * @param {string} url - Image URL to validate
 * @returns {Promise<boolean>} True if URL is valid and accessible
 */
export async function validateImageUrl(url) {
	if (!url || typeof url !== 'string') {
		return false;
	}

	// Basic URL validation
	try {
		new URL(url);
	} catch {
		return false;
	}

	// Check if it's an image URL
	const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
	const isImageUrl = imageExtensions.some(ext => 
		url.toLowerCase().includes(ext)
	) || url.includes('unsplash.com') || url.includes('images.unsplash.com');

	if (!isImageUrl) {
		return false;
	}

	// Try to load the image to verify it exists
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => resolve(true);
		img.onerror = () => resolve(false);
		img.src = url;
		// Timeout after 5 seconds
		setTimeout(() => resolve(false), 5000);
	});
}
