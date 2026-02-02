import { useState, useEffect } from 'react';
import { getSheetData } from '../utils/googleSheets';

/**
 * Hook to fetch articles from Google Sheets
 * Transforms Google Sheets data into the format expected by the website
 */
export function useGoogleSheetsArticles() {
	const [articles, setArticles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const loadArticles = async () => {
		try {
			setLoading(true);
			setError(null);
			console.log('Loading articles from Google Sheets...');
			const data = await getSheetData('Articles');
			console.log('Raw data from Google Sheets:', data);
			
			// Transform Google Sheets data to match expected article format
			const transformed = data
				.filter(article => {
					// Filter out empty rows (where title might be empty)
					const hasTitle = article.title && article.title.trim() !== '';
					const hasSlug = article.slug && article.slug.trim() !== '';
					if (!hasTitle || !hasSlug) {
						console.log('Filtering out article (missing title or slug):', article);
						return false;
					}
					
					// Filter by status and scheduled time
					// Trim and normalize status field (handle whitespace, case, etc.)
					const rawStatus = article.status ? String(article.status).trim() : '';
					const articleStatus = rawStatus ? rawStatus.toLowerCase() : '';
					const scheduledAt = article.scheduledAt ? String(article.scheduledAt).trim() : '';
					
					// Debug logging (only in development)
					if (import.meta.env.DEV) {
						console.log(`[FILTER] Article "${article.title}" - Raw Status: "${rawStatus}", Normalized: "${articleStatus}", ScheduledAt: "${scheduledAt}"`);
					}
					
					// STRICT FILTERING: Only show if status is explicitly 'published'
					// OR if status is 'scheduled' AND scheduled time has passed
					
					// If status is empty or not set, DON'T show (safer default)
					if (!articleStatus || articleStatus === '') {
						if (import.meta.env.DEV) {
							console.log(`[FILTER] Filtering out article with empty status: "${article.title}"`);
						}
						return false;
					}
					
					// Don't show drafts
					if (articleStatus === 'draft') {
						if (import.meta.env.DEV) {
							console.log(`[FILTER] Filtering out draft article: "${article.title}"`);
						}
						return false;
					}
					
					// Handle scheduled posts
					if (articleStatus === 'scheduled') {
						if (!scheduledAt) {
							if (import.meta.env.DEV) {
								console.log(`[FILTER] Scheduled article "${article.title}" has no scheduledAt, filtering out`);
							}
							return false; // Scheduled but no time set - don't show
						}
						
						// Check if scheduled time has passed
						const now = new Date();
						let scheduled;
						
						// Parse scheduledAt - handle timezone
						if (scheduledAt.includes('+') || scheduledAt.includes('Z')) {
							scheduled = new Date(scheduledAt);
						} else if (scheduledAt.includes('T')) {
							// Has time but no timezone - assume UTC (since we stored it as UTC)
							scheduled = new Date(scheduledAt + 'Z');
						} else {
							// Date only - treat as midnight UTC
							scheduled = new Date(scheduledAt + 'T00:00:00Z');
						}
						
						// Validate date
						if (isNaN(scheduled.getTime())) {
							if (import.meta.env.DEV) {
								console.log(`[FILTER] Invalid scheduledAt for article "${article.title}": "${scheduledAt}"`);
							}
							return false;
						}
						
						// Compare UTC times
						const nowUTC = now.getTime();
						const scheduledUTC = scheduled.getTime();
						
						// If scheduled time hasn't passed yet, don't show
						if (nowUTC < scheduledUTC) {
							if (import.meta.env.DEV) {
								console.log(`[FILTER] Article "${article.title}" is scheduled for ${scheduledAt}, not showing yet`);
							}
							return false; // Not yet time to publish
						}
						// If time has passed, allow it through (will show as published)
					}
					
					// Only show if status is explicitly 'published' or scheduled time has passed
					if (articleStatus !== 'published' && articleStatus !== 'scheduled') {
						if (import.meta.env.DEV) {
							console.log(`[FILTER] Filtering out article with status "${articleStatus}": "${article.title}"`);
						}
						return false;
					}
					
					// Final check: if status is 'published', show it
					if (articleStatus === 'published') {
						return true;
					}
					
					// If we get here and status is 'scheduled', the time must have passed (checked above)
					return articleStatus === 'scheduled';
					
					return true;
				})
				.map(article => {
					// Log the raw article data to debug
					console.log('Processing article:', article);
					
					const heroImg = (article.heroImage || '').trim();
					const img = (article.image || '').trim();
					return {
						slug: (article.slug || '').trim(),
						title: (article.title || '').trim(),
						source: "BizGrowth Africa",
						image: img || heroImg,
						heroImage: heroImg,
						imageCandidates: [heroImg, img].filter(Boolean),
						url: `/news/${(article.slug || '').trim()}`,
						publishedAt: article.publishedAt || article.createdAt || new Date().toISOString(),
						summary: (article.summary || article.subheading || '').trim(),
						category: (article.category || 'Uncategorized').trim(),
						subheading: (article.subheading || '').trim(),
						content: (article.content || '').trim(), // HTML content from rich text editor
						richBody: null, // Will be parsed from content if needed
						body: null, // Will be parsed from content if needed
						author: (article.author || 'BizGrowth Africa Editorial').trim(),
					};
				})
				.sort((a, b) => {
					// Sort by publishedAt date, most recent first
					const dateA = new Date(a.publishedAt);
					const dateB = new Date(b.publishedAt);
					return dateB - dateA;
				});
			
			console.log('Transformed articles:', transformed);
			setArticles(transformed);
			setError(null);
		} catch (err) {
			// Only log error once, not repeatedly
			if (!error) {
				if (err.message.includes('403')) {
					console.warn('⚠️ Google Sheets API 403: Your sheet needs to be publicly readable.');
					console.warn('📖 See GOOGLE_SHEETS_API_FIX.md for fix instructions.');
					console.warn('💡 The site will continue working with static content.');
				} else {
					console.error('Failed to load articles from Google Sheets:', err);
				}
			}
			setError(err.message);
			// Fallback to empty array on error - static content will still show
			setArticles([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadArticles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { articles, loading, error, refresh: loadArticles };
}
