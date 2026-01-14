import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "../components/SEO";
import SectionHeader from "../components/SectionHeader";
import { opportunities } from "../data/opportunities.sample";
import { getOpportunityImage, buildOpportunityImageCandidates } from "../data/opportunities.images";
import { Calendar, MapPin, BadgeDollarSign, Tag, ArrowRight, Building2 } from "lucide-react";

function formatAmount(min, max, currency = "USD") {
	if ((min ?? 0) === 0 && (max ?? 0) === 0) return "Non‑dilutive / In‑kind";
	const fmt = (v) => (typeof v === "number" ? v.toLocaleString() : "");
	if (min && max && min !== max) return `${currency} ${fmt(min)}–${fmt(max)}`;
	const val = max || min || 0;
	return `${currency} ${fmt(val)}`;
}

export default function OpportunityDetail() {
	const { id } = useParams();
	const opp = opportunities.find((o) => o.id === id);

	if (!opp) {
		return (
			<div className="mx-auto max-w-3xl">
				<div className="rounded-2xl border bg-red-50 p-8 text-center shadow-sm ring-1 ring-red-100 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Opportunity not found</h1>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">This opportunity may have expired or been removed.</p>
					<Link to="/opportunities" className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">Back to Opportunities</Link>
				</div>
			</div>
		);
	}

	const amount = formatAmount(opp.amountMin, opp.amountMax, opp.currency);
	const deadline = opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "TBA";
	const more = opportunities.filter((o) => o.id !== opp.id).slice(0, 6);

	// Images
	const candidates = useMemo(() => {
		const arr = [getOpportunityImage(opp), ...buildOpportunityImageCandidates(opp)];
		return Array.from(new Set(arr.filter(Boolean)));
	}, [opp]);
	const [heroSrc, setHeroSrc] = useState(candidates[0]);
	useEffect(() => {
		setHeroSrc(candidates[0]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	return (
		<div className="mx-auto max-w-6xl space-y-8">
			<SEO
				title={`${opp.title} — Opportunity`}
				description={`${opp.org} • ${opp.region} • ${opp.category}`}
				type="website"
				canonicalPath={`/opportunities/${encodeURIComponent(opp.id)}`}
			/>

			{/* Breadcrumb */}
			<nav className="text-xs text-gray-500 dark:text-gray-400">
				<Link to="/" className="hover:text-primary">Home</Link> <span>/</span>{" "}
				<Link to="/opportunities" className="hover:text-primary">Opportunities</Link> <span>/</span>{" "}
				<span className="text-gray-700 dark:text-gray-300">{opp.title}</span>
			</nav>

			{/* Hero */}
			<header className="relative overflow-hidden rounded-2xl">
				<div className="relative aspect-[16/9]">
					<img
						src={heroSrc}
						alt={opp.title}
						className="absolute inset-0 h-full w-full object-cover"
						loading="eager"
						decoding="async"
						onError={(e) => {
							const i = candidates.indexOf(e.currentTarget.src);
							const next = candidates[i + 1] || candidates[0];
							if (next && next !== e.currentTarget.src) setHeroSrc(next);
						}}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
				</div>
				<div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
					{opp.category ? (
						<span className="mb-2 inline-block rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-gray-900 shadow dark:bg-black/60 dark:text-white">
							{opp.category}
						</span>
					) : null}
					<h1 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">{opp.title}</h1>
				</div>
			</header>

			{/* Body */}
			<section className="grid gap-8 lg:grid-cols-[1fr,320px]">
				{/* Left column: Apply → Description → Body */}
				<article className="space-y-6">
					<div className="rounded-2xl border bg-red-50 p-5 shadow-sm ring-1 ring-red-100 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						{/* Apply first */}
						<div className="flex flex-wrap items-center gap-3">
							<a
								href={opp.link || "#"}
								target={opp.link ? "_blank" : "_self"}
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
							>
								Apply Now <ArrowRight size={16} />
							</a>
						</div>

						{/* Description (immediately after Apply) */}
						<p className="mt-4 text-[16px] leading-relaxed text-gray-800 md:text-[17px] dark:text-gray-200">
							{opp.description}
						</p>

						{/* Long-form body */}
						<div className="mt-4 space-y-4 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
							<p>
								It is a long established fact that a reader will be distracted by the readable content of a page when
								looking at its layout. This program focuses on practical outcomes for MSMEs, pairing capital with mentorship
								and market access.
							</p>
							<p>
								Successful applicants receive structured support across compliance, go‑to‑market, and fundraising readiness.
								The goal is to accelerate traction while de‑risking execution and improving resilience.
							</p>
							<ul className="mt-2 grid gap-3 sm:grid-cols-2">
								<li>
									<img src={candidates[1] || heroSrc} alt={opp.title} className="h-48 w-full rounded-lg object-cover" loading="lazy" decoding="async" />
								</li>
								<li>
									<img src={candidates[2] || heroSrc} alt={opp.title} className="h-48 w-full rounded-lg object-cover" loading="lazy" decoding="async" />
								</li>
							</ul>
							<blockquote className="mt-2 border-l-4 border-primary pl-4">
								“Strong programs combine funding, mentorship, and market access. Real impact is measured by revenue
								growth, jobs created, and resilience.”
							</blockquote>
						</div>

						{/* Tags */}
						{Array.isArray(opp.tags) && opp.tags.length ? (
							<ul className="mt-4 flex flex-wrap items-center gap-2 text-sm">
								<li className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Tags</li>
								{opp.tags.map((t) => (
									<li key={t}>
										<span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-white/5 dark:text-gray-300">
											<Tag size={12} /> {t}
										</span>
									</li>
								))}
							</ul>
						) : null}
					</div>

					{/* Related */}
					<div className="space-y-3">
						<SectionHeader title="Related Opportunities" />
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{more.map((m) => {
								const img = getOpportunityImage(m);
								const when = m.postedAt ? new Date(m.postedAt).toLocaleDateString() : (m.deadline ? new Date(m.deadline).toLocaleDateString() : "TBA");
								return (
									<Link key={m.id} to={`/opportunities/${encodeURIComponent(m.id)}`} className="group relative overflow-hidden rounded-xl bg-red-50 ring-1 ring-red-100 dark:bg-[#0B1220]">
										<div className="relative">
											<img src={img} alt={m.title} className="h-28 w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" decoding="async" />
											{m.category ? (
												<span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-gray-900 shadow dark:bg-black/60 dark:text-white">
													{m.category}
												</span>
											) : null}
										</div>
										<div className="p-3">
											<div className="text-[12px] text-gray-600 dark:text-gray-400">{when}</div>
											<h3 className="mt-1 line-clamp-2 text-[14px] font-semibold leading-snug text-gray-900 group-hover:text-primary dark:text-white">
												{m.title}
											</h3>
										</div>
									</Link>
								);
							})}
						</div>
					</div>
				</article>

				{/* Right column: sticky info panel */}
				<aside className="lg:sticky lg:top-20">
					<div className="rounded-2xl border bg-red-50 p-5 shadow-sm ring-1 ring-red-100 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="flex items-start gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
								<Building2 size={16} />
							</div>
							<div>
								<div className="text-xs text-gray-500 dark:text-gray-400">Organisation</div>
								<div className="text-sm font-semibold text-gray-900 dark:text-white">{opp.org}</div>
							</div>
						</div>
						<div className="mt-4 grid gap-3">
							<div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
								<MapPin size={16} className="text-primary" />
								<span>{opp.region}{opp.country ? ` • ${opp.country}` : ""}</span>
							</div>
							<div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
								<BadgeDollarSign size={16} className="text-primary" />
								<span>{amount}</span>
							</div>
							<div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
								<Calendar size={16} className="text-primary" />
								<span>Deadline: {deadline}</span>
							</div>
							{opp.category ? (
								<div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
									<Tag size={16} className="text-primary" />
									<span>{opp.category}</span>
								</div>
							) : null}
						</div>
						<a
							href={opp.link || "#"}
							target={opp.link ? "_blank" : "_self"}
							rel="noopener noreferrer"
							className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
						>
							Apply Now <ArrowRight size={16} />
						</a>
					</div>
				</aside>
			</section>
		</div>
	);
}

