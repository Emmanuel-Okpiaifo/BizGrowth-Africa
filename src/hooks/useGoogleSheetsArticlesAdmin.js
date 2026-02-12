import { useState, useEffect } from 'react';
import { getSheetData } from '../utils/googleSheets';

/**
 * Hook to fetch ALL articles from Google Sheets (for admin use)
 * Includes drafts, scheduled, and published articles
 */
export function useGoogleSheetsArticlesAdmin() {
	const [articles, setArticles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const loadArticles = async () => {
		try {
			setLoading(true);
			setError(null);
			const raw = await getSheetData('Articles');
			const data = Array.isArray(raw) ? raw : [];
			
			// Transform Google Sheets data - include ALL articles (no filtering)
			const transformed = data
				.filter(article => {
					// Only filter out completely empty rows
					const hasTitle = article.title && article.title.trim() !== '';
					const hasSlug = article.slug && article.slug.trim() !== '';
					return hasTitle && hasSlug;
				})
				.map(article => {
					const articleStatus = (article.status || 'published').toLowerCase();
					
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
						publishedAt: article.publishedAt || (article.status === 'published' ? article.createdAt : '') || new Date().toISOString(),
						summary: (article.summary || article.subheading || '').trim(),
						category: (article.category || 'Uncategorized').trim(),
						subheading: (article.subheading || '').trim(),
						content: (article.content || '').trim(),
						richBody: null,
						body: null,
						author: (article.author || 'BizGrowth Africa Editorial').trim(),
						status: articleStatus, // Include status
						scheduledAt: article.scheduledAt || '', // Include scheduledAt
						createdAt: (article.createdat ?? article.createdAt ?? '').toString().trim() || ''
					};
				})
				.sort((a, b) => {
					// Sort by createdAt or publishedAt, most recent first
					const dateA = new Date(a.createdAt || a.publishedAt);
					const dateB = new Date(b.createdAt || b.publishedAt);
					return dateB - dateA;
				});
			
			setArticles(transformed);
			setError(null);
		} catch (err) {
			setError(err.message);
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
