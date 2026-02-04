import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Briefcase, Calendar } from "lucide-react";
import { useGoogleSheetsOpportunities } from "../hooks/useGoogleSheetsOpportunities";
import { getOpportunityImage } from "../data/opportunities.images";

const DISPLAY_COUNT = 6;

export default function HomeOpportunitiesGrid() {
	const { opportunities, loading, error } = useGoogleSheetsOpportunities();

	const latest = useMemo(() => {
		const list = opportunities
			.map((opp) => ({
				...opp,
				id: opp.id || `opp-${(opp.title || "").toLowerCase().replace(/\s+/g, "-")}`,
			}))
			.slice(0, DISPLAY_COUNT);
		return list;
	}, [opportunities]);

	if (loading) {
		return (
			<section className="relative overflow-hidden py-16 sm:py-20">
				<div className="absolute inset-0 bg-[#0B1220]" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(220,38,38,0.12),transparent)]" />
				<div className="relative mx-auto max-w-6xl px-4">
					<div className="mb-10 h-8 w-48 animate-pulse rounded bg-white/10" />
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div key={i} className="h-64 animate-pulse rounded-2xl bg-white/5" />
						))}
					</div>
				</div>
			</section>
		);
	}

	if (error || latest.length === 0) {
		return null;
	}

	return (
		<section className="relative overflow-hidden py-16 sm:py-20" aria-labelledby="opportunities-grid-title">
			{/* Background: distinct from all other sections */}
			<div className="absolute inset-0 bg-[#0B1220]" />
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(220,38,38,0.14),transparent)]" />
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_50%,rgba(220,38,38,0.06),transparent)]" />
			<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

			<div className="relative mx-auto max-w-6xl px-4">
				{/* Section header: premium, not SectionHeader */}
				<header className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<div className="mb-1.5 h-0.5 w-12 bg-primary" aria-hidden />
						<h2 id="opportunities-grid-title" className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
							Latest opportunities
						</h2>
						<p className="mt-1.5 max-w-xl text-sm text-white/70">
							Grants, accelerators, and programs for African MSMEs — updated regularly.
						</p>
					</div>
					<Link
						to="/opportunities"
						className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/90 sm:mt-0"
					>
						View all <ArrowUpRight size={16} />
					</Link>
				</header>

				{/* Grid: premium card design — different from news/trending cards */}
				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{latest.map((opp) => (
						<OpportunityGridCard key={opp.id} opp={opp} />
					))}
				</div>
			</div>
		</section>
	);
}

function OpportunityGridCard({ opp }) {
	const img = opp.heroImage || getOpportunityImage(opp);
	const deadline = opp.deadline ? new Date(opp.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "TBA";
	const oppId = opp.id || `opp-${(opp.title || "").toLowerCase().replace(/\s+/g, "-")}`;

	return (
		<Link
			to={`/opportunities/${encodeURIComponent(oppId)}`}
			className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition hover:border-primary/30 hover:bg-white/10 dark:border-white/10 dark:bg-white/5 dark:hover:border-primary/30"
		>
			{/* Category tag: always visible, like other sections */}
			<div className="absolute left-4 top-4 z-10">
				<span className="inline-flex rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg">
					{opp.category || "Opportunity"}
				</span>
			</div>

			{/* Image strip */}
			<div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-800">
				{img ? (
					<img
						src={img}
						alt=""
						className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
						loading="lazy"
						decoding="async"
						onError={(e) => {
							e.currentTarget.style.display = "none";
							const fallback = e.currentTarget.nextElementSibling;
							if (fallback) fallback.classList.remove("hidden");
						}}
					/>
				) : null}
				<div
					className={`absolute inset-0 bg-gradient-to-br from-primary/20 via-gray-800 to-[#0B1220] ${img ? "hidden" : ""}`}
					aria-hidden
				>
					<div className="flex h-full items-center justify-center">
						<Briefcase className="h-12 w-12 text-white/20" aria-hidden />
					</div>
				</div>
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col p-4">
				<h3 className="line-clamp-2 text-base font-semibold leading-snug text-white transition group-hover:text-primary">
					{opp.title}
				</h3>
				{opp.org ? (
					<p className="mt-1 text-xs text-white/60">{opp.org}</p>
				) : null}
				<div className="mt-3 flex items-center gap-2 text-xs text-white/50">
					<Calendar size={12} className="shrink-0" aria-hidden />
					<span>Deadline {deadline}</span>
				</div>
				<div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary">
					<span>View opportunity</span>
					<ArrowUpRight size={14} className="shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
				</div>
			</div>
		</Link>
	);
}
