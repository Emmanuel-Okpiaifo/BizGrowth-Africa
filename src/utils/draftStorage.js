/**
 * Draft Storage Utility
 * Manages drafts in localStorage (separate from Google Sheets)
 */

const DRAFT_STORAGE_KEY = 'bizgrowth_drafts';

/**
 * Get all drafts for a specific type (articles, opportunities, tenders)
 */
export function getDrafts(type) {
	try {
		const allDrafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || '{}');
		return allDrafts[type] || [];
	} catch (error) {
		console.error('Error reading drafts:', error);
		return [];
	}
}

/**
 * Save a draft
 * @param {string} type - 'articles', 'opportunities', or 'tenders'
 * @param {object} draftData - The draft data
 * @param {string} draftId - Optional ID for updating existing draft
 * @returns {string} The draft ID
 */
export function saveDraft(type, draftData, draftId = null) {
	try {
		const allDrafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || '{}');
		if (!allDrafts[type]) {
			allDrafts[type] = [];
		}

		const draft = {
			...draftData,
			id: draftId || draftData.id || `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			updatedAt: new Date().toISOString(),
			createdAt: draftData.createdAt || new Date().toISOString(),
			status: 'draft'
		};

		if (draftId) {
			// Update existing draft
			const index = allDrafts[type].findIndex(d => d.id === draftId);
			if (index !== -1) {
				allDrafts[type][index] = draft;
			} else {
				allDrafts[type].push(draft);
			}
		} else {
			// Create new draft
			allDrafts[type].push(draft);
		}

		localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(allDrafts));
		return draft.id;
	} catch (error) {
		console.error('Error saving draft:', error);
		throw error;
	}
}

/**
 * Get a specific draft by ID
 */
export function getDraft(type, draftId) {
	try {
		const allDrafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || '{}');
		const drafts = allDrafts[type] || [];
		return drafts.find(d => d.id === draftId);
	} catch (error) {
		console.error('Error reading draft:', error);
		return null;
	}
}

/**
 * Delete a draft
 */
export function deleteDraft(type, draftId) {
	try {
		const allDrafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || '{}');
		if (allDrafts[type]) {
			allDrafts[type] = allDrafts[type].filter(d => d.id !== draftId);
			localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(allDrafts));
		}
	} catch (error) {
		console.error('Error deleting draft:', error);
		throw error;
	}
}

/**
 * Clear all drafts for a type (or all types if type is null)
 */
export function clearDrafts(type = null) {
	try {
		if (type) {
			const allDrafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || '{}');
			allDrafts[type] = [];
			localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(allDrafts));
		} else {
			localStorage.removeItem(DRAFT_STORAGE_KEY);
		}
	} catch (error) {
		console.error('Error clearing drafts:', error);
		throw error;
	}
}
