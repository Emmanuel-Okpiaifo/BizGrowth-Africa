import { useState, useEffect } from 'react';
import { getSheetData } from '../utils/googleSheets';

/**
 * Hook to fetch ALL tenders from Google Sheets (for admin use)
 * Includes drafts, scheduled, and published tenders
 */
export function useGoogleSheetsTendersAdmin() {
	const [tenders, setTenders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const loadTenders = async () => {
		try {
			setLoading(true);
			setError(null);
			const raw = await getSheetData('Tenders');
			const data = Array.isArray(raw) ? raw : [];
			
			const transformed = data
				.filter(tender => {
					const hasTitle = tender.title && tender.title.trim() !== '';
					return hasTitle;
				})
				.map(tender => {
					const tenderStatus = (tender.status || 'published').toLowerCase();
					
					return {
						id: tender.id || `tender-${tender.title?.toLowerCase().replace(/\s+/g, '-')}`,
						title: (tender.title || '').trim(),
						agency: (tender.agency || '').trim(),
						category: (tender.category || '').trim(),
						country: (tender.country || '').trim(),
						region: (tender.region || '').trim(),
						deadline: tender.deadline || '',
						postedAt: tender.postedAt || tender.createdAt || new Date().toISOString().split('T')[0],
						link: (tender.link || '').trim(),
						description: (tender.description || '').trim(),
						eligibility: (tender.eligibility || '').trim(),
						value: (tender.value || '').trim(),
						heroImage: (tender.heroImage || '').trim(), // Hero/banner image
						author: (tender.author || '').trim(), // From sheet (for per-user filtering in admin)
						status: tenderStatus, // Include status
						scheduledAt: tender.scheduledAt || '', // Include scheduledAt
						createdAt: (tender.createdat ?? tender.createdAt ?? '').toString().trim() || ''
					};
				})
				.sort((a, b) => {
					const dateA = new Date(a.createdAt || a.postedAt);
					const dateB = new Date(b.createdAt || b.postedAt);
					return dateB - dateA;
				});
			
			setTenders(transformed);
			setError(null);
		} catch (err) {
			console.error('Failed to load tenders from Google Sheets:', err);
			setError(err.message);
			setTenders([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadTenders();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { tenders, loading, error, refresh: loadTenders };
}
