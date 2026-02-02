import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Search, ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import { opportunities as placeholderOpps } from "../data/opportunities.sample";
import BrandMarquee from "../components/BrandMarquee";
import { getOpportunityImage, buildOpportunityImageCandidates } from "../data/opportunities.images";
import { useDailyOriginalArticles } from "../data/useDailyOriginalArticles";
import { useGoogleSheetsOpportunities } from "../hooks/useGoogleSheetsOpportunities";

function hashStringToInt(str) {
	let h = 0;
	const s = String(str);
	for (let i = 0; i < s.length; i++) {
		h = (h * 31 + s.charCodeAt(i)) >>> 0;
	}
	return h >>> 0;
}

function pickNewsImageForOpportunity(opp, articles) {
	if (!Array.isArray(articles) || articles.length === 0) return null;
	const key = String(opp.id || opp.title || "");
	const start = hashStringToInt(key) % articles.length;
	let chosen = articles[start]?.image;
	if (chosen) return chosen;
	for (let i = 1; i < articles.length; i++) {
		const j = (start + i) % articles.length;
		const img = articles[j]?.image;
		if (img) return img;
	}
	return null;
}

export default function Opportunities() {
	const { opportunities: sheetsOpps, loading: sheetsLoading, error: sheetsError } = useGoogleSheetsOpportunities();
	
	// Combine Google Sheets opportunities with placeholders
	const allOpps = useMemo(() => {
		// Map Google Sheets opportunities to match placeholder format
		const mappedSheets = sheetsOpps.map(opp => ({
			...opp,
			id: opp.id || `opp-${opp.title?.toLowerCase().replace(/\s+/g, '-')}`,
			// Ensure all required fields are present
			featured: opp.featured === true || opp.featured === 'true',
			tags: Array.isArray(opp.tags) ? opp.tags : (opp.tags ? [opp.tags] : [])
		}));
		
		// Combine with placeholders, prioritizing Google Sheets
		const combined = [...mappedSheets, ...placeholderOpps];
		// Remove duplicates by ID/title, keeping Google Sheets first
		const seen = new Set();
		return combined.filter(opp => {
			const key = opp.id || opp.title;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
	}, [sheetsOpps]);
	
	const categories = ["All", "Grant", "Accelerator", "Competition", "Fellowship", "Training", "Impact Loan"];
	const regions = ["All", "West Africa", "East Africa", "Southern Africa", "North Africa", "Pan‑Africa"];
	const countries = ["All", ...Array.from(new Set(allOpps.map((o) => o.country).filter(Boolean)))];
	const tags = ["All", ...Array.from(new Set(allOpps.flatMap((o) => o.tags || []).filter(Boolean)))];

	const [q, setQ] = useState("");
	const [cat, setCat] = useState("All");
	const [region, setRegion] = useState("All");
	const [country, setCountry] = useState("All");
	const [tag, setTag] = useState("All");
	const [sort, setSort] = useState("Deadline"); // Deadline | Newest | Amount
	const [featuredOnly, setFeaturedOnly] = useState(false);

	const filtered = useMemo(() => {
		let items = allOpps.slice();
		if (featuredOnly) items = items.filter((o) => o.featured);
		if (cat !== "All") items = items.filter((o) => (o.category || "").toLowerCase().includes(cat.toLowerCase()));
		if (region !== "All") items = items.filter((o) => (o.region || "") === region);
		if (country !== "All") items = items.filter((o) => (o.country || "") === country);
		if (tag !== "All") items = items.filter((o) => (o.tags || []).includes(tag));
		if (q.trim()) {
			const qq = q.trim().toLowerCase();
			items = items.filter((o) =>
				[o.title, o.org, o.country, o.region, o.category, (o.tags || []).join(" ")].join(" ").toLowerCase().includes(qq)
			);
		}
		if (sort === "Deadline") {
			items.sort((a, b) => new Date(a.deadline || "2100-01-01") - new Date(b.deadline || "2100-01-01"));
		} else if (sort === "Newest") {
			items.sort((a, b) => new Date(b.postedAt || "1970-01-01") - new Date(a.postedAt || "1970-01-01"));
		} else if (sort === "Amount") {
			items.sort((a, b) => (b.amountMax || 0) - (a.amountMax || 0));
		}
		return items;
	}, [featuredOnly, cat, region, country, tag, q, sort]);

	// Limit listing to 3 items (as requested)
	const paged = filtered.slice(0, 3);
	const { articles: newsArticles } = useDailyOriginalArticles();

	return (
		<div className="space-y-8">
			<SEO
				title="Opportunities — Grants, Accelerators, Tenders | BizGrowth Africa"
				description="Curated grants, accelerators, competitions, and programs for African MSMEs. Filter by category, region, country, tags, and funding size."
				type="website"
				canonicalPath="/opportunities"
			/>
			<header className="relative overflow-hidden rounded-2xl p-6">
				<div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/15 via-white to-primary/10 dark:via-[#0B1220]" />
				<div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
				<div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
				<div className="space-y-3">
					<div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-[11px] font-semibold tracking-wide text-gray-700 backdrop-blur dark:bg-white/10 dark:text-gray-200">
						BizGrowth Africa • Curated Weekly
					</div>
					<h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
						<Briefcase size={22} /> Opportunities for African MSMEs
					</h1>
					<p className="max-w-3xl text-[15px] text-gray-700 dark:text-gray-300">
						Handpicked grants, accelerators, competitions and training with real business impact. Zero fluff — just programs that move the needle.
					</p>
					<div className="flex flex-wrap gap-3">
						<a href="#featured" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
							Explore Featured <ArrowRight size={14} />
						</a>
						<a href="#all" className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-white dark:hover:bg-gray-800">
							Browse All
						</a>
					</div>
				</div>
				<div className="mt-4">
					<BrandMarquee />
				</div>
			</header>

			{sheetsError && (
				<div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
					Could not load opportunities from the server. Showing sample opportunities. ({sheetsError})
				</div>
			)}

			{/* Hero Carousel removed per request */}

			<div className="grid gap-6 lg:grid-cols-[300px,1fr]">
				{/* Sticky Sidebar Filters */}
				<aside className="lg:sticky lg:top-20">
					<div className="rounded-2xl border bg-red-50 p-4 shadow-sm ring-1 ring-red-100 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="grid gap-3">
							<label className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm dark:border-gray-700">
								<Search size={14} className="text-gray-500" />
								<input
									value={q}
									onChange={(e) => setQ(e.target.value)}
									placeholder="Search title, org, tags…"
									className="w-full bg-transparent outline-none"
								/>
							</label>
							<select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white">
								{categories.map((c) => (<option key={c} value={c}>{c}</option>))}
							</select>
							<select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white">
								{regions.map((r) => (<option key={r} value={r}>{r}</option>))}
							</select>
							<select value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white">
								{countries.map((r) => (<option key={r} value={r}>{r}</option>))}
							</select>
							<select value={tag} onChange={(e) => setTag(e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white">
								{tags.map((r) => (<option key={r} value={r}>{r}</option>))}
							</select>
							<select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white">
								<option>Deadline</option>
								<option>Newest</option>
								<option>Amount</option>
							</select>
							<label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
								<input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />
								<span>Featured only</span>
							</label>
							<button
								onClick={() => { setQ(""); setCat("All"); setRegion("All"); setCountry("All"); setTag("All"); setSort("Deadline"); setFeaturedOnly(false); }}
								className="rounded-lg border px-3 py-2 text-sm font-semibold text-primary dark:border-gray-700"
							>
								Reset filters
							</button>
						</div>
					</div>
				</aside>

				{/* Main Content */}
				<section className="space-y-6" id="featured">
					<div id="all" />
					{paged.length === 0 ? (
						<div className="rounded-2xl border bg-red-50 p-10 text-center text-sm text-gray-600 ring-1 ring-red-100 dark:border-gray-800 dark:bg-[#0B1220] dark:text-gray-300 dark:ring-gray-800">
							No opportunities match your filters. Try broadening your search.
						</div>
					) : (
						<div className="grid gap-6 sm:grid-cols-2">
							{paged.map((opp, idx) => {
								const date = opp.postedAt || opp.deadline;
								const preferred = pickNewsImageForOpportunity(opp, newsArticles);
								// Prioritize heroImage if available
								const hero = opp.heroImage || '';
								const cands = (() => {
									const arr = [];
									if (preferred) arr.push(preferred);
									arr.push(...buildOpportunityImageCandidates(opp));
									// unique while preserving order
									return Array.from(new Set(arr.filter(Boolean)));
								})();
								const img = hero || cands[0] || getOpportunityImage(opp);
								return (
									<article key={opp.id} className="relative">
										<Link to={`/opportunities/${encodeURIComponent(opp.id)}`} className="group block overflow-hidden rounded-xl">
											<div className="relative aspect-[16/9]">
												<img
													src={img}
													alt={opp.title}
													className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
													loading={idx < 4 ? "eager" : "lazy"}
													fetchpriority={idx < 4 ? "high" : "auto"}
													decoding="async"
													onError={(e) => {
														try {
															const current = e.currentTarget.src;
															const hero = opp.heroImage || '';
															const allCandidates = hero ? [hero, ...cands] : cands;
															const idx = allCandidates.indexOf(current);
															const next = allCandidates[idx + 1] || allCandidates[0];
															if (next && next !== current) {
																e.currentTarget.src = next;
															} else {
																// final fallback to picsum seed by title
																e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(opp.id || opp.title || "opp")}/1600/900`;
															}
														} catch {}
													}}
												/>
												{opp.category ? (
													<div className="absolute left-2 top-2">
														<span className="rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-gray-900 shadow dark:bg-black/60 dark:text-white">
															{opp.category}
														</span>
													</div>
												) : null}
											</div>
										</Link>
										<div className="mt-2 text-[12px] text-gray-600 dark:text-gray-400">
											<ul className="flex flex-wrap items-center gap-2">
												<li className="flex items-center gap-1">
													<span>{date ? new Date(date).toLocaleDateString() : "TBA"}</span>
												</li>
											</ul>
										</div>
										<h3 className="title-medium-dark size-lg mb-0 mt-1 text-[18px] font-semibold leading-snug text-gray-900 hover:text-primary dark:text-white">
											<Link to={`/opportunities/${encodeURIComponent(opp.id)}`}>{opp.title}</Link>
										</h3>
										{opp.description ? (
											<p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-gray-700 dark:text-gray-300">
												{opp.description}
											</p>
										) : null}
										<div className="mt-3">
											<Link
												to={`/opportunities/${encodeURIComponent(opp.id)}`}
												className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-gray-900 transition hover:bg-red-100 dark:border-gray-700 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
											>
												Read more <ArrowRight size={14} />
											</Link>
										</div>
									</article>
								);
							})}
						</div>
					)}
					{/* Pagination removed since we now show only 3 items */}
				</section>
			</div>
		</div>
	);
}

