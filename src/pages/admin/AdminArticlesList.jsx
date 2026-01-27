import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search, Edit, Trash2, Eye, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { useGoogleSheetsArticles } from '../../hooks/useGoogleSheetsArticles';

export default function AdminArticlesList() {
	const [searchQuery, setSearchQuery] = useState('');
	const [filter, setFilter] = useState('all'); // all, published, draft
	const { articles: allArticles, loading, error, refresh } = useGoogleSheetsArticles();
	
	// Transform articles for display
	const articles = allArticles.map(article => ({
		...article,
		// Ensure all required fields are present
		title: article.title || 'Untitled',
		slug: article.slug || '',
		category: article.category || 'Uncategorized',
		publishedAt: article.publishedAt || article.createdAt || '',
	}));

	const filteredArticles = articles.filter(article => {
		const matchesSearch = article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			article.category?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesFilter = filter === 'all' || 
			(filter === 'published' && article.publishedAt) ||
			(filter === 'draft' && !article.publishedAt);
		return matchesSearch && matchesFilter;
	});

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
				</div>
			</div>

			{/* Articles Grid */}
			{loading ? (
				<div className="text-center py-12">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					<p className="mt-4 text-gray-600 dark:text-gray-400">Loading articles...</p>
				</div>
			) : filteredArticles.length === 0 ? (
				<div className="text-center py-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220]">
					<FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-600 dark:text-gray-400">No articles found</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredArticles.map((article, idx) => (
						<div
							key={idx}
							className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] shadow-sm hover:shadow-xl transition-all"
						>
							{/* Image */}
							{article.image && (
								<div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
									<img
										src={article.image}
										alt={article.title}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									/>
								</div>
							)}

							{/* Content */}
							<div className="p-6">
								<div className="flex items-start justify-between gap-3 mb-3">
									<span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
										{article.category || 'Uncategorized'}
									</span>
									{article.publishedAt ? (
										<CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
									) : (
										<Clock size={18} className="text-amber-500 flex-shrink-0" />
									)}
								</div>

								<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition">
									{article.title}
								</h3>

								{article.summary && (
									<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
										{article.summary}
									</p>
								)}

								{/* Actions */}
								<div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
									<Link
										to={`/articles/edit/${article.slug || idx}`}
										className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition text-sm font-medium"
									>
										<Edit size={16} />
										Edit
									</Link>
									<Link
										to={`/news/${article.slug || idx}`}
										target="_blank"
										className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white transition text-sm font-medium"
									>
										<Eye size={16} />
										View
									</Link>
									<button className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-sm font-medium">
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
