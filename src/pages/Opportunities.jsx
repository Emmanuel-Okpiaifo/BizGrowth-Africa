import { useMemo, useState } from "react";
import { Briefcase, Search, ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import SectionHeader from "../components/SectionHeader";
import OpportunityCard from "../components/OpportunityCard";
import useSavedOpportunities from "../hooks/useSavedOpportunities";
import { opportunities as allOpps } from "../data/opportunities.sample";
import BrandMarquee from "../components/BrandMarquee";
// import FeaturedCarousel from "../components/FeaturedCarousel";

export default function Opportunities() {
	const categories = ["All", "Grant", "Accelerator", "Competition", "Fellowship", "Training", "Impact Loan"];
	const regions = ["All", "West Africa", "East Africa", "Southern Africa", "North Africa", "Pan‑Africa"];
	const countries = ["All", ...Array.from(new Set(allOpps.map((o) => o.country)))];
	const tags = ["All", ...Array.from(new Set(allOpps.flatMap((o) => o.tags || [])))];

	const [q, setQ] = useState("");
	const [cat, setCat] = useState("All");
	const [region, setRegion] = useState("All");
	const [country, setCountry] = useState("All");
	const [tag, setTag] = useState("All");
	const [sort, setSort] = useState("Deadline"); // Deadline | Newest | Amount
	const [featuredOnly, setFeaturedOnly] = useState(false);

	const { ids: saved, toggle: toggleSaved, has: isSaved } = useSavedOpportunities();

	const stats = useMemo(() => {
		const active = allOpps.filter((o) => !o.deadline || new Date(o.deadline) >= new Date()).length;
		const total = allOpps.length;
		const grantTotal = allOpps
			.filter((o) => o.category?.toLowerCase().includes("grant"))
			.reduce((sum, o) => sum + (o.amountMax || 0), 0);
		return { active, total, grantTotal };
	}, []);

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

	const featured = useMemo(() => allOpps.filter((o) => o.featured).slice(0, 3), []);
	const mostPopular = useMemo(() => {
		return allOpps
			.slice()
			.sort((a, b) => new Date(b.postedAt || "1970-01-01") - new Date(a.postedAt || "1970-01-01"))
			.slice(0, 6);
	}, []);

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
				<div className="mt-4 grid gap-3 sm:grid-cols-3">
					<div className="rounded-xl border bg-white/80 p-4 text-sm backdrop-blur ring-1 ring-gray-200 dark:border-gray-800 dark:bg-white/5 dark:ring-gray-800 col-span-full sm:col-span-1">
						<div className="text-xs text-gray-500 dark:text-gray-400">Total programs</div>
						<div className="text-lg font-extrabold text-gray-900 dark:text-white">{stats.total}</div>
					</div>
				</div>
				<div className="mt-4">
					<BrandMarquee />
				</div>
			</header>

			{/* Hero Carousel removed per request */}

			<div className="grid gap-6 lg:grid-cols-[300px,1fr]">
				{/* Sticky Sidebar Filters */}
				<aside className="lg:sticky lg:top-20">
					<div className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
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
					<SectionHeader title="Most Popular" />
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{mostPopular.map((opp) => (
							<OpportunityCard key={opp.id} opp={opp} saved={isSaved(opp.id)} onToggleSave={toggleSaved} showImage />
						))}
					</div>

					<div id="all" />
					<SectionHeader title="All Opportunities" />
					{filtered.length === 0 ? (
						<div className="rounded-2xl border bg-white p-10 text-center text-sm text-gray-600 ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:text-gray-300 dark:ring-gray-800">
							No opportunities match your filters. Try broadening your search.
						</div>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{filtered.map((opp) => (
								<OpportunityCard key={opp.id} opp={opp} saved={isSaved(opp.id)} onToggleSave={toggleSaved} />
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}

