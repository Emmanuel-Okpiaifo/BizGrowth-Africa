import { useState, useEffect } from 'react';
import { getSheetData } from '../utils/googleSheets';

/**
 * Hook to fetch tenders from Google Sheets
 */
export function useGoogleSheetsTenders() {
	const [tenders, setTenders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const loadTenders = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getSheetData('Tenders');
			
			// Transform Google Sheets data
			const transformed = data
				.filter(tender => {
					const hasTitle = tender.title && tender.title.trim() !== '';
					if (!hasTitle) return false;
					
					// Only show when status is 'published'. Scheduled and draft never show until status changes to published.
					const rawStatus = tender.status ? String(tender.status).trim() : '';
					const tenderStatus = rawStatus ? rawStatus.toLowerCase() : '';

					if (!tenderStatus || tenderStatus === '') return true; // No status: treat as published (legacy)
					if (tenderStatus === 'draft') return false;
					if (tenderStatus === 'scheduled') return false; // Do not show until status is published
					return tenderStatus === 'published';
				})
				.map(tender => {
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
						heroImage: (tender.heroimage ?? tender['hero image'] ?? tender.heroImage ?? '').toString().trim(), // Uploaded image from admin (sheet keys are lowercase)
						createdAt: tender.createdAt || new Date().toISOString()
					};
				})
				.sort((a, b) => {
					// Sort by postedAt date, most recent first
					const dateA = new Date(a.postedAt);
					const dateB = new Date(b.postedAt);
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
