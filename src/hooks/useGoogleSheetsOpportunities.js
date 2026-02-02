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
					if (!hasTitle) return false;
					
					// Filter by status and scheduled time
					const rawStatus = opp.status ? String(opp.status).trim() : '';
					const oppStatus = rawStatus ? rawStatus.toLowerCase() : '';
					const scheduledAt = opp.scheduledAt ? String(opp.scheduledAt).trim() : '';
					
					// If status is empty, treat as published (show alongside placeholders)
					if (!oppStatus || oppStatus === '') {
						return true;
					}
					
					// Don't show drafts
					if (oppStatus === 'draft') {
						return false;
					}
					
					// Handle scheduled posts
					if (oppStatus === 'scheduled') {
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
					return oppStatus === 'published' || (oppStatus === 'scheduled' && scheduledAt);
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
						heroImage: (opp.heroImage || '').trim(), // Hero/banner image for hero section
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
