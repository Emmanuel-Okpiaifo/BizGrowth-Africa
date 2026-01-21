import { useEffect } from "react";
import { Newspaper } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import NewsCard from "../components/NewsCard";
import { allOriginalArticles } from "../data/originals.index";
import CategoryPills from "../components/CategoryPills";
import SEO from "../components/SEO";

export default function NewsInsights() {
  const articles = allOriginalArticles.map((a) => ({
		title: a.title,
		source: "BizGrowth Africa",
    image: a.canonicalImage || a.image,
    imageCandidates: a.imageCandidates,
		url: `/news/${a.slug}`,
		publishedAt: a.publishedAt,
		summary: a.summary || a.subheading,
		category: a.category,
	})).slice(0, 3);
	const categories = Array.from(new Set(articles.map((a) => a.category))).sort();

	// Preload first article image for faster loading
	useEffect(() => {
		if (articles[0]?.image) {
			const link = document.createElement('link');
			link.rel = 'preload';
			link.as = 'image';
			link.href = articles[0].image;
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
			<div>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{articles.map((a, idx) => (
						<NewsCard key={a.url} article={a} index={idx} />
					))}
				</div>
			</div>
		</div>
	);
}


