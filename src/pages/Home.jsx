import { useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import Ticker from "../components/Ticker";
import SectionHeader from "../components/SectionHeader";
import NewsCard from "../components/NewsCard";
import MarketsStrip from "../components/MarketsStrip";
import HomepageCTABar from "../components/HomepageCTABar";
import { useDailyOriginalArticles } from "../data/useDailyOriginalArticles";
import SEO from "../components/SEO";

export default function Home() {
	const { articles } = useDailyOriginalArticles();

	const trending = articles.slice(0, 8);
	// const picks = articles.slice(8, 16); // removed to keep exactly 3 content sections after hero

	const lead = articles[0];
	const sideHeadlines = articles.slice(1, 5);
	const analysis = articles.slice(4, 10);

	// Preload hero image for faster loading
	useEffect(() => {
		if (lead?.image) {
			const link = document.createElement('link');
			link.rel = 'preload';
			link.as = 'image';
			link.href = lead.image;
			link.fetchPriority = 'high';
			document.head.appendChild(link);
			return () => {
				if (link.parentNode) {
					link.parentNode.removeChild(link);
				}
			};
		}
	}, [lead?.image]);

	// Curated category sections (independent of current filter)
	// Funding & Deals removed

	return (
		<div className="space-y-10">
			<SEO
				title="BizGrowth Africa — African Business News & Intelligence"
				description="Original, actionable business news for Africa’s founders and MSMEs: markets, policy, funding, and deep-dive analysis."
				type="website"
				canonicalPath="/"
			/>
			<Ticker speedSec={36} items={trending.map((a) => ({ title: a.title, url: `/news/${a.slug}` }))} />

			{/* Spotlight hero with side headlines */}
			<section className="grid gap-4 lg:grid-cols-12">
				<div className="lg:col-span-8">
					{lead ? (
						<Link
							to={lead.url}
							className="group relative block overflow-hidden rounded-2xl bg-gray-900 ring-1 ring-gray-200 transition hover:ring-primary/30 dark:ring-gray-800"
							aria-label={lead.title}
						>
							<div className="relative aspect-[3/4] sm:aspect-[4/3] lg:aspect-[16/9]">
								<img
									src={lead.image}
									alt={lead.title}
									className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.01]"
									loading="eager"
									fetchpriority="high"
									decoding="async"
									onError={(e) => {
										const cands = Array.isArray(lead.imageCandidates) && lead.imageCandidates.length
											? lead.imageCandidates
											: [lead.image];
										const idx = cands.findIndex((u) => u === e.currentTarget.src);
										const next = cands[idx + 1];
										e.currentTarget.src = next || cands[0];
									}}
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
								<div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
									<div className="mb-2 flex flex-wrap items-center gap-2">
										{lead.category ? (
											<span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-900 shadow">
												{lead.category}
											</span>
										) : null}
										<span className="text-[11px] font-medium text-white/85">
											{new Date(lead.publishedAt).toLocaleDateString()}
										</span>
									</div>
									<h2 className="line-clamp-2 text-2xl font-extrabold text-white sm:text-3xl">
										{lead.title}
									</h2>
									{lead.summary ? (
										<p className="mt-2 line-clamp-2 text-sm text-white/90">{lead.summary}</p>
									) : null}
								</div>
							</div>
						</Link>
					) : null}
				</div>
				<div className="lg:col-span-4">
					<div className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Top headlines</div>
						<ul className="divide-y divide-gray-200 dark:divide-gray-800">
							{sideHeadlines.map((h) => (
								<li key={h.url} className="py-3">
									<Link to={h.url} className="group block">
										<p className="line-clamp-2 text-sm font-semibold text-gray-900 transition group-hover:text-primary dark:text-white">
											{h.title}
										</p>
										<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
											{h.category} • {new Date(h.publishedAt).toLocaleDateString()}
										</p>
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>

			<MarketsStrip />

			{/* Latest Headlines section removed */}

			{/* Funding & Deals section removed */}

			{/* Trending Stories */}
			<section className="space-y-4">
				<SectionHeader title="Trending Stories" />
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div className="sm:col-span-2 lg:col-span-2">
						{analysis[0] ? <NewsCard article={analysis[0]} variant="featured" index={0} /> : null}
					</div>
					{analysis.slice(1, 3).map((a, idx) => (
						<NewsCard key={a.url} article={a} variant="tall" index={idx + 1} />
					))}
				</div>
				<div className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
					<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{analysis.slice(3, 9).map((a, idx) => (
							<li key={`${a.url}-mini`}>
								<Link to={a.url} className="group flex items-start gap-3">
									<img
										src={a.image}
										alt={a.title}
										className="h-14 w-20 flex-none rounded-lg object-cover ring-1 ring-gray-200 transition group-hover:ring-primary/30 dark:ring-gray-800"
										loading={idx < 3 ? "eager" : "lazy"}
										fetchpriority={idx < 3 ? "high" : "auto"}
										decoding="async"
											onError={(e) => {
												const cands = Array.isArray(a.imageCandidates) && a.imageCandidates.length
													? a.imageCandidates
													: [a.image];
												const idx = cands.findIndex((u) => u === e.currentTarget.src);
												const next = cands[idx + 1];
												e.currentTarget.src = next || cands[0];
											}}
									/>
									<div>
										<p className="line-clamp-2 text-sm font-semibold text-gray-900 transition group-hover:text-primary dark:text-white">
											{a.title}
										</p>
										<p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
											{a.summary}
										</p>
									</div>
								</Link>
							</li>
						))}
					</ul>
			</div>
			</section>

			{/* CTA Band (kept; not a content section) */}
			<HomepageCTABar />

			{/* Editor's Picks removed to keep exactly three sections */}

			<section className="grid gap-4 sm:grid-cols-2">
				<Link
					to="/opportunities"
					className="group relative overflow-hidden rounded-2xl border border-transparent bg-[#0B1220] p-6 text-white transition hover:ring-1 hover:ring-primary/40"
				>
					<h3 className="text-lg font-semibold">
						Find Opportunities
					</h3>
					<p className="mt-1 text-sm text-gray-300">
						Grants, accelerators, and partnerships tailored for MSMEs.
					</p>
					<div className="mt-4 text-sm font-semibold text-primary">Browse →</div>
					<div className="mt-2 text-xs text-white/80">Have an opportunity? <Link className="underline" to="/contact#contact-form">Submit it</Link></div>
				</Link>
				<Link
					to="/procurement-tenders"
					className="group relative overflow-hidden rounded-2xl border border-transparent bg-[#0B1220] p-6 text-white transition hover:ring-1 hover:ring-primary/40"
				>
					<h3 className="text-lg font-semibold">
						Procurement & Tenders
					</h3>
					<p className="mt-1 text-sm text-gray-300">
						Public and private tenders across Africa, updated regularly.
					</p>
					<div className="mt-4 text-sm font-semibold text-primary">Explore →</div>
					<div className="mt-2 text-xs text-white/80">Have a tender? <Link className="underline" to="/contact#contact-form">Post it</Link></div>
				</Link>
			</section>
		</div>
	);
}


