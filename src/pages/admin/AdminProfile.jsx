import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, FileText, Clock, CheckCircle2, Calendar, Activity, RefreshCw, Briefcase, FolderOpen, ArrowRight } from 'lucide-react';
import { getCurrentUser, getCurrentUserIdentifiers } from '../../utils/adminAuth';
import { useGoogleSheetsArticlesAdmin } from '../../hooks/useGoogleSheetsArticlesAdmin';
import { useGoogleSheetsOpportunitiesAdmin } from '../../hooks/useGoogleSheetsOpportunitiesAdmin';
import { useGoogleSheetsTendersAdmin } from '../../hooks/useGoogleSheetsTendersAdmin';
import { getTimeAgo, formatCreatedAt } from '../../utils/timeUtils';
import { getDrafts } from '../../utils/draftStorage';

function byDate(a, b) {
	const dateA = new Date(a.publishedAt || a.createdAt || a.scheduledAt || 0).getTime();
	const dateB = new Date(b.publishedAt || b.createdAt || b.scheduledAt || 0).getTime();
	return dateB - dateA;
}

export default function AdminProfile() {
	const currentUser = getCurrentUser();
	const { articles: allArticles, loading: articlesLoading, error: articlesError, refresh: refreshArticles } = useGoogleSheetsArticlesAdmin();
	const { opportunities: allOpportunities, loading: opportunitiesLoading, error: opportunitiesError, refresh: refreshOpportunities } = useGoogleSheetsOpportunitiesAdmin();
	const { tenders: allTenders, loading: tendersLoading, error: tendersError, refresh: refreshTenders } = useGoogleSheetsTendersAdmin();
	const [localDrafts, setLocalDrafts] = useState({ articles: [], opportunities: [], tenders: [] });

	const authorIds = getCurrentUserIdentifiers();

	const refresh = () => {
		refreshArticles();
		refreshOpportunities();
		refreshTenders();
	};

	// Load localStorage drafts and refresh when window gains focus
	useEffect(() => {
		function loadDrafts() {
			if (!authorIds.length) {
				setLocalDrafts({ articles: [], opportunities: [], tenders: [] });
				return;
			}
			const filterByAuthor = (list, getAuthor) => (list || []).filter(d => authorIds.includes((getAuthor(d) || '').trim().toLowerCase()));
			setLocalDrafts({
				articles: filterByAuthor(getDrafts('articles'), d => d.author),
				opportunities: filterByAuthor(getDrafts('opportunities'), d => d.author),
				tenders: filterByAuthor(getDrafts('tenders'), d => d.author),
			});
		}
		loadDrafts();
		window.addEventListener('storage', loadDrafts);
		window.addEventListener('focus', loadDrafts);
		return () => {
			window.removeEventListener('storage', loadDrafts);
			window.removeEventListener('focus', loadDrafts);
		};
	}, [currentUser, authorIds.join(',')]);

	// Activity for current user: articles, opportunities, tenders by author; each item has type, title, link, date
	const myActivity = useMemo(() => {
		const matchAuthor = (item) => authorIds.includes((item.author || '').trim().toLowerCase());

		const myArticles = authorIds.length && !articlesError ? allArticles.filter(matchAuthor) : [];
		const myOpportunities = authorIds.length && !opportunitiesError ? allOpportunities.filter(matchAuthor) : [];
		const myTenders = authorIds.length && !tendersError ? allTenders.filter(matchAuthor) : [];

		const toItem = (type, item, editPath) => ({
			type,
			title: item.title || 'Untitled',
			publishedAt: item.publishedAt,
			createdAt: item.createdAt,
			scheduledAt: item.scheduledAt,
			editPath,
			id: item.id || item.slug,
		});

		const published = [
			...myArticles.filter(a => (a.status || '').toLowerCase() === 'published').map(a => toItem('article', a, `/articles/edit/${a.slug}`)),
			...myOpportunities.filter(o => (o.status || '').toLowerCase() === 'published').map(o => toItem('opportunity', o, `/opportunities/edit/${encodeURIComponent(o.id || o.title || '')}`)),
			...myTenders.filter(t => (t.status || '').toLowerCase() === 'published').map(t => toItem('tender', t, '/tenders')),
		].sort(byDate);

		const scheduled = [
			...myArticles.filter(a => (a.status || '').toLowerCase() === 'scheduled').map(a => toItem('article', a, `/articles/edit/${a.slug}`)),
			...myOpportunities.filter(o => (o.status || '').toLowerCase() === 'scheduled').map(o => toItem('opportunity', o, `/opportunities/edit/${encodeURIComponent(o.id || o.title || '')}`)),
			...myTenders.filter(t => (t.status || '').toLowerCase() === 'scheduled').map(t => toItem('tender', t, '/tenders')),
		].sort(byDate);

		const articleSheetDrafts = myArticles.filter(a => (a.status || '').toLowerCase() === 'draft').map(a => ({ ...toItem('article', a, `/articles/edit/${a.slug}`), isLocalDraft: false }));
		const articleStorageDrafts = (localDrafts.articles || []).map(d => ({
			type: 'article',
			title: (d.title || 'Untitled draft').trim(),
			createdAt: d.createdAt || d.updatedAt,
			editPath: `/articles/new/${d.id}`,
			id: d.id,
			isLocalDraft: true,
		}));
		const opportunityDrafts = (localDrafts.opportunities || []).map(d => ({
			type: 'opportunity',
			title: (d.title || 'Untitled draft').trim(),
			createdAt: d.createdAt || d.updatedAt,
			editPath: `/opportunities/new/${d.id}`,
			id: d.id,
			isLocalDraft: true,
		}));
		const tenderDrafts = (localDrafts.tenders || []).map(d => ({
			type: 'tender',
			title: (d.title || 'Untitled draft').trim(),
			createdAt: d.createdAt || d.updatedAt,
			editPath: `/tenders/new/${d.id}`,
			id: d.id,
			isLocalDraft: true,
		}));
		const drafts = [...articleSheetDrafts, ...articleStorageDrafts, ...opportunityDrafts, ...tenderDrafts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

		return { published, scheduled, drafts };
	}, [authorIds, allArticles, allOpportunities, allTenders, articlesError, opportunitiesError, tendersError, localDrafts]);

	// Recent activity (all users) - mix of latest articles, opportunities, tenders
	const recentAll = useMemo(() => {
		const withType = [
			...allArticles.slice(0, 5).map(a => ({ type: 'article', ...a, editPath: `/articles/edit/${a.slug}` })),
			...allOpportunities.slice(0, 3).map(o => ({ type: 'opportunity', ...o, editPath: `/opportunities/edit/${encodeURIComponent(o.id || '')}` })),
			...allTenders.slice(0, 2).map(t => ({ type: 'tender', ...t, editPath: '/tenders' })),
		].sort((a, b) => new Date(b.createdAt || b.publishedAt || 0) - new Date(a.createdAt || a.publishedAt || 0));
		return withType.slice(0, 5);
	}, [allArticles, allOpportunities, allTenders]);

	const publishedCount = myActivity.published.length;
	const scheduledCount = myActivity.scheduled.length;
	const draftsCount = myActivity.drafts.length;

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="relative">
				<div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 dark:from-primary/20 dark:via-transparent dark:to-blue-500/20 rounded-3xl blur-3xl" />
				<div className="relative">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
						Profile
					</h1>
					<p className="text-gray-600 dark:text-gray-400">Your account and content activity</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Profile card: username + avatar */}
				<div className="lg:col-span-1">
					<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm">
						<div className="flex flex-col items-center text-center">
							{/* Avatar: first letter of username or user icon */}
							<div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-primary/20 dark:ring-primary/30 mb-4">
								{currentUser ? currentUser.charAt(0).toUpperCase() : <User size={40} />}
							</div>
							<p className="text-xs font-medium uppercase tracking-wider text-primary mb-1">Logged in as</p>
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
								{currentUser || 'Admin'}
							</h2>
							<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 w-full space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-600 dark:text-gray-400">Published</span>
									<span className="font-semibold text-gray-900 dark:text-white">{publishedCount}</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-600 dark:text-gray-400">Scheduled</span>
									<span className="font-semibold text-amber-600 dark:text-amber-400">{scheduledCount}</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-600 dark:text-gray-400">Drafts</span>
									<span className="font-semibold text-gray-500 dark:text-gray-400">{draftsCount}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Activity */}
				<div className="lg:col-span-2 space-y-6">
					<div className="flex flex-wrap items-center justify-between gap-3 mb-4">
						<div className="flex items-center gap-2">
							<Activity className="w-6 h-6 text-primary" />
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Activity</h2>
						</div>
						<button
							type="button"
							onClick={() => refresh()}
							disabled={articlesLoading || opportunitiesLoading || tendersLoading}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
						>
							<RefreshCw size={16} className={articlesLoading || opportunitiesLoading || tendersLoading ? 'animate-spin' : ''} />
							{articlesLoading || opportunitiesLoading || tendersLoading ? 'Refreshing…' : 'Refresh'}
						</button>
					</div>

					{(articlesError || opportunitiesError || tendersError) && (
						<div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
							<p className="text-sm text-amber-800 dark:text-amber-300">
								{articlesError && 'Could not load articles. '}
								{opportunitiesError && 'Could not load opportunities. '}
								{tendersError && 'Could not load tenders. '}
								Activity is based on content where author matches your login name.
							</p>
						</div>
					)}

					{(articlesLoading || opportunitiesLoading || tendersLoading) ? (
						<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-8 text-center">
							<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
							<p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading your activity...</p>
						</div>
					) : (
						<>
							{/* Recent activity (all) - latest articles, opportunities, tenders */}
							<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm">
								<div className="flex flex-wrap items-center justify-between gap-3 mb-3">
									<div>
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent activity (all)</h3>
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest content from the sheet — refreshes when you click Refresh.</p>
									</div>
									<Link
										to="/activity"
										className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition shadow-sm"
									>
										View all
										<ArrowRight size={16} />
									</Link>
								</div>
								{recentAll.length > 0 ? (
									<ul className="space-y-2">
										{recentAll.map((item, idx) => (
											<li key={`${item.type}-${item.slug || item.id || idx}`}>
												<Link
													to={item.editPath}
													className="block p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 text-sm"
												>
													<span className="font-medium text-gray-900 dark:text-white truncate block">{item.title}</span>
													<span className="text-xs text-gray-500 dark:text-gray-400">
														{item.type === 'article' && <FileText size={12} className="inline mr-1 align-middle" />}
														{item.type === 'opportunity' && <Briefcase size={12} className="inline mr-1 align-middle" />}
														{item.type === 'tender' && <FolderOpen size={12} className="inline mr-1 align-middle" />}
														{item.type} · {(item.status || 'published')} · {item.author || '—'}
													</span>
													<span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5">
														Created: {formatCreatedAt(item.createdAt)}
													</span>
												</Link>
											</li>
										))}
									</ul>
								) : (
									<p className="text-sm text-gray-500 dark:text-gray-400 py-2">No recent content. <Link to="/activity" className="text-primary hover:underline">View all activity</Link> to see the full list.</p>
								)}
							</div>

							{/* Published (my articles, opportunities, tenders) */}
							<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
									<CheckCircle2 className="w-5 h-5 text-green-500" />
									Published ({publishedCount})
								</h3>
								<div className="space-y-3">
									{myActivity.published.length === 0 ? (
										<p className="text-sm text-gray-500 dark:text-gray-400 py-2">
											No content published under your name yet. New articles, opportunities, and tenders you create will use your username as author.
										</p>
									) : (
										myActivity.published.slice(0, 8).map((item, idx) => (
											<Link
												key={`${item.type}-${item.id || idx}`}
												to={item.editPath}
												className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/30 transition"
											>
												<div className="flex items-center gap-2">
													{item.type === 'article' && <FileText size={16} className="text-primary flex-shrink-0" />}
													{item.type === 'opportunity' && <Briefcase size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
													{item.type === 'tender' && <FolderOpen size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />}
													<p className="font-medium text-gray-900 dark:text-white truncate flex-1">{item.title}</p>
													<span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">{item.type}</span>
												</div>
												<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
													{item.publishedAt ? getTimeAgo(item.publishedAt) : 'Recently'}
												</p>
												<p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
													Created: {formatCreatedAt(item.createdAt)}
												</p>
											</Link>
										))
									)}
								</div>
								{publishedCount > 8 && (
									<div className="mt-3 flex gap-4">
										<Link to="/articles" className="text-sm font-medium text-primary hover:underline">Articles →</Link>
										<Link to="/opportunities" className="text-sm font-medium text-primary hover:underline">Opportunities →</Link>
										<Link to="/tenders" className="text-sm font-medium text-primary hover:underline">Tenders →</Link>
									</div>
								)}
							</div>

							{/* Scheduled (articles, opportunities, tenders) */}
							<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
									<Clock className="w-5 h-5 text-amber-500" />
									Scheduled ({scheduledCount})
								</h3>
								<div className="space-y-3">
									{myActivity.scheduled.length === 0 ? (
										<p className="text-sm text-gray-500 dark:text-gray-400 py-2">
											No scheduled content.
										</p>
									) : (
										myActivity.scheduled.slice(0, 8).map((item, idx) => (
											<Link
												key={`${item.type}-${item.id || idx}`}
												to={item.editPath}
												className="block p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50 hover:border-amber-400/50 transition"
											>
												<div className="flex items-center gap-2">
													{item.type === 'article' && <FileText size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />}
													{item.type === 'opportunity' && <Briefcase size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />}
													{item.type === 'tender' && <FolderOpen size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />}
													<p className="font-medium text-gray-900 dark:text-white truncate flex-1">{item.title}</p>
													<span className="text-xs px-2 py-0.5 rounded bg-amber-200/50 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200 capitalize">{item.type}</span>
												</div>
												<p className="text-xs text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1">
													<Calendar size={12} />
													{item.scheduledAt
														? new Date(item.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
														: '—'}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
													Created: {formatCreatedAt(item.createdAt)}
												</p>
											</Link>
										))
									)}
								</div>
								{scheduledCount > 8 && (
									<div className="mt-3 flex gap-4">
										<Link to="/articles" className="text-sm font-medium text-primary hover:underline">Articles →</Link>
										<Link to="/opportunities" className="text-sm font-medium text-primary hover:underline">Opportunities →</Link>
										<Link to="/tenders" className="text-sm font-medium text-primary hover:underline">Tenders →</Link>
									</div>
								)}
							</div>

							{/* Drafts (articles, opportunities, tenders) */}
							<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
									<FileText className="w-5 h-5 text-gray-500" />
									Drafts ({draftsCount})
								</h3>
								<div className="space-y-3">
									{myActivity.drafts.length === 0 ? (
										<p className="text-sm text-gray-500 dark:text-gray-400 py-2">
											No drafts.
										</p>
									) : (
										myActivity.drafts.slice(0, 8).map((item, idx) => (
											<Link
												key={item.id || item.slug || idx}
												to={item.editPath}
												className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/30 transition"
											>
												<div className="flex items-center gap-2">
													{item.type === 'article' && <FileText size={16} className="text-gray-500 flex-shrink-0" />}
													{item.type === 'opportunity' && <Briefcase size={16} className="text-gray-500 flex-shrink-0" />}
													{item.type === 'tender' && <FolderOpen size={16} className="text-gray-500 flex-shrink-0" />}
													<p className="font-medium text-gray-900 dark:text-white truncate flex-1">{item.title}</p>
													<span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">{item.type}</span>
												</div>
												<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
													{item.createdAt ? getTimeAgo(item.createdAt) : 'Recently'}
												</p>
												<p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
													Created: {formatCreatedAt(item.createdAt)}
												</p>
											</Link>
										))
									)}
								</div>
								{draftsCount > 8 && (
									<div className="mt-3 flex gap-4">
										<Link to="/articles" className="text-sm font-medium text-primary hover:underline">Articles →</Link>
										<Link to="/opportunities" className="text-sm font-medium text-primary hover:underline">Opportunities →</Link>
										<Link to="/tenders" className="text-sm font-medium text-primary hover:underline">Tenders →</Link>
									</div>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
