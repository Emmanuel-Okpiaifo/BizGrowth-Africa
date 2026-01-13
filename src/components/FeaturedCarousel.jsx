import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Building2 } from "lucide-react";
import { getOpportunityImage } from "../data/opportunities.images";

function formatDeadline(deadline) {
	if (!deadline) return "Deadline TBA";
	const d = new Date(deadline);
	if (Number.isNaN(d.getTime())) return "Deadline TBA";
	const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
	if (diff < 0) return `Closed ${d.toLocaleDateString()}`;
	if (diff === 0) return "Deadline today";
	return `${diff} day${diff === 1 ? "" : "s"} left`;
}

export default function FeaturedCarousel({ items = [], autoMs = 0 }) {
	const slides = useMemo(() => items.slice(0, 5), [items]);
	const [i, setI] = useState(0);
	const go = (dir) => setI((prev) => (prev + dir + slides.length) % slides.length);

	useEffect(() => {
		if (!autoMs) return;
		const t = setInterval(() => go(1), autoMs);
		return () => clearInterval(t);
	}, [autoMs, slides.length]);

	if (!slides.length) return null;
	const opp = slides[i];
	const img = getOpportunityImage(opp);

	return (
		<div className="relative overflow-hidden rounded-2xl border bg-black/5 ring-1 ring-gray-200 dark:border-gray-800 dark:bg-white/5 dark:ring-gray-800">
			<div className="relative aspect-[16/7]">
				<img
					src={img}
					alt={opp.title}
					className="absolute inset-0 h-full w-full object-cover opacity-90"
					loading="eager"
					decoding="async"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
				<div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
					<div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-white/85">
						<span className="rounded-full bg-white/15 px-2 py-1 font-semibold uppercase tracking-wide">{opp.category}</span>
						<span className="inline-flex items-center gap-1"><Building2 size={12} /> {opp.org}</span>
						<span className="inline-flex items-center gap-1"><Clock size={12} /> {formatDeadline(opp.deadline)}</span>
					</div>
					<Link to={`/opportunities/${encodeURIComponent(opp.id)}`} className="group block max-w-3xl">
						<h3 className="line-clamp-3 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
							{opp.title}
						</h3>
						{opp.description ? (
							<p className="mt-2 line-clamp-2 text-sm text-white/90">{opp.description}</p>
						) : null}
						<div className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition group-hover:opacity-90">
							View details
						</div>
					</Link>
				</div>
			</div>
			<button
				aria-label="Previous"
				className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60"
				onClick={() => go(-1)}
			>
				<ArrowLeft size={16} />
			</button>
			<button
				aria-label="Next"
				className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60"
				onClick={() => go(1)}
			>
				<ArrowRight size={16} />
			</button>
			<div className="pointer-events-none absolute right-4 top-4 space-x-1">
				{slides.map((_, idx) => (
					<span
						key={idx}
						className={["inline-block h-1.5 w-4 rounded-full", idx === i ? "bg-white" : "bg-white/40"].join(" ")}
					/>
				))}
			</div>
		</div>
	);
}

