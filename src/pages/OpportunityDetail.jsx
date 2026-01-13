import { Link, useParams } from "react-router-dom";
import SEO from "../components/SEO";
import SectionHeader from "../components/SectionHeader";
import { opportunities } from "../data/opportunities.sample";
import OpportunityCard from "../components/OpportunityCard";
import { ArrowRight } from "lucide-react";

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
				<div className="rounded-2xl border bg-white p-8 text-center shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
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

	return (
		<div className="mx-auto max-w-5xl space-y-8">
			<SEO
				title={`${opp.title} — Opportunity`}
				description={`${opp.org} • ${opp.region} • ${opp.category}`}
				type="website"
				canonicalPath={`/opportunities/${encodeURIComponent(opp.id)}`}
			/>

			<nav className="text-xs text-gray-500 dark:text-gray-400">
				<Link to="/" className="hover:text-primary">Home</Link> <span>/</span>{" "}
				<Link to="/opportunities" className="hover:text-primary">Opportunities</Link> <span>/</span>{" "}
				<span className="text-gray-700 dark:text-gray-300">{opp.title}</span>
			</nav>

			<header className="rounded-2xl bg-gradient-to-br from-primary/10 via-white to-primary/5 p-6 dark:via-[#0B1220]">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">{opp.title}</h1>
				<p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{opp.description}</p>
				<div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-xl border bg-white p-4 text-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="text-xs text-gray-500 dark:text-gray-400">Organisation</div>
						<div className="text-sm font-semibold text-gray-900 dark:text-white">{opp.org}</div>
					</div>
					<div className="rounded-xl border bg-white p-4 text-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="text-xs text-gray-500 dark:text-gray-400">Region / Country</div>
						<div className="text-sm font-semibold text-gray-900 dark:text-white">{opp.region} • {opp.country}</div>
					</div>
					<div className="rounded-xl border bg-white p-4 text-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="text-xs text-gray-500 dark:text-gray-400">Funding / Support</div>
						<div className="text-sm font-semibold text-gray-900 dark:text-white">{amount}</div>
					</div>
					<div className="rounded-xl border bg-white p-4 text-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="text-xs text-gray-500 dark:text-gray-400">Deadline</div>
						<div className="text-sm font-semibold text-gray-900 dark:text-white">{deadline}</div>
					</div>
				</div>
				<div className="mt-4">
					<a
						href={opp.link || "#"}
						target={opp.link ? "_blank" : "_self"}
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
					>
						Apply Now <ArrowRight size={16} />
					</a>
				</div>
			</header>

			<section className="space-y-3">
				<SectionHeader title="About this opportunity" />
				<div className="rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
					<p className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
						{opp.description}
					</p>
					{Array.isArray(opp.tags) && opp.tags.length ? (
						<div className="mt-4 flex flex-wrap gap-2">
							{opp.tags.map((t) => (
								<span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-white/5 dark:text-gray-300">{t}</span>
							))}
						</div>
					) : null}
				</div>
			</section>

			<section className="space-y-3">
				<SectionHeader title="Other opportunities" />
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{more.map((m) => (
						<OpportunityCard key={m.id} opp={m} />
					))}
				</div>
			</section>
		</div>
	);
}

