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
			const data = await getSheetData('Articles');
			
			// Transform Google Sheets data to match expected article format
			const transformed = data
				.filter(article => {
					// Filter out empty rows (where title might be empty)
					const hasTitle = article.title && article.title.trim() !== '';
					const hasSlug = article.slug && article.slug.trim() !== '';
					if (!hasTitle || !hasSlug) {
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
					
					// Only show when status is 'published'. Scheduled and draft never show until status changes to published.
					if (!articleStatus || articleStatus === '') {
						return false;
					}
					if (articleStatus === 'draft') {
						return false;
					}
					if (articleStatus === 'scheduled') {
						return false; // Do not show on main site until backend has changed status to published
					}
					return articleStatus === 'published';
				})
				.map(article => {
					// Sheet keys are normalized to lowercase; support "whyItMatters" and "Why It Matters" column names
					const whyItMattersRaw = article.whyitmatters ?? article['why it matters'] ?? article.whyItMatters ?? '';
					const heroImg = (article.heroimage ?? article['hero image'] ?? article.heroImage ?? '').toString().trim();
					const img = (article.image ?? '').toString().trim();
					return {
						slug: (article.slug || '').trim(),
						title: (article.title || '').trim(),
						source: "BizGrowth Africa",
						image: img || heroImg,
						heroImage: heroImg || img,
						imageCandidates: [heroImg, img].filter(Boolean),
						url: `/news/${(article.slug || '').trim()}`,
						publishedAt: article.publishedat || article.publishedAt || article.createdat || article.createdAt || new Date().toISOString(),
						summary: (article.summary || article.subheading || '').trim(),
						category: (article.category || 'Uncategorized').trim(),
						subheading: (article.subheading || '').trim(),
						content: (article.content || '').trim(),
						richBody: null,
						body: null,
						whyItMatters: (typeof whyItMattersRaw === 'string' ? whyItMattersRaw : '').trim(),
						author: (article.author || 'BizGrowth Africa Editorial').trim(),
					};
				})
				.sort((a, b) => {
					// Sort by publishedAt date, most recent first
					const dateA = new Date(a.publishedAt);
					const dateB = new Date(b.publishedAt);
					return dateB - dateA;
				});
			
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
