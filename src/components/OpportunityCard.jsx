import { ArrowRight, Star, Calendar, Globe2, MapPin, BadgeDollarSign, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { getOpportunityImage } from "../data/opportunities.images";

function formatAmount(min, max, currency = "USD") {
	if ((min ?? 0) === 0 && (max ?? 0) === 0) return "Non‑dilutive / In‑kind";
	const fmt = (v) => (typeof v === "number" ? v.toLocaleString() : "");
	if (min && max && min !== max) return `${currency} ${fmt(min)}–${fmt(max)}`;
	const val = max || min || 0;
	return `${currency} ${fmt(val)}`;
}

function getOrgInitials(name = "") {
	const parts = String(name).trim().split(/\s+/).slice(0, 2);
	return parts.map((p) => p[0]?.toUpperCase() || "").join("");
}

export default function OpportunityCard({ opp, saved = false, onToggleSave, framed = true, showImage = false, styleVariant = "aurora", index = 0 }) {
	const amount = formatAmount(opp.amountMin, opp.amountMax, opp.currency);
	const deadline = opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "TBA";
	const featured = !!opp.featured;
	const orgInitials = getOrgInitials(opp.org);
	// Prioritize heroImage if available, then fall back to getOpportunityImage
	const img = useMemo(() => {
		if (!showImage) return null;
		return opp.heroImage || getOpportunityImage(opp);
	}, [showImage, opp.heroImage, opp]);
	const [loaded, setLoaded] = useState(false);
	const isAurora = styleVariant === "aurora";
	const innerBase =
		"group relative block rounded-2xl border bg-white p-5 shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-[#0B1220]";
	const innerClasses = isAurora
		? `${innerBase} ring-gray-200 hover:ring-primary/30 dark:ring-gray-800`
		: `${innerBase} ring-gray-200 hover:ring-primary/20 dark:ring-gray-800`;
	const Inner = (
		<div className={innerClasses}>
			{isAurora ? (
				<>
					<div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-fuchsia-500/15 blur-3xl" />
					<div className="pointer-events-none absolute -left-14 -bottom-16 h-36 w-36 rounded-full bg-sky-400/15 blur-3xl" />
					<div className="pointer-events-none absolute right-10 bottom-10 h-20 w-20 rounded-full bg-emerald-400/15 blur-2xl" />
				</>
			) : (
				<>
					<div className="pointer-events-none absolute -right-10 -top-10 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
					<div className="pointer-events-none absolute -bottom-10 -left-10 h-20 w-20 rounded-full bg-emerald-400/10 blur-2xl" />
				</>
			)}
			{featured ? (
				<div className={isAurora ? "absolute left-0 top-0 rounded-br-xl rounded-tl-2xl bg-gradient-to-r from-fuchsia-500 via-sky-500 to-emerald-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow" : "absolute left-0 top-0 rounded-br-xl rounded-tl-2xl bg-gradient-to-r from-primary to-emerald-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow"}>
					Featured
				</div>
			) : null}
			{img ? (
				<div className="mb-3 overflow-hidden rounded-xl">
					<div className="relative aspect-[16/9]">
						{!loaded ? <div className="absolute inset-0 animate-pulse bg-gray-100/60 dark:bg-white/10" /> : null}
						<img
							src={img}
							alt={opp.title}
							className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
							loading={index < 4 ? "eager" : "lazy"}
							fetchpriority={index < 4 ? "high" : "auto"}
							decoding="async"
							onLoad={() => setLoaded(true)}
						/>
						<div className={isAurora ? "absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 via-black/20 to-transparent" : "absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent"} />
					</div>
				</div>
			) : null}
			<button
				onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave?.(opp.id); }}
				className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent hover:bg-black/5 dark:hover:bg-white/10"
				aria-label={saved ? "Unsave opportunity" : "Save opportunity"}
				title={saved ? "Unsave opportunity" : "Save opportunity"}
			>
				<Star size={16} className={saved ? "text-yellow-500" : "text-gray-400"} />
			</button>
			<div className="flex items-start gap-3 pr-10">
				<div className={isAurora ? "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500/15 via-sky-500/15 to-emerald-500/15 text-[12px] font-extrabold text-primary ring-1 ring-white/30 backdrop-blur dark:text-white" : "flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[12px] font-extrabold text-primary dark:bg-white/10 dark:text-white"}>
					{orgInitials || <Building2 size={14} />}
				</div>
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{opp.org}</span>
						{opp.category ? (
							<span className={isAurora ? "rounded-full bg-gradient-to-r from-fuchsia-500/15 via-sky-500/15 to-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-gray-700 ring-1 ring-white/30 dark:text-gray-200" : "rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-200"}>
								{opp.category}
							</span>
						) : null}
					</div>
					<h3 className={isAurora ? "mt-0.5 line-clamp-2 text-[18px] font-semibold leading-snug text-gray-900 transition group-hover:text-fuchsia-600 dark:text-white" : "mt-0.5 line-clamp-2 text-[17px] font-semibold leading-snug text-gray-900 transition group-hover:text-primary dark:text-white"}>
						{opp.title}
					</h3>
				</div>
			</div>
			<div className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-gray-700 dark:text-gray-300 [&>p]:inline [&>p]:my-0 [&>p:not(:last-child)]:after:content-['_']" dangerouslySetInnerHTML={{ __html: opp.description || '' }} />
			<div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:flex sm:flex-wrap">
				<span className={isAurora ? "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-gray-700 ring-white/30 dark:border-gray-700 dark:text-gray-300" : "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-gray-700 dark:border-gray-700 dark:text-gray-300"}>
					<Globe2 size={12} /> {opp.region || "—"}
				</span>
				<span className={isAurora ? "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-gray-700 ring-white/30 dark:border-gray-700 dark:text-gray-300" : "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-gray-700 dark:border-gray-700 dark:text-gray-300"}>
					<MapPin size={12} /> {opp.country || "—"}
				</span>
				<span className={isAurora ? "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-gray-700 ring-white/30 dark:border-gray-700 dark:text-gray-300" : "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-gray-700 dark:border-gray-700 dark:text-gray-300"}>
					<Calendar size={12} /> {deadline}
				</span>
				<span className={isAurora ? "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-gray-700 ring-white/30 dark:border-gray-700 dark:text-gray-300" : "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-gray-700 dark:border-gray-700 dark:text-gray-300"}>
					<BadgeDollarSign size={12} /> {amount}
				</span>
			</div>
			{Array.isArray(opp.tags) && opp.tags.length ? (
				<div className="mt-3 flex flex-wrap gap-1.5">
					{opp.tags.slice(0, 5).map((t) => (
						<span key={t} className={isAurora ? "rounded-md bg-gradient-to-r from-fuchsia-500/10 via-sky-500/10 to-emerald-500/10 px-2 py-1 text-[11px] text-gray-700 ring-1 ring-white/30 dark:text-gray-300" : "rounded-md bg-gray-100 px-2 py-1 text-[11px] text-gray-700 dark:bg-white/5 dark:text-gray-300"}>{t}</span>
					))}
				</div>
			) : null}
			<div className="mt-4 flex items-center justify-between">
				<div className="text-xs text-gray-500 dark:text-gray-400">Posted {opp.postedAt ? new Date(opp.postedAt).toLocaleDateString() : "—"}</div>
				<a
					onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
					href={opp.link || "#"}
					target={opp.link ? "_blank" : "_self"}
					rel="noopener noreferrer"
					className={isAurora ? "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 via-sky-600 to-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90" : "inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"}
				>
					Apply Now <ArrowRight size={14} />
				</a>
			</div>
		</div>
	);
	return framed ? (
		<Link to={`/opportunities/${encodeURIComponent(opp.id)}`} className={isAurora ? "group relative block rounded-2xl bg-gradient-to-br from-fuchsia-500/30 via-sky-500/30 to-emerald-400/30 p-[1px]" : "group relative block rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-400/20 p-[1px]"}>
			{Inner}
		</Link>
	) : (
		<Link to={`/opportunities/${encodeURIComponent(opp.id)}`} className="group relative block">
			{Inner}
		</Link>
	);
}

 
