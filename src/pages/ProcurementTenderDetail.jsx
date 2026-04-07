import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, ExternalLink, MapPin, Building2, ArrowLeft, Tag } from "lucide-react";
import SEO from "../components/SEO";
import { useGoogleSheetsTenders } from "../hooks/useGoogleSheetsTenders";
import { useGoogleSheetsProcurements } from "../hooks/useGoogleSheetsProcurements";

export default function ProcurementTenderDetail() {
	const { id } = useParams();
	const { tenders, loading: tendersLoading, error: tendersError } = useGoogleSheetsTenders();
	const { procurements, loading: procurementsLoading, error: procurementsError } = useGoogleSheetsProcurements();
	const loading = tendersLoading || procurementsLoading;
	const error = tendersError || procurementsError;
	const allItems = useMemo(() => [...procurements, ...tenders], [procurements, tenders]);

	const item = useMemo(
		() => allItems.find((entry) => String(entry.id) === String(decodeURIComponent(id || ""))),
		[allItems, id]
	);

	if (loading) {
		return <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-[#0B1220]">Loading details...</div>;
	}

	if (error || !item) {
		return (
			<div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-[#0B1220]">
				<p className="text-gray-700 dark:text-gray-300">Listing not found.</p>
				<Link to="/procurement-tenders" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
					<ArrowLeft size={16} /> Back to listings
				</Link>
			</div>
		);
	}

	const listingType = (item.type || "").toLowerCase() === "procurement" ? "Procurement" : "Tender";

	return (
		<div className="space-y-8">
			<SEO
				title={`${item.title} | ${listingType} | BizGrowth Africa`}
				description={(item.quickSummary || item.overview || item.description || "").slice(0, 160)}
				canonicalPath={`/procurement-tenders/${encodeURIComponent(item.id)}`}
			/>
			<div className="flex items-center justify-between">
				<Link to="/procurement-tenders" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-90">
					<ArrowLeft size={16} /> Back to Procurement & Tenders
				</Link>
				<span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{listingType}</span>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-6">
					{item.heroImage ? (
						<section className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-[#0B1220]">
							<img src={item.heroImage} alt={item.title} className="h-64 w-full rounded-xl object-cover sm:h-80" />
						</section>
					) : null}
					<section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0B1220]">
						<h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{item.title}</h1>
						<div className="mt-4 grid gap-3 text-sm text-gray-600 dark:text-gray-400 sm:grid-cols-2">
							{item.agency ? <div className="flex items-center gap-2"><Building2 size={15} /> {item.agency}</div> : null}
							{item.country || item.region ? <div className="flex items-center gap-2"><MapPin size={15} /> {[item.country, item.region].filter(Boolean).join(", ")}</div> : null}
							{item.deadline ? <div className="flex items-center gap-2"><Calendar size={15} /> Deadline: {item.deadline}</div> : null}
							<div className="flex items-center gap-2"><Calendar size={15} /> Published: {item.postedAt ? new Date(item.postedAt).toLocaleDateString() : "—"}</div>
						</div>
						{item.quickSummary ? (
							<p className="mt-4 text-gray-700 dark:text-gray-300">{item.quickSummary}</p>
						) : null}
					</section>

					{item.overview ? (
						<section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0B1220]">
							<h2 className="text-lg font-bold text-gray-900 dark:text-white">Overview</h2>
							<p className="mt-2 whitespace-pre-line text-gray-700 dark:text-gray-300">{item.overview}</p>
						</section>
					) : null}

					{item.whoCanApply || item.eligibility ? (
						<section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0B1220]">
							<h2 className="text-lg font-bold text-gray-900 dark:text-white">Who Can Apply</h2>
							<p className="mt-2 whitespace-pre-line text-gray-700 dark:text-gray-300">{item.whoCanApply || item.eligibility}</p>
						</section>
					) : null}

					{item.scopeOfWork ? (
						<section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0B1220]">
							<h2 className="text-lg font-bold text-gray-900 dark:text-white">Scope of Work</h2>
							<p className="mt-2 whitespace-pre-line text-gray-700 dark:text-gray-300">{item.scopeOfWork}</p>
						</section>
					) : null}

					{item.requirements ? (
						<section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0B1220]">
							<h2 className="text-lg font-bold text-gray-900 dark:text-white">Requirements</h2>
							<p className="mt-2 whitespace-pre-line text-gray-700 dark:text-gray-300">{item.requirements}</p>
						</section>
					) : null}

					{item.applicationProcess ? (
						<section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0B1220]">
							<h2 className="text-lg font-bold text-gray-900 dark:text-white">Application Process</h2>
							<p className="mt-2 whitespace-pre-line text-gray-700 dark:text-gray-300">{item.applicationProcess}</p>
						</section>
					) : null}

					{item.description ? (
						<section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0B1220]">
							<h2 className="text-lg font-bold text-gray-900 dark:text-white">Description</h2>
							<div
								className="mt-2 prose prose-sm max-w-none text-gray-700 dark:prose-invert dark:text-gray-300"
								dangerouslySetInnerHTML={{ __html: item.description }}
							/>
						</section>
					) : null}
				</div>

				<aside className="space-y-6">
					<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 shadow-md">
						<h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Key Information</h3>
						<div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
							{item.category ? <div className="flex items-center gap-2"><Tag size={15} /> {item.category}</div> : null}
							{item.subCategory ? <div className="text-xs text-gray-500 dark:text-gray-400">Sub-category: {item.subCategory}</div> : null}
							{item.reference ? <div className="text-xs text-gray-500 dark:text-gray-400">Reference: {item.reference}</div> : null}
							{item.author ? <div className="text-xs text-gray-500 dark:text-gray-400">Published by: {item.author}</div> : null}
						</div>
						{item.link ? (
							<a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
								Official Link <ExternalLink size={16} />
							</a>
						) : null}
					</div>
				</aside>
			</div>
		</div>
	);
}
