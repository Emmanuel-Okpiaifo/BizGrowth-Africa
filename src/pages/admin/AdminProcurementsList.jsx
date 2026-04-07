import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus, Search, Edit, Trash2, Eye, RefreshCw, Loader2, Calendar, MapPin, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGoogleSheetsProcurementsAdmin } from '../../hooks/useGoogleSheetsProcurementsAdmin';
import { deleteSheetRow, getSheetData } from '../../utils/googleSheets';
import { getDrafts, deleteDraft } from '../../utils/draftStorage';
import { isSuperAdmin, getCurrentUserIdentifiers } from '../../utils/adminAuth';
import { formatCreatedAt, getSortableTimestamp } from '../../utils/timeUtils';

const PER_PAGE = 12;

export default function AdminProcurementsList() {
	const [searchQuery, setSearchQuery] = useState('');
	const [filter, setFilter] = useState('all');
	const [page, setPage] = useState(1);
	const [deletingId, setDeletingId] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);
	const { procurements: allRows, loading, error, refresh } = useGoogleSheetsProcurementsAdmin();
	const [localDrafts, setLocalDrafts] = useState([]);

	useEffect(() => {
		const loadDrafts = () => {
			const drafts = getDrafts('procurements');
			setLocalDrafts(
				drafts.map((draft) => ({
					...draft,
					id: draft.id,
					isDraft: true,
					status: 'draft',
					type: 'procurement'
				}))
			);
		};
		loadDrafts();
		const interval = setInterval(loadDrafts, 5000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const interval = setInterval(() => refresh(), 30000);
		return () => clearInterval(interval);
	}, [refresh]);

	const allProcurements = [...allRows.map((item) => ({ ...item, isDraft: false })), ...localDrafts];

	const authorIds = getCurrentUserIdentifiers();
	const procurementsForUser = isSuperAdmin()
		? allProcurements
		: allProcurements.filter((item) => {
				const author = (item.author || '').trim().toLowerCase();
				return author && authorIds.includes(author);
			});

	const filtered = procurementsForUser.filter((item) => {
		const q = searchQuery.toLowerCase();
		const matchesSearch =
			item.title?.toLowerCase().includes(q) ||
			item.agency?.toLowerCase().includes(q) ||
			item.category?.toLowerCase().includes(q) ||
			item.country?.toLowerCase().includes(q);
		const status = (item.status || 'published').toLowerCase();
		const matchesFilter =
			filter === 'all' ||
			(filter === 'published' && status === 'published') ||
			(filter === 'draft' && status === 'draft') ||
			(filter === 'scheduled' && status === 'scheduled');
		return matchesSearch && matchesFilter;
	});

	const sorted = [...filtered].sort((a, b) => {
		const dateDiff = getSortableTimestamp(b.postedAt || b.publishedAt || b.createdAt || 0) - getSortableTimestamp(a.postedAt || a.publishedAt || a.createdAt || 0);
		if (dateDiff !== 0) return dateDiff;
		return (a.title || '').localeCompare(b.title || '');
	});

	const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
	const currentPage = Math.min(page, totalPages);
	const paged = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

	useEffect(() => setPage(1), [filter, searchQuery]);
	useEffect(() => {
		if (page > totalPages && totalPages >= 1) setPage(totalPages);
	}, [totalPages, page]);

	const handleDelete = async (item, index) => {
		try {
			if (item.isDraft) {
				deleteDraft('procurements', item.id);
				setLocalDrafts((prev) => prev.filter((d) => d.id !== item.id));
				setDeleteConfirm(null);
				return;
			}
			const sheetData = await getSheetData('Procurements');
			const rowIndexInData = sheetData.findIndex((row) => (row.title || '').trim() === item.title);
			if (rowIndexInData === -1) {
				alert('Procurement not found in Google Sheets');
				return;
			}
			const rowIndex = rowIndexInData + 1;
			setDeletingId(item.id || index);
			const success = await deleteSheetRow('Procurements', rowIndex);
			if (success) {
				await refresh();
				setDeleteConfirm(null);
			} else {
				alert('Failed to delete procurement. Please try again.');
			}
		} catch (error) {
			console.error('Error deleting procurement:', error);
			alert('An error occurred while deleting procurement.');
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Procurements</h1>
					<p className="text-gray-600 dark:text-gray-400">Manage procurement postings</p>
				</div>
				<div className="flex items-center gap-3">
					<button onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50">
						<RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
						Refresh
					</button>
					<Link to="/procurements/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition shadow-lg">
						<Plus size={20} />
						Create Procurement
					</Link>
				</div>
			</div>

			{error && <div className="rounded-lg p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-300">Error loading procurements: {error}</div>}

			<div className="flex flex-col sm:flex-row gap-4">
				<div className="flex-1 relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
					<input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search procurements..." className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
				</div>
				<div className="flex gap-2">
					{['all', 'published', 'draft', 'scheduled'].map((f) => (
						<button key={f} onClick={() => setFilter(f)} className={`px-4 py-3 rounded-lg border font-medium transition ${filter === f ? 'bg-primary text-white border-primary' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
							{f[0].toUpperCase() + f.slice(1)}
						</button>
					))}
				</div>
			</div>

			{loading ? (
				<div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div><p className="mt-4 text-gray-600 dark:text-gray-400">Loading procurements...</p></div>
			) : sorted.length === 0 ? (
				<div className="text-center py-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220]"><FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-600 dark:text-gray-400">No procurements found</p></div>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{paged.map((item, idx) => (
							<div key={item.id || idx} className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] shadow-sm hover:shadow-xl transition-all">
								{item.heroImage ? (
									<img src={item.heroImage} alt={item.title || 'Procurement'} className="h-36 w-full object-cover" loading="lazy" />
								) : (
									<div className="h-36 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
										No hero image
									</div>
								)}
								<div className="p-6">
									<div className="flex items-start justify-between gap-3 mb-3">
										<span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">{item.category || 'Uncategorized'}</span>
										<span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${(item.status || 'published') === 'published' ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300' : (item.status || '') === 'scheduled' ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300' : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'}`}>
											{(item.status || 'published') === 'published' ? <CheckCircle2 size={14} /> : (item.status || '') === 'scheduled' ? <Calendar size={14} /> : <Clock size={14} />}
											{(item.status || 'published') === 'published' ? 'Published' : (item.status || '') === 'scheduled' ? 'Scheduled' : 'Draft'}
										</span>
									</div>
									<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition">{item.title}</h3>
									{item.agency && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">{item.agency}</p>}
									<p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1"><Clock size={12} />Created: {formatCreatedAt(item.createdAt)}</p>
									<div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
										{item.country && <div className="flex items-center gap-2"><MapPin size={14} /><span>{item.country}{item.region && `, ${item.region}`}</span></div>}
										{item.deadline && <div className="flex items-center gap-2"><Calendar size={14} /><span>{item.deadline}</span></div>}
									</div>
									<div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
										{item.isDraft ? (
											<Link to={`/procurements/new/${item.id}`} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition text-sm font-medium"><Edit size={16} />Edit</Link>
										) : (
											<>
												<Link to={`/procurements/edit/${encodeURIComponent(item.id)}`} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition text-sm font-medium"><Edit size={16} />Edit</Link>
												<a href={`https://bizgrowthafrica.com/procurement-tenders/${encodeURIComponent(item.id)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white transition text-sm font-medium"><Eye size={16} />View</a>
											</>
										)}
										<button onClick={() => setDeleteConfirm(item.id || idx)} disabled={deletingId === (item.id || idx)} className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-sm font-medium disabled:opacity-50">
											{deletingId === (item.id || idx) ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
					{totalPages > 1 && (
						<nav className="flex flex-wrap items-center justify-center gap-2 pt-6" aria-label="Procurements pagination">
							<button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1220] px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition"><ChevronLeft size={18} /> Previous</button>
							<div className="flex items-center gap-1">
								{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
									<button key={p} type="button" onClick={() => setPage(p)} className={`min-w-[2.25rem] rounded-lg border px-3 py-2 text-sm font-medium transition ${p === currentPage ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{p}</button>
								))}
							</div>
							<button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1220] px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition">Next <ChevronRight size={18} /></button>
						</nav>
					)}
				</>
			)}

			{deleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
					<div className="bg-white dark:bg-[#0B1220] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Procurement?</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-6">This action cannot be undone.</p>
						<div className="flex gap-3">
							<button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium">Cancel</button>
							<button onClick={() => { const item = sorted.find((t) => (t.id || '') === deleteConfirm || t === deleteConfirm); if (item) handleDelete(item, sorted.indexOf(item)); }} disabled={deletingId === deleteConfirm} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2">{deletingId === deleteConfirm ? <><Loader2 size={16} className="animate-spin" />Deleting...</> : <><Trash2 size={16} />Delete</>}</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
