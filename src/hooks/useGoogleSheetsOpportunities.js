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
					const hasTitle = opp.title && opp.title.trim() !== '';
					return hasTitle;
				})
				.map(opp => {
					// Parse tags if it's a JSON string
					let tags = [];
					if (opp.tags) {
						try {
							tags = JSON.parse(opp.tags);
						} catch {
							// If not JSON, try comma-separated
							tags = opp.tags.split(',').map(t => t.trim()).filter(Boolean);
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
