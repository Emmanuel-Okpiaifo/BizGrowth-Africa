import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, FileText, Clock, CheckCircle2, Calendar, Activity, RefreshCw } from 'lucide-react';
import { getCurrentUser } from '../../utils/adminAuth';
import { useGoogleSheetsArticlesAdmin } from '../../hooks/useGoogleSheetsArticlesAdmin';
import { getTimeAgo } from '../../utils/timeUtils';

export default function AdminProfile() {
	const currentUser = getCurrentUser();
	const { articles: allArticles, loading: articlesLoading, error: articlesError, refresh } = useGoogleSheetsArticlesAdmin();

	// Activity for current user: match by author (case-insensitive), with flexible match for display name
	const myActivity = useMemo(() => {
		if (articlesError) return { published: [], scheduled: [], drafts: [] };
		const name = (currentUser || '').trim().toLowerCase();
		const mine = name
			? allArticles.filter(a => {
					const author = (a.author || '').trim().toLowerCase();
					return author === name || author === currentUser?.trim();
			  })
			: [];
		return {
			published: mine.filter(a => (a.status || '').toLowerCase() === 'published'),
			scheduled: mine.filter(a => (a.status || '').toLowerCase() === 'scheduled'),
			drafts: mine.filter(a => (a.status || '').toLowerCase() === 'draft'),
		};
	}, [currentUser, allArticles, articlesError]);

	// Recent activity (all users) for "Recent activity" section so the page always shows something
	const recentAll = useMemo(() => {
		return allArticles.slice(0, 5);
	}, [allArticles]);

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
									<span className="text-gray-600 dark:text-gray-400">Articles published</span>
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
							disabled={articlesLoading}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
						>
							<RefreshCw size={16} className={articlesLoading ? 'animate-spin' : ''} />
							{articlesLoading ? 'Refreshing…' : 'Refresh'}
						</button>
					</div>

					{articlesError && (
						<div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
							<p className="text-sm text-amber-800 dark:text-amber-300">
								Could not load articles. Activity is based on articles where author matches your login name.
							</p>
						</div>
					)}

					{articlesLoading ? (
						<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-8 text-center">
							<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
							<p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading your activity...</p>
						</div>
					) : (
						<>
							{/* Recent activity (all) - so the section always shows fresh data */}
							{recentAll.length > 0 && (
								<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recent activity (all)</h3>
									<p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Latest articles from the sheet — refreshes when you click Refresh.</p>
									<ul className="space-y-2">
										{recentAll.map((article, idx) => (
											<li key={article.slug || idx}>
												<Link
													to={`/articles/edit/${article.slug}`}
													className="block p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 text-sm"
												>
													<span className="font-medium text-gray-900 dark:text-white truncate block">{article.title}</span>
													<span className="text-xs text-gray-500 dark:text-gray-400">
														{(article.status || 'published')} · {article.author || '—'} · {article.publishedAt ? getTimeAgo(article.publishedAt) : getTimeAgo(article.createdAt)}
													</span>
												</Link>
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Published (my articles) */}
							<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
									<CheckCircle2 className="w-5 h-5 text-green-500" />
									Published ({publishedCount})
								</h3>
								<div className="space-y-3">
									{myActivity.published.length === 0 ? (
										<p className="text-sm text-gray-500 dark:text-gray-400 py-2">
											No articles published under your name yet. New articles you create will use your username as author.
										</p>
									) : (
										myActivity.published.slice(0, 5).map((article, idx) => (
											<Link
												key={idx}
												to={`/articles/edit/${article.slug}`}
												className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/30 transition"
											>
												<p className="font-medium text-gray-900 dark:text-white truncate">{article.title}</p>
												<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
													{article.publishedAt ? getTimeAgo(article.publishedAt) : 'Recently'}
												</p>
											</Link>
										))
									)}
								</div>
								{publishedCount > 5 && (
									<Link
										to="/articles"
										className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
									>
										View all articles →
									</Link>
								)}
							</div>

							{/* Scheduled */}
							<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
									<Clock className="w-5 h-5 text-amber-500" />
									Scheduled ({scheduledCount})
								</h3>
								<div className="space-y-3">
									{myActivity.scheduled.length === 0 ? (
										<p className="text-sm text-gray-500 dark:text-gray-400 py-2">
											No scheduled articles.
										</p>
									) : (
										myActivity.scheduled.slice(0, 5).map((article, idx) => (
											<Link
												key={idx}
												to={`/articles/edit/${article.slug}`}
												className="block p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50 hover:border-amber-400/50 transition"
											>
												<p className="font-medium text-gray-900 dark:text-white truncate">{article.title}</p>
												<p className="text-xs text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1">
													<Calendar size={12} />
													{article.scheduledAt
														? new Date(article.scheduledAt).toLocaleString(undefined, {
																dateStyle: 'medium',
																timeStyle: 'short',
														  })
														: '—'}
												</p>
											</Link>
										))
									)}
								</div>
								{scheduledCount > 5 && (
									<Link
										to="/articles"
										className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
									>
										View all articles →
									</Link>
								)}
							</div>

							{/* Drafts */}
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
										myActivity.drafts.slice(0, 5).map((article, idx) => (
											<Link
												key={idx}
												to={`/articles/edit/${article.slug}`}
												className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/30 transition"
											>
												<p className="font-medium text-gray-900 dark:text-white truncate">{article.title}</p>
												<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
													{article.createdAt ? getTimeAgo(article.createdAt) : 'Recently'}
												</p>
											</Link>
										))
									)}
								</div>
								{draftsCount > 5 && (
									<Link
										to="/articles"
										className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
									>
										View all articles →
									</Link>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
