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
	}));
	const categories = Array.from(new Set(articles.map((a) => a.category))).sort();
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
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{articles.map((a) => (
						<NewsCard key={a.url} article={a} />
						))}
				</div>
			</div>
		</div>
	);
}


