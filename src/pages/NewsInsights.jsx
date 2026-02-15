import { useEffect, useMemo, useState } from "react";
import { Newspaper, ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import NewsCard from "../components/NewsCard";
import CategoryPills from "../components/CategoryPills";
import SEO from "../components/SEO";
import { useGoogleSheetsArticles } from "../hooks/useGoogleSheetsArticles";

const PER_PAGE = 12;

export default function NewsInsights() {
	const { articles: sheetsArticles, loading: sheetsLoading } = useGoogleSheetsArticles();
	const sheetsList = Array.isArray(sheetsArticles) ? sheetsArticles : [];
	const [categoryFilter, setCategoryFilter] = useState("All");
	const [page, setPage] = useState(1);

	// Only articles from Google Sheets / admin dashboard
	const allArticles = useMemo(() => [...sheetsList], [sheetsList]);

	// Filter by category when not "All"
	const filteredArticles = useMemo(() => {
		if (categoryFilter === "All") return allArticles;
		return allArticles.filter((a) => (a.category || "").toLowerCase() === categoryFilter.toLowerCase());
	}, [allArticles, categoryFilter]);

	const categories = useMemo(
		() => Array.from(new Set(allArticles.map((a) => a.category))).filter(Boolean).sort(),
		[allArticles]
	);

	// Pagination over filtered list
	const totalPages = Math.max(1, Math.ceil(filteredArticles.length / PER_PAGE));
	const currentPage = Math.min(page, totalPages);
	const paged = useMemo(
		() => filteredArticles.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE),
		[filteredArticles, currentPage]
	);

	// Reset to page 1 when category changes; clamp page when total pages shrinks
	useEffect(() => setPage(1), [categoryFilter]);
	useEffect(() => {
		if (page > totalPages && totalPages >= 1) setPage(totalPages);
	}, [totalPages, page]);

	// Preload first article image for faster loading
	useEffect(() => {
		const firstImg = paged[0]?.heroImage || paged[0]?.image;
		if (firstImg) {
			const link = document.createElement("link");
			link.rel = "preload";
			link.as = "image";
			link.href = firstImg;
			link.fetchPriority = "high";
			document.head.appendChild(link);
			return () => {
				if (link.parentNode) link.parentNode.removeChild(link);
			};
		}
	}, [paged]);

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

			<CategoryPills
				categories={categories}
				active={categoryFilter}
				onChange={setCategoryFilter}
			/>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<SectionHeader title={categoryFilter === "All" ? "Latest" : categoryFilter} />
				{filteredArticles.length > 0 && (
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
						{categoryFilter !== "All" && ` in ${categoryFilter}`}
					</p>
				)}
			</div>

			{sheetsLoading && filteredArticles.length === 0 ? (
				<div className="text-center py-12">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="mt-4 text-gray-600 dark:text-gray-400">Loading articles...</p>
				</div>
			) : paged.length === 0 ? (
				<div className="text-center py-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220]">
					<Newspaper className="mx-auto mb-4 h-12 w-12 text-gray-400" />
					<p className="text-gray-600 dark:text-gray-400">
						{categoryFilter === "All" ? "No articles available" : `No articles in ${categoryFilter}`}
					</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{paged.map((a, idx) => (
							<NewsCard key={a.url || a.slug} article={a} index={idx} />
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<nav
							className="flex flex-wrap items-center justify-center gap-2 pt-6"
							aria-label="Articles pagination"
						>
							<button
								type="button"
								onClick={() => setPage((p) => Math.max(1, p - 1))}
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
												? "border-primary bg-primary text-white"
												: "border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
										}`}
									>
										{p}
									</button>
								))}
							</div>
							<button
								type="button"
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={currentPage >= totalPages}
								className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1220] px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
							>
								Next <ChevronRight size={18} />
							</button>
						</nav>
					)}
				</>
			)}
		</div>
	);
}


