import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, ExternalLink, MapPin, Building2, ArrowLeft, Tag } from "lucide-react";
import SEO from "../components/SEO";
import { useGoogleSheetsTenders } from "../hooks/useGoogleSheetsTenders";
import { useGoogleSheetsProcurements } from "../hooks/useGoogleSheetsProcurements";

function stripHtml(value = "") {
	return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value = "") {
	return String(value || "")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.replace(/&amp;/gi, "&")
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/&nbsp;/gi, " ");
}

function hasMeaningfulContent(value = "") {
	return stripHtml(decodeHtmlEntities(value)).length > 0;
}

function stripHtmlKeepLines(value = "") {
	return decodeHtmlEntities(value || "")
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/p>/gi, "\n")
		.replace(/<\/div>/gi, "\n")
		.replace(/<[^>]*>/g, " ")
		.replace(/\u00a0/g, " ")
		.replace(/[ \t]+/g, " ")
		.replace(/\n{2,}/g, "\n")
		.trim();
}

function removeDuplicateMetaLines(value = "") {
	const text = String(value || "").trim();
	if (!text) return "";

	const metaLineRegex = /^(category|sub[\s-]?category|location\s*\(?.*?\)?|deadline|organisation|organization|reference)\s*:/i;
	const lines = text
		.split(/\r?\n+/)
		.map((line) => line.trim())
		.filter(Boolean)
		.filter((line) => !metaLineRegex.test(line));

	return lines.join("\n").trim();
}

function normalizeHeading(value = "") {
	return String(value || "")
		.toLowerCase()
		.replace(/&amp;/g, "and")
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function renderSectionContent(value = "") {
	const text = decodeHtmlEntities(value || "").trim();
	if (!text) return null;
	if (!hasMeaningfulContent(text)) return null;
	const hasHtml = /<[^>]+>/.test(text);
	if (hasHtml) {
		return (
			<div
				className="mt-2 text-gray-700 dark:text-gray-300 leading-relaxed whitespace-normal
					[&_p]:my-3 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0
					[&_ul]:my-3 [&_ul]:ml-5 [&_ul]:list-disc
					[&_ol]:my-3 [&_ol]:ml-5 [&_ol]:list-decimal
					[&_li]:my-1
					[&_a]:text-primary [&_a]:underline
					[&_strong]:font-semibold [&_b]:font-semibold"
				dangerouslySetInnerHTML={{ __html: text }}
			/>
		);
	}

	const lines = text
		.split(/\r?\n+/)
		.map((line) => line.trim())
		.filter(Boolean);

	const bulletLines = lines.filter((line) => /^([•*-]\s+|\d+[.)]\s+)/.test(line));
	if (bulletLines.length > 0) {
		const allNumbered = bulletLines.every((line) => /^\d+[.)]\s+/.test(line));
		const ListTag = allNumbered ? "ol" : "ul";
		const listClass = allNumbered
			? "mt-2 list-decimal pl-5 space-y-1 text-gray-700 dark:text-gray-300"
			: "mt-2 list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300";
		return (
			<ListTag className={listClass}>
				{bulletLines.map((line, idx) => (
					<li key={`${idx}-${line.slice(0, 24)}`}>
						{line.replace(/^([•*-]\s+|\d+[.)]\s+)/, "")}
					</li>
				))}
			</ListTag>
		);
	}

	const paragraphs = lines.join("\n").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
	return (
		<div className="mt-2 text-gray-700 dark:text-gray-300 leading-relaxed">
			{paragraphs.map((p, i) => (
				<p key={`${i}-${p.slice(0, 20)}`} className={i === 0 ? "mt-0 mb-3" : "my-3"}>
					{p}
				</p>
			))}
		</div>
	);
}

function sectionFromLabel(label = "") {
	const n = normalizeHeading(label);
	if (/(^| )overview( |$)|summary/.test(n)) return "overview";
	if (/who can apply|eligibility|eligible applicants|applicant eligibility/.test(n)) return "whoCanApply";
	if (/scope of work|scope|deliverables/.test(n)) return "scopeOfWork";
	if (/requirements|required documents|documents required|criteria/.test(n)) return "requirements";
	if (/application process|how to apply|application procedure|submission process/.test(n)) return "applicationProcess";
	return null;
}

function parseDescriptionSections(html = "") {
	const source = String(html || "").trim();
	if (!source) return {};

	const sections = {};
	const headingRegex = /<(h[1-6]|strong|b)[^>]*>(.*?)<\/\1>/gi;
	const matches = [...source.matchAll(headingRegex)];
	if (!matches.length) return sections;

	for (let i = 0; i < matches.length; i += 1) {
		const current = matches[i];
		const next = matches[i + 1];
		const label = stripHtml(current[2]);
		const key = sectionFromLabel(label);
		if (!key) continue;

		const contentStart = current.index + current[0].length;
		const contentEnd = next ? next.index : source.length;
		const content = removeDuplicateMetaLines(stripHtmlKeepLines(source.slice(contentStart, contentEnd)));
		if (content && !sections[key]) sections[key] = content;
	}

	return sections;
}

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
	const parsedDescriptionSections = useMemo(() => parseDescriptionSections(item?.description || ""), [item?.description]);
	const overviewText = item?.overview || parsedDescriptionSections.overview;
	const whoCanApplyRaw = item?.whoCanApply || parsedDescriptionSections.whoCanApply || "";
	const scopeOfWorkText = item?.scopeOfWork || parsedDescriptionSections.scopeOfWork;
	const requirementsText = item?.requirements || parsedDescriptionSections.requirements;
	const applicationProcessText = item?.applicationProcess || parsedDescriptionSections.applicationProcess;
	const whoCanApplyText =
		normalizeHeading(whoCanApplyRaw) && normalizeHeading(whoCanApplyRaw) !== normalizeHeading(requirementsText)
			? whoCanApplyRaw
			: "";

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

					{hasMeaningfulContent(overviewText) ? (
						<section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0B1220]">
							<h2 className="text-lg font-bold text-gray-900 dark:text-white">Overview</h2>
							{renderSectionContent(overviewText)}
						</section>
					) : null}

					{hasMeaningfulContent(whoCanApplyText) ? (
						<section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0B1220]">
							<h2 className="text-lg font-bold text-gray-900 dark:text-white">Who Can Apply</h2>
							{renderSectionContent(whoCanApplyText)}
						</section>
					) : null}

					{hasMeaningfulContent(scopeOfWorkText) ? (
						<section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0B1220]">
							<h2 className="text-lg font-bold text-gray-900 dark:text-white">Scope of Work</h2>
							{renderSectionContent(scopeOfWorkText)}
						</section>
					) : null}

					{hasMeaningfulContent(requirementsText) ? (
						<section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0B1220]">
							<h2 className="text-lg font-bold text-gray-900 dark:text-white">Requirements</h2>
							{renderSectionContent(requirementsText)}
						</section>
					) : null}

					{hasMeaningfulContent(applicationProcessText) ? (
						<section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0B1220]">
							<h2 className="text-lg font-bold text-gray-900 dark:text-white">Application Process</h2>
							{renderSectionContent(applicationProcessText)}
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
