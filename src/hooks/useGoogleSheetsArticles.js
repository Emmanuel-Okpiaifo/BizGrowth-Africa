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
					}
					return hasTitle && hasSlug;
				})
				.map(article => {
					// Log the raw article data to debug
					console.log('Processing article:', article);
					
					return {
						slug: (article.slug || '').trim(),
						title: (article.title || '').trim(),
						source: "BizGrowth Africa",
						image: (article.image || '').trim(),
						imageCandidates: article.image && article.image.trim() ? [article.image.trim()] : [],
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
