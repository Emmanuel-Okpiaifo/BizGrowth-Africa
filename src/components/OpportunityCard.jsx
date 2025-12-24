import placeholderUrl from "../assets/placeholder.svg";
import CountDownBadge from "./CountDownBadge";
import { ExternalLink } from "lucide-react";

export default function OpportunityCard({ item }) {
	const {
		title,
		org,
		logo,
		country,
		category,
		amountMin,
		amountMax,
		currency = "USD",
		deadline,
		link = "#",
		tags = [],
		description,
	} = item;

	const amount =
		amountMin || amountMax
			? `${currency} ${[amountMin, amountMax].filter(Boolean).map((n) => n.toLocaleString()).join(" - ")}`
			: "Support varies";

	return (
		<a href={link} target="_blank" rel="noreferrer" className="group block rounded-xl border bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/30 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-3">
					<img
						src={logo || placeholderUrl}
						alt={org}
						className="h-9 w-9 rounded bg-white object-cover ring-1 ring-gray-200 dark:ring-gray-700"
						onError={(e) => {
							if (e.currentTarget.src !== placeholderUrl) e.currentTarget.src = placeholderUrl;
						}}
					/>
					<div>
						<div className="text-xs text-gray-500 dark:text-gray-400">{org}</div>
						<h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
					</div>
				</div>
				<CountDownBadge date={deadline} />
			</div>
			<p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
			<div className="mt-3 flex flex-wrap items-center gap-2">
				<span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">{country}</span>
				<span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">{category}</span>
				{tags.slice(0, 2).map((t) => (
					<span key={t} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 ring-1 ring-gray-200 dark:bg-transparent dark:text-gray-200 dark:ring-gray-700">
						{t}
					</span>
				))}
			</div>
			<div className="mt-3 flex items-center justify-between">
				<div className="text-xs text-gray-500 dark:text-gray-400">Funding: {amount}</div>
				<div className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
					Apply <ExternalLink size={14} />
				</div>
			</div>
		</a>
	);
}


