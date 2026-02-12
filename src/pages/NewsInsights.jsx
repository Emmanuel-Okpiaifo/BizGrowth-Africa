import { useEffect, useMemo } from "react";
import { Newspaper } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import NewsCard from "../components/NewsCard";
import CategoryPills from "../components/CategoryPills";
import SEO from "../components/SEO";
import { useGoogleSheetsArticles } from "../hooks/useGoogleSheetsArticles";

export default function NewsInsights() {
	const { articles: sheetsArticles, loading: sheetsLoading } = useGoogleSheetsArticles();
	const sheetsList = Array.isArray(sheetsArticles) ? sheetsArticles : [];
	
	// Only articles from Google Sheets / admin dashboard
	const allArticles = useMemo(() => [...sheetsList], [sheetsList]);
	
	// Show up to 12 latest articles (full page of content)
	const articles = allArticles.slice(0, 12);
	const categories = Array.from(new Set(allArticles.map((a) => a.category))).filter(Boolean).sort();

	// Preload first article image for faster loading
	useEffect(() => {
		const firstImg = articles[0]?.heroImage || articles[0]?.image;
		if (firstImg) {
			const link = document.createElement('link');
			link.rel = 'preload';
			link.as = 'image';
			link.href = firstImg;
			link.fetchPriority = 'high';
			document.head.appendChild(link);
			return () => {
				if (link.parentNode) {
					link.parentNode.removeChild(link);
				}
			};
		}
	}, [articles]);
	return (
		<div className="space-y-6">
			<SEO
				title="Business News & Insights — BizGrowth Africa"
				description="Daily African business headlines: markets, funding, fintech, policy, SMEs, and reports."
				type="website"
				canonicalPath="/news-insights"
			/>
			<header className="rounded-2xl bg-gradient-to-br from-primary/10 via-white to-primary/5 p-6 dark:via-[#0B1220]">
				<h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
					<Newspaper size={22} /> Business News & Insights
				</h1>
				<p className="mt-1 text-gray-600 dark:text-gray-300">
					Curated news, market analysis, and practical insights for growing businesses.
				</p>
			</header>

			<CategoryPills categories={categories} />

			<SectionHeader title="Latest" />

			{/* Full-width dense grid of cards with no unused sidebar space */}
			{sheetsLoading && articles.length === 0 ? (
				<div className="text-center py-12">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					<p className="mt-4 text-gray-600 dark:text-gray-400">Loading articles...</p>
				</div>
			) : articles.length === 0 ? (
				<div className="text-center py-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220]">
					<Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-600 dark:text-gray-400">No articles available</p>
				</div>
			) : (
				<div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{articles.map((a, idx) => (
							<NewsCard key={a.url} article={a} index={idx} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}


