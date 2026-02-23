import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus, Search, Edit, Trash2, Eye, RefreshCw, Loader2, Calendar, MapPin, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGoogleSheetsTendersAdmin } from '../../hooks/useGoogleSheetsTendersAdmin';
import { deleteSheetRow, getSheetData } from '../../utils/googleSheets';
import { getDrafts, deleteDraft } from '../../utils/draftStorage';
import { isSuperAdmin, getCurrentUserIdentifiers } from '../../utils/adminAuth';
import { formatCreatedAt } from '../../utils/timeUtils';

const PER_PAGE = 12;

export default function AdminTendersList() {
	const [searchQuery, setSearchQuery] = useState('');
	const [filter, setFilter] = useState('all'); // all, published, draft, scheduled
	const [page, setPage] = useState(1);
	const [deletingId, setDeletingId] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);
	const { tenders: allTenders, loading, error, refresh } = useGoogleSheetsTendersAdmin();
	const [localDrafts, setLocalDrafts] = useState([]);

	// Load drafts from localStorage
	useEffect(() => {
		const loadDrafts = () => {
			const drafts = getDrafts('tenders');
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

	// Combine Google Sheets tenders with localStorage drafts
	const allTendersCombined = [
		...allTenders.map(tender => ({ ...tender, isDraft: false })),
		...localDrafts
	];

	// Restrict to current user's items (Admin sees all; items without author visible only to Admin)
	const authorIds = getCurrentUserIdentifiers();
	const tendersForUser = isSuperAdmin()
		? allTendersCombined
		: allTendersCombined.filter(tender => {
				const author = (tender.author || '').trim().toLowerCase();
				return author && authorIds.includes(author);
			});

	const filteredTenders = tendersForUser.filter(tender => {
		const matchesSearch = tender.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			tender.agency?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			tender.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			tender.country?.toLowerCase().includes(searchQuery.toLowerCase());
		
		// Get status from tender, ensuring it's a string
		const rawStatus = tender.status ? String(tender.status).trim() : '';
		const tenderStatus = rawStatus ? rawStatus.toLowerCase() : 'published';
		const matchesFilter = filter === 'all' || 
			(filter === 'published' && tenderStatus === 'published') ||
			(filter === 'draft' && tenderStatus === 'draft') ||
			(filter === 'scheduled' && tenderStatus === 'scheduled');
		
		return matchesSearch && matchesFilter;
	});

	// Sort by most recently published (postedAt > publishedAt > createdAt)
	const sortedTenders = [...filteredTenders].sort((a, b) => {
		const dateA = new Date(a.postedAt || a.publishedAt || a.createdAt || 0).getTime();
		const dateB = new Date(b.postedAt || b.publishedAt || b.createdAt || 0).getTime();
		return dateB - dateA;
	});

	const totalPages = Math.max(1, Math.ceil(sortedTenders.length / PER_PAGE));
	const currentPage = Math.min(page, totalPages);
	const paged = sortedTenders.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

	useEffect(() => setPage(1), [filter, searchQuery]);
	useEffect(() => { if (page > totalPages && totalPages >= 1) setPage(totalPages); }, [totalPages, page]);

	const handleDelete = async (tender, index) => {
		try {
			// If it's a localStorage draft, delete from localStorage
			if (tender.isDraft) {
				deleteDraft('tenders', tender.id);
				setLocalDrafts(prev => prev.filter(d => d.id !== tender.id));
				setDeleteConfirm(null);
				return;
			}

			// Otherwise, delete from Google Sheets
			// Get all tenders from Google Sheets to find the correct row index
			const sheetData = await getSheetData('Tenders');
			const tenderIndex = sheetData.findIndex((t) => {
				const tenderTitle = (t.title || '').trim();
				return tenderTitle === tender.title;
			});

			if (tenderIndex === -1) {
				alert('Tender not found in Google Sheets');
				return;
			}

			// Row index is 1-based (1 = first data row after header)
			const rowIndex = tenderIndex + 1;
			setDeletingId(tender.id || index);

			const success = await deleteSheetRow('Tenders', rowIndex);

			if (success) {
				// Refresh the list
				await refresh();
				setDeleteConfirm(null);
			} else {
				alert('Failed to delete tender. Please try again.');
			}
		} catch (error) {
			console.error('Error deleting tender:', error);
			alert('An error occurred while deleting the tender.');
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Tenders</h1>
					<p className="text-gray-600 dark:text-gray-400">Manage procurement tenders</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						onClick={refresh}
						disabled={loading}
						className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
						title="Refresh tenders"
					>
						<RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
						Refresh
					</button>
					<Link
						to="/tenders/new"
						className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition shadow-lg"
					>
						<Plus size={20} />
						Create Tender
					</Link>
				</div>
			</div>
			
			{error && (
				<div className="rounded-lg p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
					<p className="text-sm text-red-800 dark:text-red-300">
						⚠️ Error loading tenders: {error}. Check console for details.
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
						placeholder="Search tenders..."
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

			{/* Tenders Grid */}
			{loading ? (
				<div className="text-center py-12">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					<p className="mt-4 text-gray-600 dark:text-gray-400">Loading tenders...</p>
				</div>
			) : sortedTenders.length === 0 ? (
				<div className="text-center py-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220]">
					<FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-600 dark:text-gray-400">No tenders found</p>
				</div>
			) : (
				<>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{paged.map((tender, idx) => (
						<div
							key={tender.id || idx}
							className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] shadow-sm hover:shadow-xl transition-all"
						>
							{/* Content */}
							<div className="p-6">
								<div className="flex items-start justify-between gap-3 mb-3">
									<span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
										{tender.category || 'Uncategorized'}
									</span>
									{(() => {
										const status = (tender.status || 'published').toLowerCase();
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
								</div>

								<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition">
									{tender.title}
								</h3>

								{tender.agency && (
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
										{tender.agency}
									</p>
								)}

								{tender.status === 'scheduled' && tender.scheduledAt && (
									<p className="text-xs text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
										<Calendar size={12} />
										Scheduled: {new Date(tender.scheduledAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'short', timeStyle: 'short' })} (GMT+1)
									</p>
								)}

								<p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
									<Clock size={12} />
									Created: {formatCreatedAt(tender.createdAt)}
								</p>
								
								<div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
									{tender.country && (
										<div className="flex items-center gap-2">
											<MapPin size={14} />
											<span>{tender.country}{tender.region && `, ${tender.region}`}</span>
										</div>
									)}
									{tender.deadline && (
										<div className="flex items-center gap-2">
											<Calendar size={14} />
											<span>{new Date(tender.deadline).toLocaleDateString()}</span>
										</div>
									)}
									{tender.value && (
										<div className="font-semibold text-amber-600 dark:text-amber-400">
											Value: {tender.value}
										</div>
									)}
								</div>

								{/* Actions */}
								<div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
									{tender.isDraft ? (
										<Link
											to={`/tenders/new/${tender.id}`}
											className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition text-sm font-medium"
										>
											<Edit size={16} />
											Edit
										</Link>
									) : (
										<a
											href={`https://bizgrowthafrica.com/procurement-tenders`}
											target="_blank"
											rel="noopener noreferrer"
											className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white transition text-sm font-medium"
										>
											<Eye size={16} />
											View
										</a>
									)}
									<button 
										onClick={() => setDeleteConfirm(tender.id || idx)}
										disabled={deletingId === (tender.id || idx)}
										className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{deletingId === (tender.id || idx) ? (
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

				{/* Pagination */}
				{totalPages > 1 && (
					<nav className="flex flex-wrap items-center justify-center gap-2 pt-6" aria-label="Tenders pagination">
						<button
							type="button"
							onClick={() => setPage(p => Math.max(1, p - 1))}
							disabled={currentPage <= 1}
							className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1220] px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
						>
							<ChevronLeft size={18} /> Previous
						</button>
						<div className="flex items-center gap-1">
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
								<button
									key={p}
									type="button"
									onClick={() => setPage(p)}
									className={`min-w-[2.25rem] rounded-lg border px-3 py-2 text-sm font-medium transition ${
										p === currentPage
											? 'border-primary bg-primary text-white'
											: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
									}`}
								>
									{p}
								</button>
							))}
						</div>
						<button
							type="button"
							onClick={() => setPage(p => Math.min(totalPages, p + 1))}
							disabled={currentPage >= totalPages}
							className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1220] px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
						>
							Next <ChevronRight size={18} />
						</button>
					</nav>
				)}
				</>
			)}

			{/* Delete Confirmation Modal */}
			{deleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
					<div className="bg-white dark:bg-[#0B1220] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
							Delete Tender?
						</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-6">
							This action cannot be undone. The tender will be permanently deleted from Google Sheets.
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
									const tender = sortedTenders.find(t => (t.id || '') === deleteConfirm || t === deleteConfirm);
									if (tender) {
										const index = sortedTenders.indexOf(tender);
										handleDelete(tender, index);
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
