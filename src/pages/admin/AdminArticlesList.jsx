import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search, Edit, Trash2, Eye, CheckCircle2, Clock, RefreshCw, Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGoogleSheetsArticlesAdmin } from '../../hooks/useGoogleSheetsArticlesAdmin';
import { deleteSheetRow, getSheetData } from '../../utils/googleSheets';
import { getDrafts, deleteDraft } from '../../utils/draftStorage';
import { isSuperAdmin, getCurrentUserIdentifiers } from '../../utils/adminAuth';
import { formatCreatedAt } from '../../utils/timeUtils';

const PER_PAGE = 12;

export default function AdminArticlesList() {
	const [searchQuery, setSearchQuery] = useState('');
	const [filter, setFilter] = useState('all'); // all, published, draft, scheduled
	const [page, setPage] = useState(1);
	const [deletingId, setDeletingId] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);
	const { articles: allArticles, loading, error, refresh } = useGoogleSheetsArticlesAdmin();
	const [localDrafts, setLocalDrafts] = useState([]);

	// Load drafts from localStorage
	useEffect(() => {
		const loadDrafts = () => {
			const drafts = getDrafts('articles');
			setLocalDrafts(drafts.map(draft => ({
				...draft,
				id: draft.id,
				isDraft: true, // Flag to identify localStorage drafts
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

	// Combine Google Sheets articles with localStorage drafts
	const allArticlesCombined = [
		...allArticles.map(article => ({
			...article,
			title: article.title || 'Untitled',
			slug: article.slug || '',
			category: article.category || 'Uncategorized',
			publishedAt: article.publishedAt || article.createdAt || '',
			isDraft: false
		})),
		...localDrafts
	];

	// Restrict to current user's items (Admin sees all)
	const authorIds = getCurrentUserIdentifiers();
	const articlesForUser = isSuperAdmin()
		? allArticlesCombined
		: allArticlesCombined.filter(article => {
				const author = (article.author || '').trim().toLowerCase();
				return author && authorIds.includes(author);
			});

	const filteredArticles = articlesForUser.filter(article => {
		const matchesSearch = article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			article.category?.toLowerCase().includes(searchQuery.toLowerCase());
		
		// Get status from article, ensuring it's a string
		const rawStatus = article.status ? String(article.status).trim() : '';
		const articleStatus = rawStatus ? rawStatus.toLowerCase() : 'published';
		const matchesFilter = filter === 'all' || 
			(filter === 'published' && articleStatus === 'published') ||
			(filter === 'draft' && articleStatus === 'draft') ||
			(filter === 'scheduled' && articleStatus === 'scheduled');
		
		return matchesSearch && matchesFilter;
	});

	// Sort by most recently published (publishedAt > scheduledAt > createdAt)
	const sortedArticles = [...filteredArticles].sort((a, b) => {
		const dateA = new Date(a.publishedAt || a.scheduledAt || a.createdAt || 0).getTime();
		const dateB = new Date(b.publishedAt || b.scheduledAt || b.createdAt || 0).getTime();
		return dateB - dateA;
	});

	const totalPages = Math.max(1, Math.ceil(sortedArticles.length / PER_PAGE));
	const currentPage = Math.min(page, totalPages);
	const paged = sortedArticles.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

	useEffect(() => setPage(1), [filter, searchQuery]);
	useEffect(() => { if (page > totalPages && totalPages >= 1) setPage(totalPages); }, [totalPages, page]);

	const handleDelete = async (article, index) => {
		try {
			// If it's a localStorage draft, delete from localStorage
			if (article.isDraft) {
				deleteDraft('articles', article.id);
				setLocalDrafts(prev => prev.filter(d => d.id !== article.id));
				setDeleteConfirm(null);
				return;
			}

			// Otherwise, delete from Google Sheets
			// Get all articles from Google Sheets to find the correct row index
			const sheetData = await getSheetData('Articles');
			const articleIndex = sheetData.findIndex((a) => {
				const articleSlug = (a.slug || '').trim();
				return articleSlug === article.slug;
			});

			if (articleIndex === -1) {
				alert('Article not found in Google Sheets');
				return;
			}

			// Row index is 1-based (1 = first data row after header)
			const rowIndex = articleIndex + 1;
			setDeletingId(article.slug || index);

			const success = await deleteSheetRow('Articles', rowIndex);

			if (success) {
				// Refresh the list
				// Refresh both Google Sheets data and drafts
			await refresh();
			const drafts = getDrafts('articles');
			setLocalDrafts(drafts.map(draft => ({
				...draft,
				id: draft.id,
				isDraft: true,
				status: 'draft'
			})));
				setDeleteConfirm(null);
			} else {
				alert('Failed to delete article. Please try again.');
			}
		} catch (error) {
			console.error('Error deleting article:', error);
			alert('An error occurred while deleting the article.');
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">News Articles</h1>
					<p className="text-gray-600 dark:text-gray-400">Manage and edit your published articles</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						onClick={refresh}
						disabled={loading}
						className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
						title="Refresh articles"
					>
						<RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
						Refresh
					</button>
					<Link
						to="/articles/new"
						className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition shadow-lg"
					>
						<Plus size={20} />
						Create Article
					</Link>
				</div>
			</div>
			
			{error && (
				<div className="rounded-lg p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
					<p className="text-sm text-red-800 dark:text-red-300">
						⚠️ Error loading articles: {error}. Check console for details.
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
						placeholder="Search articles..."
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

			{/* Articles Grid */}
			{loading ? (
				<div className="text-center py-12">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					<p className="mt-4 text-gray-600 dark:text-gray-400">Loading articles...</p>
				</div>
			) : sortedArticles.length === 0 ? (
				<div className="text-center py-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220]">
					<FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-600 dark:text-gray-400">No articles found</p>
				</div>
			) : (
				<>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{paged.map((article, idx) => (
						<div
							key={article.slug || idx}
							className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] shadow-sm hover:shadow-xl transition-all"
						>
							{/* Image - prefer heroImage, then image */}
							{(article.heroImage || article.image) && (
								<div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
									<img
										src={article.heroImage || article.image}
										alt={article.title}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										onError={(e) => {
											const next = article.image && (article.heroImage || article.image) !== article.image ? article.image : null;
											if (next) e.currentTarget.src = next;
											else { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('min-h-[6rem]'); }
										}}
									/>
								</div>
							)}

							{/* Content */}
							<div className="p-6">
								<div className="flex items-start justify-between gap-3 mb-3">
									<span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
										{article.category || 'Uncategorized'}
									</span>
									{(() => {
										// Get status from article object, ensuring it's a string
										const rawStatus = article.status ? String(article.status).trim() : '';
										const status = rawStatus ? rawStatus.toLowerCase() : 'published';
										
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
									{article.title}
								</h3>

								{article.summary && (
									<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
										{article.summary}
									</p>
								)}
								
								{(() => {
									const rawStatus = article.status ? String(article.status).trim() : '';
									const status = rawStatus ? rawStatus.toLowerCase() : '';
									return status === 'scheduled' && article.scheduledAt ? (
										<p className="text-xs text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
											<Calendar size={12} />
											Scheduled: {new Date(article.scheduledAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'short', timeStyle: 'short' })} (GMT+1)
										</p>
									) : null;
								})()}

								<p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
									<Clock size={12} />
									Created: {formatCreatedAt(article.createdAt)}
								</p>

								{/* Actions */}
								<div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
									<Link
										to={article.isDraft 
											? `/articles/new/${article.id}` 
											: `/articles/edit/${article.slug || idx}`
										}
										className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition text-sm font-medium"
									>
										<Edit size={16} />
										Edit
									</Link>
									<a
										href={`https://bizgrowthafrica.com/news/${article.slug || idx}`}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white transition text-sm font-medium"
									>
										<Eye size={16} />
										View
									</a>
									<button 
										onClick={() => setDeleteConfirm(article.slug || idx)}
										disabled={deletingId === (article.slug || idx)}
										className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{deletingId === (article.slug || idx) ? (
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
					<nav className="flex flex-wrap items-center justify-center gap-2 pt-6" aria-label="Articles pagination">
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
							Delete Article?
						</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-6">
							This action cannot be undone. The article will be permanently deleted from Google Sheets.
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
									const article = sortedArticles.find(a => (a.slug || '') === deleteConfirm || a === deleteConfirm);
									if (article) {
										const index = sortedArticles.indexOf(article);
										handleDelete(article, index);
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
