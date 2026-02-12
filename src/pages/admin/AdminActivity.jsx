import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Activity, FileText, Briefcase, FolderOpen, RefreshCw, ArrowLeft } from 'lucide-react';
import { useGoogleSheetsArticlesAdmin } from '../../hooks/useGoogleSheetsArticlesAdmin';
import { useGoogleSheetsOpportunitiesAdmin } from '../../hooks/useGoogleSheetsOpportunitiesAdmin';
import { useGoogleSheetsTendersAdmin } from '../../hooks/useGoogleSheetsTendersAdmin';
import { formatCreatedAt } from '../../utils/timeUtils';

export default function AdminActivity() {
	const { articles: allArticles, loading: articlesLoading, error: articlesError, refresh: refreshArticles } = useGoogleSheetsArticlesAdmin();
	const { opportunities: allOpportunities, loading: opportunitiesLoading, error: opportunitiesError, refresh: refreshOpportunities } = useGoogleSheetsOpportunitiesAdmin();
	const { tenders: allTenders, loading: tendersLoading, error: tendersError, refresh: refreshTenders } = useGoogleSheetsTendersAdmin();

	const refresh = () => {
		refreshArticles();
		refreshOpportunities();
		refreshTenders();
	};

	// Same as Profile "Recent activity (all)" but no limit — all articles, opportunities, tenders merged and sorted by date
	const recentAll = useMemo(() => {
		const withType = [
			...(Array.isArray(allArticles) ? allArticles : []).map(a => ({
				type: 'article',
				title: a.title || 'Untitled',
				status: a.status || 'published',
				author: a.author || '—',
				createdAt: a.createdAt,
				publishedAt: a.publishedAt,
				editPath: `/articles/edit/${a.slug}`,
				id: a.slug,
			})),
			...(Array.isArray(allOpportunities) ? allOpportunities : []).map(o => ({
				type: 'opportunity',
				title: o.title || 'Untitled',
				status: o.status || 'published',
				author: o.author || '—',
				createdAt: o.createdAt,
				publishedAt: o.publishedAt,
				editPath: `/opportunities/edit/${encodeURIComponent(o.id || '')}`,
				id: o.id,
			})),
			...(Array.isArray(allTenders) ? allTenders : []).map(t => ({
				type: 'tender',
				title: t.title || 'Untitled',
				status: t.status || 'published',
				author: t.author || '—',
				createdAt: t.createdAt,
				publishedAt: t.publishedAt,
				editPath: '/tenders',
				id: t.id,
			})),
		].sort((a, b) => new Date(b.createdAt || b.publishedAt || 0) - new Date(a.createdAt || a.publishedAt || 0));
		return withType;
	}, [allArticles, allOpportunities, allTenders]);

	const loading = articlesLoading || opportunitiesLoading || tendersLoading;
	const hasError = articlesError || opportunitiesError || tendersError;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-center gap-3">
					<Link
						to="/profile"
						className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
						aria-label="Back to Profile"
					>
						<ArrowLeft size={20} />
					</Link>
					<div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
							<Activity className="w-8 h-8 text-primary" />
							Recent Activity
						</h1>
						<p className="text-gray-600 dark:text-gray-400 mt-0.5">
							All articles, opportunities, and tenders — sorted by date
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={refresh}
					disabled={loading}
					className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
				>
					<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
					{loading ? 'Refreshing…' : 'Refresh'}
				</button>
			</div>

			{hasError && (
				<div className="rounded-lg p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
					<p className="text-sm text-amber-800 dark:text-amber-300">
						{articlesError && 'Could not load articles. '}
						{opportunitiesError && 'Could not load opportunities. '}
						{tendersError && 'Could not load tenders. '}
					</p>
				</div>
			)}

			{loading && recentAll.length === 0 ? (
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-12 text-center">
					<div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
					<p className="mt-4 text-gray-500 dark:text-gray-400">Loading activity...</p>
				</div>
			) : recentAll.length === 0 ? (
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-12 text-center">
					<Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-600 dark:text-gray-400">No content yet. Create articles, opportunities, or tenders to see them here.</p>
					<div className="mt-6 flex flex-wrap justify-center gap-3">
						<Link to="/articles/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
							<FileText size={16} /> New Article
						</Link>
						<Link to="/opportunities/new" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
							<Briefcase size={16} /> New Opportunity
						</Link>
						<Link to="/tenders/new" className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
							<FolderOpen size={16} /> New Tender
						</Link>
					</div>
				</div>
			) : (
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] shadow-sm overflow-hidden">
					<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{recentAll.length} item{recentAll.length !== 1 ? 's' : ''} — click to edit
						</p>
					</div>
					<ul className="divide-y divide-gray-200 dark:divide-gray-800 max-h-[70vh] overflow-y-auto">
						{recentAll.map((item, idx) => (
							<li key={`${item.type}-${item.id || idx}`}>
								<Link
									to={item.editPath}
									className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition"
								>
									<div className="flex flex-wrap items-center gap-2">
										{item.type === 'article' && <FileText size={18} className="text-primary flex-shrink-0" />}
										{item.type === 'opportunity' && <Briefcase size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
										{item.type === 'tender' && <FolderOpen size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />}
										<span className="font-medium text-gray-900 dark:text-white truncate flex-1 min-w-0">{item.title}</span>
										<span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize flex-shrink-0">{item.type}</span>
										<span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 capitalize flex-shrink-0">{item.status}</span>
									</div>
									<div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
										<span>By {item.author}</span>
										<span>Created: {formatCreatedAt(item.createdAt)}</span>
									</div>
								</Link>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
