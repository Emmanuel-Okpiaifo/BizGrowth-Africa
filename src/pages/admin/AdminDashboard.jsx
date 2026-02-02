import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Briefcase, FolderOpen, LayoutDashboard, Plus, List, TrendingUp, Clock, CheckCircle2, Users, Eye, BarChart3, Calendar, ArrowUpRight, ArrowDownRight, Activity, Play } from 'lucide-react';
import { useGoogleSheetsArticlesAdmin } from '../../hooks/useGoogleSheetsArticlesAdmin';
import { useGoogleSheetsOpportunitiesAdmin } from '../../hooks/useGoogleSheetsOpportunitiesAdmin';
import { useGoogleSheetsTendersAdmin } from '../../hooks/useGoogleSheetsTendersAdmin';
import { publishScheduledPosts } from '../../utils/publishScheduled';
import { getTimeAgo } from '../../utils/timeUtils';

export default function AdminDashboard() {
	const { articles: allArticles, loading: articlesLoading, error: articlesError, refresh: refreshArticles } = useGoogleSheetsArticlesAdmin();
	const { opportunities: allOpportunities, loading: opportunitiesLoading, error: opportunitiesError, refresh: refreshOpportunities } = useGoogleSheetsOpportunitiesAdmin();
	const { tenders: allTenders, loading: tendersLoading, error: tendersError, refresh: refreshTenders } = useGoogleSheetsTendersAdmin();
	const [publishing, setPublishing] = useState(false);
	const [publishResult, setPublishResult] = useState(null);
	
	// Calculate real stats from Google Sheets
	const totalArticles = articlesError ? 0 : allArticles.length;
	const totalOpportunities = opportunitiesError ? 0 : allOpportunities.length;
	const totalTenders = tendersError ? 0 : allTenders.length;
	
	const publishedToday = articlesError ? 0 : allArticles.filter(a => {
		if (!a.publishedAt || (a.status || 'published').toLowerCase() !== 'published') return false;
		// Parse publishedAt with timezone handling
		const pubDate = getTimeAgo(a.publishedAt) ? new Date(a.publishedAt.includes('+') || a.publishedAt.includes('Z') ? a.publishedAt : a.publishedAt + '+01:00') : null;
		if (!pubDate) return false;
		const today = new Date();
		// Compare dates in GMT+1
		const pubDateGMT1 = new Date(pubDate.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
		const todayGMT1 = new Date(today.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
		return pubDateGMT1.toDateString() === todayGMT1.toDateString();
	}).length;
	
	// Calculate articles this month
	const articlesThisMonth = useMemo(() => {
		if (articlesError) return 0;
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		return allArticles.filter(a => {
			if (!a.publishedAt || (a.status || 'published').toLowerCase() !== 'published') return false;
			let pubDateStr = a.publishedAt;
			if (!pubDateStr.includes('+') && !pubDateStr.includes('Z')) {
				if (pubDateStr.includes('T')) {
					pubDateStr = pubDateStr + '+01:00';
				} else {
					pubDateStr = pubDateStr + 'T00:00:00+01:00';
				}
			}
			const pubDate = new Date(pubDateStr);
			return pubDate >= startOfMonth;
		}).length;
	}, [allArticles, articlesError]);
	
	// Calculate articles last month for trend
	const articlesLastMonth = useMemo(() => {
		if (articlesError) return 0;
		const now = new Date();
		const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
		return allArticles.filter(a => {
			if (!a.publishedAt || (a.status || 'published').toLowerCase() !== 'published') return false;
			let pubDateStr = a.publishedAt;
			if (!pubDateStr.includes('+') && !pubDateStr.includes('Z')) {
				if (pubDateStr.includes('T')) {
					pubDateStr = pubDateStr + '+01:00';
				} else {
					pubDateStr = pubDateStr + 'T00:00:00+01:00';
				}
			}
			const pubDate = new Date(pubDateStr);
			return pubDate >= startOfLastMonth && pubDate <= endOfLastMonth;
		}).length;
	}, [allArticles, articlesError]);
	
	// Calculate trend percentage
	const articlesTrend = useMemo(() => {
		if (articlesLastMonth === 0) return articlesThisMonth > 0 ? '+100%' : '0%';
		const change = ((articlesThisMonth - articlesLastMonth) / articlesLastMonth) * 100;
		return change >= 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
	}, [articlesThisMonth, articlesLastMonth]);
	
	// Calculate category distribution
	const categoryCounts = useMemo(() => {
		if (articlesError) return {};
		const counts = {};
		allArticles.forEach(a => {
			const cat = a.category || 'Uncategorized';
			counts[cat] = (counts[cat] || 0) + 1;
		});
		return counts;
	}, [allArticles, articlesError]);
	
	const topCategory = useMemo(() => {
		const entries = Object.entries(categoryCounts);
		if (entries.length === 0) return 'None';
		return entries.sort((a, b) => b[1] - a[1])[0][0];
	}, [categoryCounts]);
	
	// Calculate active opportunities (not past deadline)
	const activeOpportunities = useMemo(() => {
		if (opportunitiesError) return 0;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return allOpportunities.filter(opp => {
			if (!opp.deadline) return true; // No deadline = active
			const deadline = new Date(opp.deadline);
			deadline.setHours(0, 0, 0, 0);
			return deadline >= today;
		}).length;
	}, [allOpportunities, opportunitiesError]);
	
	// Calculate active tenders (not past deadline)
	const activeTenders = useMemo(() => {
		if (tendersError) return 0;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return allTenders.filter(tender => {
			if (!tender.deadline) return true; // No deadline = active
			const deadline = new Date(tender.deadline);
			deadline.setHours(0, 0, 0, 0);
			return deadline >= today;
		}).length;
	}, [allTenders, tendersError]);
	
	// Calculate opportunities posted this month
	const opportunitiesThisMonth = useMemo(() => {
		if (opportunitiesError) return 0;
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		return allOpportunities.filter(opp => {
			if (!opp.postedAt) return false;
			const postedDate = new Date(opp.postedAt);
			return postedDate >= startOfMonth;
		}).length;
	}, [allOpportunities, opportunitiesError]);
	
	const stats = [
		{ label: 'Total Articles', value: String(totalArticles), change: articlesTrend, trend: articlesThisMonth >= articlesLastMonth ? 'up' : 'down', icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', gradient: 'from-blue-500 to-cyan-500' },
		{ label: 'Opportunities', value: String(totalOpportunities), change: activeOpportunities > 0 ? `${activeOpportunities} active` : '0 active', trend: 'up', icon: Briefcase, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', gradient: 'from-emerald-500 to-teal-500' },
		{ label: 'Active Tenders', value: String(activeTenders), change: `${totalTenders} total`, trend: 'up', icon: FolderOpen, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', gradient: 'from-amber-500 to-orange-500' },
		{ label: 'Published Today', value: String(publishedToday), change: publishedToday > 0 ? 'Great!' : 'None yet', trend: publishedToday > 0 ? 'up' : 'down', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10 dark:bg-primary/20', gradient: 'from-primary to-red-700' },
	];

	const analytics = [
		{ label: 'This Month', value: String(articlesThisMonth), change: articlesTrend, trend: articlesThisMonth >= articlesLastMonth ? 'up' : 'down', icon: Calendar, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/30' },
		{ label: 'Top Category', value: topCategory, change: categoryCounts[topCategory] ? `${categoryCounts[topCategory]} articles` : '0', trend: 'up', icon: BarChart3, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' },
		{ label: 'New Opportunities', value: String(opportunitiesThisMonth), change: 'This month', trend: 'up', icon: Briefcase, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
		{ label: 'Categories', value: String(Object.keys(categoryCounts).length), change: `${totalArticles} total`, trend: 'up', icon: Activity, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30' },
	];

	const quickActions = [
		{
			title: 'Create Article',
			description: 'Write and publish a new news article',
			icon: FileText,
			link: '/articles/new',
			gradient: 'from-blue-500 to-cyan-500',
			action: 'Create'
		},
		{
			title: 'Add Opportunity',
			description: 'Post a new grant or funding opportunity',
			icon: Briefcase,
			link: '/opportunities/new',
			gradient: 'from-emerald-500 to-teal-500',
			action: 'Add'
		},
		{
			title: 'Post Tender',
			description: 'Add a new procurement tender',
			icon: FolderOpen,
			link: '/tenders/new',
			gradient: 'from-amber-500 to-orange-500',
			action: 'Post'
		},
	];

	// Calculate recent activity from real data
	const recentActivity = useMemo(() => {
		const activities = [];
		
		// Get recent articles (last 2)
		allArticles.slice(0, 2).forEach(article => {
			const status = (article.status || 'published').toLowerCase();
			let timeAgo;
			
			if (status === 'published' && article.publishedAt) {
				timeAgo = getTimeAgo(article.publishedAt);
			} else if (article.createdAt) {
				timeAgo = getTimeAgo(article.createdAt);
			} else {
				timeAgo = 'Recently';
			}
			
			activities.push({
				type: 'article',
				title: article.title,
				time: timeAgo,
				status: status
			});
		});
		
		// Get recent opportunities (last 1)
		if (allOpportunities.length > 0) {
			const opp = allOpportunities[0];
			const postedDate = opp.postedAt ? new Date(opp.postedAt) : new Date();
			const now = new Date();
			const diffHours = Math.floor((now - postedDate) / (1000 * 60 * 60));
			let timeAgo = '';
			if (diffHours < 1) timeAgo = 'Just now';
			else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
			else {
				const diffDays = Math.floor(diffHours / 24);
				timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
			}
			
			activities.push({
				type: 'opportunity',
				title: opp.title,
				time: timeAgo,
				status: 'published'
			});
		}
		
		// Get recent tenders (last 1)
		if (allTenders.length > 0) {
			const tender = allTenders[0];
			const postedDate = tender.postedAt ? new Date(tender.postedAt) : new Date();
			const now = new Date();
			const diffHours = Math.floor((now - postedDate) / (1000 * 60 * 60));
			let timeAgo = '';
			if (diffHours < 1) timeAgo = 'Just now';
			else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
			else {
				const diffDays = Math.floor(diffHours / 24);
				timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
			}
			
			activities.push({
				type: 'tender',
				title: tender.title,
				time: timeAgo,
				status: 'published'
			});
		}
		
		// Sort by time (most recent first) and limit to 3
		return activities.slice(0, 3);
	}, [allArticles, allOpportunities, allTenders]);

	// Handle publishing scheduled posts
	const handlePublishScheduled = async () => {
		setPublishing(true);
		setPublishResult(null);
		try {
			const result = await publishScheduledPosts();
			setPublishResult(result);
			// Wait a moment for Google Sheets to update, then refresh data
			// Refresh multiple times to ensure we get the updated status
			setTimeout(() => {
				refreshArticles();
				refreshOpportunities();
				refreshTenders();
			}, 1000);
			setTimeout(() => {
				refreshArticles();
				refreshOpportunities();
				refreshTenders();
			}, 3000);
		} catch (error) {
			setPublishResult({
				published: 0,
				errors: [error.message],
				timestamp: new Date().toISOString()
			});
		} finally {
			setPublishing(false);
		}
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="relative">
				<div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 dark:from-primary/20 dark:via-transparent dark:to-blue-500/20 rounded-3xl blur-3xl"></div>
				<div className="relative flex items-center justify-between">
					<div>
						<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
							Dashboard
						</h1>
						<p className="text-gray-600 dark:text-gray-400">Manage your content and track performance</p>
					</div>
					<button
						onClick={handlePublishScheduled}
						disabled={publishing}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Play size={16} />
						{publishing ? 'Publishing...' : 'Publish Scheduled'}
					</button>
				</div>
				{publishResult && (
					<div className={`mt-4 p-4 rounded-lg border ${
						publishResult.published > 0
							? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
							: publishResult.errors && publishResult.errors.length > 0
							? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
							: 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800'
					}`}>
						<p className={`text-sm font-medium ${
							publishResult.published > 0
								? 'text-green-800 dark:text-green-300'
								: 'text-gray-800 dark:text-gray-300'
						}`}>
							{publishResult.published > 0
								? `✅ Published ${publishResult.published} scheduled post${publishResult.published > 1 ? 's' : ''}`
								: 'No scheduled posts to publish'}
						</p>
						{publishResult.errors && publishResult.errors.length > 0 && (
							<ul className="mt-2 text-xs text-amber-800 dark:text-amber-300 list-disc list-inside">
								{publishResult.errors.map((error, idx) => (
									<li key={idx}>{error}</li>
								))}
							</ul>
						)}
					</div>
				)}
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{stats.map((stat, idx) => {
					const Icon = stat.icon;
					return (
						<div
							key={idx}
							className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
						>
							{/* Gradient Background */}
							<div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
							
							<div className="relative">
								<div className="flex items-center justify-between mb-4">
									<div className={`${stat.bg} ${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
										<Icon size={24} />
									</div>
									<div className={`flex items-center gap-1 text-xs font-semibold ${
										stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
									}`}>
										{stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
										{stat.change}
									</div>
								</div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
								<p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
							</div>
							
							{/* Bottom Gradient Line */}
							<div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
						</div>
					);
				})}
			</div>

			{/* Analytics Section */}
			<div>
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
							<BarChart3 className="w-6 h-6 text-primary" />
							Analytics Overview
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your content performance</p>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{analytics.map((item, idx) => {
						const Icon = item.icon;
						return (
							<div
								key={idx}
								className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-[#0B1220] dark:to-[#0A0F1A] p-6 shadow-sm hover:shadow-lg transition-all duration-300"
							>
								<div className="flex items-center justify-between mb-4">
									<div className={`${item.bg} ${item.color} p-2.5 rounded-lg`}>
										<Icon size={20} />
									</div>
									<div className={`flex items-center gap-1 text-xs font-semibold ${
										item.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
									}`}>
										{item.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
										{item.change}
									</div>
								</div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{item.label}</p>
								<p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
							</div>
						);
					})}
				</div>
			</div>

			{/* Quick Actions */}
			<div>
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{quickActions.map((action, idx) => {
						const Icon = action.icon;
						return (
							<Link
								key={idx}
								to={action.link}
								className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all"
							>
								{/* Gradient Background on Hover */}
								<div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
								
								<div className="relative">
									<div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.gradient} mb-4 shadow-lg`}>
										<Icon className="w-6 h-6 text-white" />
									</div>
									<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{action.title}</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{action.description}</p>
									<div className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
										{action.action} <Plus size={16} />
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			</div>

			{/* Recent Activity & News Articles Management */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Recent Activity */}
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
						<Clock className="w-5 h-5 text-gray-400" />
					</div>
					<div className="space-y-4">
						{recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
							<div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition">
								<div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
									activity.type === 'article' ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' :
									activity.type === 'opportunity' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' :
									'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
								}`}>
									{activity.type === 'article' ? <FileText size={20} /> :
									 activity.type === 'opportunity' ? <Briefcase size={20} /> :
									 <FolderOpen size={20} />}
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-gray-900 dark:text-white truncate">{activity.title}</p>
									<div className="flex items-center gap-2 mt-1">
										<span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
										<span className="text-xs">•</span>
										<span className={`text-xs font-medium ${
											activity.status === 'published' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
										}`}>
											{activity.status === 'published' ? 'Published' : 'Draft'}
										</span>
									</div>
								</div>
							</div>
						)) : (
							<p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
								No recent activity
							</p>
						)}
					</div>
				</div>

				{/* News Articles Management */}
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-gray-900 dark:text-white">News Articles</h2>
						<Link
							to="/articles"
							className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
						>
							<Plus size={16} />
							New Article
						</Link>
					</div>
					
					{/* Articles List */}
					<div className="space-y-3">
						{articlesError && (
							<div className="mb-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
								<p className="text-sm text-amber-800 dark:text-amber-300">
									⚠️ Cannot load articles from Google Sheets. Check <code className="text-xs bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">GOOGLE_SHEETS_API_FIX.md</code> for instructions.
								</p>
							</div>
						)}
						{articlesLoading ? (
							<div className="text-center py-8">
								<div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
								<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading articles...</p>
							</div>
						) : allArticles.length > 0 ? allArticles.slice(0, 3).map((article, idx) => {
							const timeAgo = (() => {
								const status = (article.status || 'published').toLowerCase();
								
								if (status === 'published' && article.publishedAt) {
									// Use publishedAt for published articles
									return getTimeAgo(article.publishedAt);
								} else if (article.createdAt) {
									// Use createdAt for drafts/scheduled
									return getTimeAgo(article.createdAt);
								}
								
								return 'Recently';
							})();
							
							return (
								<Link
									key={idx}
									to={`/articles/edit/${article.slug}`}
									className="block p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-primary/30 transition group"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition truncate">
												{article.title}
											</h3>
											<div className="flex items-center gap-3 mt-2">
												<span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium">
													{article.category || 'Uncategorized'}
												</span>
												<span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>
												{article.publishedAt && <CheckCircle2 size={14} className="text-green-500" />}
											</div>
										</div>
										<List size={20} className="text-gray-400 group-hover:text-primary transition flex-shrink-0" />
									</div>
								</Link>
							);
						}) : (
							<p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
								{articlesError ? 'Unable to load articles' : 'No articles yet'}
							</p>
						)}
					</div>

					{/* View All Link */}
					<Link
						to="/articles"
						className="mt-4 block text-center py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition font-medium"
					>
						View All Articles →
					</Link>
				</div>
			</div>
		</div>
	);
}
