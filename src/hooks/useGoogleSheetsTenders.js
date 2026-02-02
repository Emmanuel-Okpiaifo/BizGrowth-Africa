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
					
					// Filter by status and scheduled time
					const rawStatus = tender.status ? String(tender.status).trim() : '';
					const tenderStatus = rawStatus ? rawStatus.toLowerCase() : '';
					const scheduledAt = tender.scheduledAt ? String(tender.scheduledAt).trim() : '';
					
					// STRICT FILTERING: Only show if status is explicitly 'published'
					// OR if status is 'scheduled' AND scheduled time has passed
					
					// If status is empty, don't show (safer default)
					if (!tenderStatus || tenderStatus === '') {
						return false;
					}
					
					// Don't show drafts
					if (tenderStatus === 'draft') {
						return false;
					}
					
					// Handle scheduled posts
					if (tenderStatus === 'scheduled') {
						if (!scheduledAt) {
							return false; // Scheduled but no time set
						}
						
						// Parse scheduledAt - handle timezone
						const now = new Date();
						let scheduled;
						
						if (scheduledAt.includes('+') || scheduledAt.includes('Z')) {
							scheduled = new Date(scheduledAt);
						} else if (scheduledAt.includes('T')) {
							scheduled = new Date(scheduledAt + 'Z');
						} else {
							scheduled = new Date(scheduledAt + 'T00:00:00Z');
						}
						
						if (isNaN(scheduled.getTime())) {
							return false;
						}
						
						// Compare UTC times
						const nowUTC = now.getTime();
						const scheduledUTC = scheduled.getTime();
						
						// If scheduled time hasn't passed yet, don't show
						if (nowUTC < scheduledUTC) {
							return false;
						}
					}
					
					// Only show if status is 'published' or scheduled time has passed
					return tenderStatus === 'published' || (tenderStatus === 'scheduled' && scheduledAt);
					
					return true;
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
						heroImage: (tender.heroImage || '').trim(), // Hero/banner image for hero section
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
