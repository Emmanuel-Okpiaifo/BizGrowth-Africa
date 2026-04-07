import { useState, useEffect } from 'react';
import { getSheetData } from '../utils/googleSheets';
import { getSortableTimestamp } from '../utils/timeUtils';

/**
 * Hook to fetch ALL procurements from Google Sheets (for admin use)
 */
export function useGoogleSheetsProcurementsAdmin() {
	const [procurements, setProcurements] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const loadProcurements = async () => {
		try {
			setLoading(true);
			setError(null);
			const raw = await getSheetData('Procurements');
			const data = Array.isArray(raw) ? raw : [];

			const transformed = data
				.filter((item) => item.title && item.title.trim() !== '')
				.map((item) => {
					const status = (item.status || 'published').toLowerCase();
					return {
						id: item.id || `proc-${item.title?.toLowerCase().replace(/\s+/g, '-')}`,
						type: 'procurement',
						title: (item.title || '').trim(),
						agency: (item.agency || '').trim(),
						category: (item.category || '').trim(),
						subCategory: (item.subcategory || item.subCategory || '').trim(),
						country: (item.country || '').trim(),
						region: (item.region || '').trim(),
						deadline: item.deadline || '',
						postedAt: item.postedAt || item.createdAt || '',
						link: (item.link || '').trim(),
						reference: (item.reference || '').trim(),
						quickSummary: (item.quicksummary || item.quickSummary || '').trim(),
						overview: (item.overview || '').trim(),
						whoCanApply: (item.whocanapply || item.whoCanApply || '').trim(),
						scopeOfWork: (item.scopeofwork || item.scopeOfWork || '').trim(),
						requirements: (item.requirements || '').trim(),
						applicationProcess: (item.applicationprocess || item.applicationProcess || '').trim(),
						description: (item.description || '').trim(),
						eligibility: (item.eligibility || '').trim(),
						value: (item.value || '').trim(),
						author: (item.author || '').trim(),
						status,
						scheduledAt: item.scheduledAt || '',
						heroImage: (item.heroimage ?? item['hero image'] ?? item.heroImage ?? '').toString().trim(),
						createdAt: (item.createdat ?? item.createdAt ?? '').toString().trim() || ''
					};
				})
				.sort((a, b) => {
					const diff = getSortableTimestamp(b.createdAt || b.postedAt) - getSortableTimestamp(a.createdAt || a.postedAt);
					if (diff !== 0) return diff;
					return (a.title || '').localeCompare(b.title || '');
				});

			setProcurements(transformed);
			setError(null);
		} catch (err) {
			console.error('Failed to load procurements from Google Sheets:', err);
			setError(err.message);
			setProcurements([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadProcurements();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { procurements, loading, error, refresh: loadProcurements };
}
