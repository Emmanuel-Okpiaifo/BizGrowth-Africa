import { useState, useEffect } from 'react';
import { getSheetData } from '../utils/googleSheets';

/**
 * Hook to fetch opportunities from Google Sheets
 */
export function useGoogleSheetsOpportunities() {
	const [opportunities, setOpportunities] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const loadOpportunities = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getSheetData('Opportunities');
			
			// Transform Google Sheets data
			const transformed = data
				.filter(opp => {
					const hasTitle = opp.title && String(opp.title).trim() !== '';
					if (!hasTitle) return false;

					// Only show when status is 'published'. Scheduled and draft never show until status changes to published.
					const rawStatus = (opp.status != null && opp.status !== '') ? String(opp.status).trim() : '';
					const oppStatus = rawStatus.toLowerCase();

					if (!oppStatus) return true; // No status: treat as published (legacy rows)
					if (oppStatus === 'draft') return false;
					if (oppStatus === 'scheduled') return false; // Do not show until status is published
					return oppStatus === 'published';
				})
				.map(opp => {
					// Parse tags (may be JSON string, comma-separated string, or already array from sheet)
					let tags = [];
					const rawTags = opp.tags;
					if (rawTags != null && rawTags !== '') {
						if (Array.isArray(rawTags)) {
							tags = rawTags.filter(Boolean);
						} else if (typeof rawTags === 'string') {
							try {
								const parsed = JSON.parse(rawTags);
								tags = Array.isArray(parsed) ? parsed : rawTags.split(',').map(t => String(t).trim()).filter(Boolean);
							} catch {
								tags = rawTags.split(',').map(t => String(t).trim()).filter(Boolean);
							}
						}
					}
					
					return {
						id: opp.id || `opp-${opp.title?.toLowerCase().replace(/\s+/g, '-')}`,
						title: (opp.title || '').trim(),
						org: (opp.org || '').trim(),
						country: (opp.country || '').trim(),
						region: (opp.region || '').trim(),
						category: (opp.category || '').trim(),
						amountMin: parseFloat(opp.amountMin) || 0,
						amountMax: parseFloat(opp.amountMax) || 0,
						currency: (opp.currency || 'USD').trim(),
						deadline: opp.deadline || '',
						postedAt: opp.postedAt || opp.createdAt || new Date().toISOString().split('T')[0],
						link: (opp.link || '').trim(),
						tags: tags,
						heroImage: (opp.heroimage ?? opp['hero image'] ?? opp.heroImage ?? '').toString().trim(), // Uploaded image from admin (sheet keys are lowercase)
						featured: opp.featured === 'true' || opp.featured === true,
						description: (opp.description || '').trim(),
						createdAt: opp.createdAt || new Date().toISOString()
					};
				})
				.sort((a, b) => {
					// Sort by postedAt date, most recent first
					const dateA = new Date(a.postedAt);
					const dateB = new Date(b.postedAt);
					return dateB - dateA;
				});
			
			setOpportunities(transformed);
			setError(null);
		} catch (err) {
			console.error('Failed to load opportunities from Google Sheets:', err);
			setError(err.message);
			setOpportunities([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadOpportunities();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { opportunities, loading, error, refresh: loadOpportunities };
}
