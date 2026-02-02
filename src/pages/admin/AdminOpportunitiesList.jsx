import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Search, Edit, Trash2, Eye, RefreshCw, Loader2, Calendar, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { useGoogleSheetsOpportunitiesAdmin } from '../../hooks/useGoogleSheetsOpportunitiesAdmin';
import { deleteSheetRow, getSheetData } from '../../utils/googleSheets';
import { getDrafts, deleteDraft } from '../../utils/draftStorage';

export default function AdminOpportunitiesList() {
	const [searchQuery, setSearchQuery] = useState('');
	const [filter, setFilter] = useState('all'); // all, published, draft, scheduled
	const [deletingId, setDeletingId] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);
	const { opportunities: allOpportunities, loading, error, refresh } = useGoogleSheetsOpportunitiesAdmin();
	const [localDrafts, setLocalDrafts] = useState([]);

	// Load drafts from localStorage
	useEffect(() => {
		const loadDrafts = () => {
			const drafts = getDrafts('opportunities');
			setLocalDrafts(drafts.map(draft => ({
				...draft,
				id: draft.id,
				isDraft: true,
				status: 'draft'
			})));
		};
		loadDrafts();
		// Refresh drafts every 5 seconds to catch updates
		const interval = setInterval(loadDrafts, 5000);
		return () => clearInterval(interval);
	}, []);

	// Auto-refresh Google Sheets data every 30 seconds to catch status updates
	useEffect(() => {
		const interval = setInterval(() => {
			refresh();
		}, 30000); // Refresh every 30 seconds
		return () => clearInterval(interval);
	}, [refresh]);

	// Combine Google Sheets opportunities with localStorage drafts
	const allOpportunitiesCombined = [
		...allOpportunities.map(opp => ({ ...opp, isDraft: false })),
		...localDrafts
	];

	const filteredOpportunities = allOpportunitiesCombined.filter(opp => {
		const matchesSearch = opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			opp.org?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			opp.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			opp.country?.toLowerCase().includes(searchQuery.toLowerCase());
		
		// Get status from opportunity, ensuring it's a string
		const rawStatus = opp.status ? String(opp.status).trim() : '';
		const oppStatus = rawStatus ? rawStatus.toLowerCase() : 'published';
		const matchesFilter = filter === 'all' || 
			(filter === 'published' && oppStatus === 'published') ||
			(filter === 'draft' && oppStatus === 'draft') ||
			(filter === 'scheduled' && oppStatus === 'scheduled');
		
		return matchesSearch && matchesFilter;
	});

	const handleDelete = async (opportunity, index) => {
		try {
			// If it's a localStorage draft, delete from localStorage
			if (opportunity.isDraft) {
				deleteDraft('opportunities', opportunity.id);
				setLocalDrafts(prev => prev.filter(d => d.id !== opportunity.id));
				setDeleteConfirm(null);
				return;
			}

			// Otherwise, delete from Google Sheets
			// Get all opportunities from Google Sheets to find the correct row index
			const sheetData = await getSheetData('Opportunities');
			const oppIndex = sheetData.findIndex((o) => {
				const oppTitle = (o.title || '').trim();
				return oppTitle === opportunity.title;
			});

			if (oppIndex === -1) {
				alert('Opportunity not found in Google Sheets');
				return;
			}

			// Row index is 1-based (1 = first data row after header)
			const rowIndex = oppIndex + 1;
			setDeletingId(opportunity.id || index);

			const success = await deleteSheetRow('Opportunities', rowIndex);

			if (success) {
				// Refresh the list
				await refresh();
				setDeleteConfirm(null);
			} else {
				alert('Failed to delete opportunity. Please try again.');
			}
		} catch (error) {
			console.error('Error deleting opportunity:', error);
			alert('An error occurred while deleting the opportunity.');
		} finally {
			setDeletingId(null);
		}
	};

	const formatAmount = (min, max, currency = 'USD') => {
		if ((min ?? 0) === 0 && (max ?? 0) === 0) return 'Not specified';
		const fmt = (v) => (typeof v === 'number' ? v.toLocaleString() : '');
		if (min && max && min !== max) return `${currency} ${fmt(min)}–${fmt(max)}`;
		const val = max || min || 0;
		return `${currency} ${fmt(val)}`;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Opportunities</h1>
					<p className="text-gray-600 dark:text-gray-400">Manage funding and grant opportunities</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						onClick={refresh}
						disabled={loading}
						className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
						title="Refresh opportunities"
					>
						<RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
						Refresh
					</button>
					<Link
						to="/opportunities/new"
						className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition shadow-lg"
					>
						<Plus size={20} />
						Create Opportunity
					</Link>
				</div>
			</div>
			
			{error && (
				<div className="rounded-lg p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
					<p className="text-sm text-red-800 dark:text-red-300">
						⚠️ Error loading opportunities: {error}. Check console for details.
					</p>
				</div>
			)}

			{/* Search and Filter */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="flex-1 relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search opportunities..."
						className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
					/>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => setFilter('all')}
						className={`px-4 py-3 rounded-lg border font-medium transition ${
							filter === 'all'
								? 'bg-primary text-white border-primary'
								: 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
						}`}
					>
						All
					</button>
					<button
						onClick={() => setFilter('published')}
						className={`px-4 py-3 rounded-lg border font-medium transition ${
							filter === 'published'
								? 'bg-primary text-white border-primary'
								: 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
						}`}
					>
						Published
					</button>
					<button
						onClick={() => setFilter('draft')}
						className={`px-4 py-3 rounded-lg border font-medium transition ${
							filter === 'draft'
								? 'bg-primary text-white border-primary'
								: 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
						}`}
					>
						Draft
					</button>
					<button
						onClick={() => setFilter('scheduled')}
						className={`px-4 py-3 rounded-lg border font-medium transition ${
							filter === 'scheduled'
								? 'bg-primary text-white border-primary'
								: 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
						}`}
					>
						Scheduled
					</button>
				</div>
			</div>

			{/* Opportunities Grid */}
			{loading ? (
				<div className="text-center py-12">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					<p className="mt-4 text-gray-600 dark:text-gray-400">Loading opportunities...</p>
				</div>
			) : filteredOpportunities.length === 0 ? (
				<div className="text-center py-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220]">
					<Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-600 dark:text-gray-400">No opportunities found</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredOpportunities.map((opp, idx) => (
						<div
							key={idx}
							className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] shadow-sm hover:shadow-xl transition-all"
						>
							{/* Content */}
							<div className="p-6">
								<div className="flex items-start justify-between gap-3 mb-3">
									<span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
										{opp.category || 'Uncategorized'}
									</span>
									<div className="flex items-center gap-2">
										{(() => {
											const status = (opp.status || 'published').toLowerCase();
											if (status === 'published') {
												return (
													<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300">
														<CheckCircle2 size={14} />
														Published
													</span>
												);
											} else if (status === 'scheduled') {
												return (
													<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
														<Calendar size={14} />
														Scheduled
													</span>
												);
											} else {
												return (
													<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
														<Clock size={14} />
														Draft
													</span>
												);
											}
										})()}
										{opp.featured && (
											<span className="px-2 py-1 rounded text-xs font-semibold bg-primary/10 text-primary">
												Featured
											</span>
										)}
									</div>
								</div>

								<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition">
									{opp.title}
								</h3>

								{opp.org && (
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
										{opp.org}
									</p>
								)}

								{opp.status === 'scheduled' && opp.scheduledAt && (
									<p className="text-xs text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
										<Calendar size={12} />
										Scheduled: {new Date(opp.scheduledAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'short', timeStyle: 'short' })} (GMT+1)
									</p>
								)}
								
								<div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
									{opp.country && (
										<div className="flex items-center gap-2">
											<MapPin size={14} />
											<span>{opp.country}{opp.region && `, ${opp.region}`}</span>
										</div>
									)}
									{opp.deadline && (
										<div className="flex items-center gap-2">
											<Calendar size={14} />
											<span>{new Date(opp.deadline).toLocaleDateString()}</span>
										</div>
									)}
									<div className="font-semibold text-emerald-600 dark:text-emerald-400">
										{formatAmount(opp.amountMin, opp.amountMax, opp.currency)}
									</div>
								</div>

								{/* Actions */}
								<div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
									{opp.isDraft ? (
										<Link
											to={`/opportunities/new/${opp.id}`}
											className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition text-sm font-medium"
										>
											<Edit size={16} />
											Edit
										</Link>
									) : (
										<a
											href={`https://bizgrowthafrica.com/opportunities/${opp.id || idx}`}
											target="_blank"
											rel="noopener noreferrer"
											className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white transition text-sm font-medium"
										>
											<Eye size={16} />
											View
										</a>
									)}
									<button 
										onClick={() => setDeleteConfirm(opp.id || idx)}
										disabled={deletingId === (opp.id || idx)}
										className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{deletingId === (opp.id || idx) ? (
											<Loader2 size={16} className="animate-spin" />
										) : (
											<Trash2 size={16} />
										)}
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{deleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
					<div className="bg-white dark:bg-[#0B1220] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
							Delete Opportunity?
						</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-6">
							This action cannot be undone. The opportunity will be permanently deleted from Google Sheets.
						</p>
						<div className="flex gap-3">
							<button
								onClick={() => setDeleteConfirm(null)}
								className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
							>
								Cancel
							</button>
							<button
								onClick={() => {
									const opp = allOpportunities.find(o => (o.id || '') === deleteConfirm || o === deleteConfirm);
									if (opp) {
										const index = allOpportunities.indexOf(opp);
										handleDelete(opp, index);
									}
								}}
								disabled={deletingId === deleteConfirm}
								className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
							>
								{deletingId === deleteConfirm ? (
									<>
										<Loader2 size={16} className="animate-spin" />
										Deleting...
									</>
								) : (
									<>
										<Trash2 size={16} />
										Delete
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
