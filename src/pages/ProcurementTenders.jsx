import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, MapPin, Calendar, Building2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import SEO from "../components/SEO";
import { useGoogleSheetsTenders } from "../hooks/useGoogleSheetsTenders";
import { useGoogleSheetsProcurements } from "../hooks/useGoogleSheetsProcurements";

const PER_PAGE = 8;

export default function ProcurementTenders() {
	const { tenders, loading: tendersLoading, error: tendersError } = useGoogleSheetsTenders();
	const { procurements, loading: procurementsLoading, error: procurementsError } = useGoogleSheetsProcurements();
	const [activeTab, setActiveTab] = useState("procurements");
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("All");
	const [countryFilter, setCountryFilter] = useState("All");
	const [page, setPage] = useState(1);

	const tenderItems = useMemo(
		() => tenders.filter((item) => {
			const type = (item.type || "").toLowerCase();
			return type === "" || type === "tender";
		}),
		[tenders]
	);
	const loading = tendersLoading || procurementsLoading;
	const error = tendersError || procurementsError;

	const activeItems = activeTab === "procurements" ? procurements : tenderItems;
	const categories = useMemo(
		() => ["All", ...Array.from(new Set(activeItems.map((item) => item.category).filter(Boolean))).sort()],
		[activeItems]
	);
	const countries = useMemo(
		() => ["All", ...Array.from(new Set(activeItems.map((item) => item.country).filter(Boolean))).sort()],
		[activeItems]
	);
	const filteredItems = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		return activeItems.filter((item) => {
			const matchesSearch =
				!q ||
				[item.title, item.agency, item.category, item.country, item.region, item.quickSummary, item.overview]
					.join(" ")
					.toLowerCase()
					.includes(q);
			const matchesCategory = categoryFilter === "All" || (item.category || "") === categoryFilter;
			const matchesCountry = countryFilter === "All" || (item.country || "") === countryFilter;
			return matchesSearch && matchesCategory && matchesCountry;
		});
	}, [activeItems, searchQuery, categoryFilter, countryFilter]);
	const totalPages = Math.max(1, Math.ceil(filteredItems.length / PER_PAGE));
	const currentPage = Math.min(page, totalPages);
	const pagedItems = useMemo(
		() => filteredItems.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE),
		[filteredItems, currentPage]
	);
	useEffect(() => {
		setPage(1);
	}, [activeTab, searchQuery, categoryFilter, countryFilter]);

	return (
		<div className="space-y-8">
			<SEO
				title="Procurement & Tenders | BizGrowth Africa"
				description="Verified procurement opportunities and tender notices across Africa, separated into Procurements and Tenders."
				canonicalPath="/procurement-tenders"
			/>
			<section className="rounded-2xl bg-gradient-to-br from-primary/10 via-white to-primary/5 p-6 dark:via-[#0B1220]">
				<div className="flex items-start gap-3">
					<div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow">
						<FileText className="h-6 w-6" />
					</div>
					<div>
						<h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Procurement & Tenders</h1>
						<p className="mt-1 text-gray-600 dark:text-gray-300">
							Verified opportunities for African businesses, grouped into Procurements and Tenders.
						</p>
					</div>
				</div>
			</section>

			<div className="flex flex-wrap items-center gap-3">
				<button
					type="button"
					onClick={() => setActiveTab("procurements")}
					className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
						activeTab === "procurements"
							? "bg-primary text-white"
							: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#0B1220] dark:text-gray-300 dark:hover:bg-gray-800"
					}`}
				>
					Procurements ({procurements.length})
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("tenders")}
					className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
						activeTab === "tenders"
							? "bg-primary text-white"
							: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#0B1220] dark:text-gray-300 dark:hover:bg-gray-800"
					}`}
				>
					Tenders ({tenderItems.length})
				</button>
			</div>
			<div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-3 dark:border-gray-800 dark:bg-[#0B1220]">
				<label className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder={`Search ${activeTab}...`}
						className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-primary dark:border-gray-700 dark:bg-[#0B1220] dark:text-white"
					/>
				</label>
				<select
					value={categoryFilter}
					onChange={(e) => setCategoryFilter(e.target.value)}
					className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary dark:border-gray-700 dark:bg-[#0B1220] dark:text-white"
				>
					{categories.map((cat) => (
						<option key={cat} value={cat}>
							{cat}
						</option>
					))}
				</select>
				<select
					value={countryFilter}
					onChange={(e) => setCountryFilter(e.target.value)}
					className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary dark:border-gray-700 dark:bg-[#0B1220] dark:text-white"
				>
					{countries.map((country) => (
						<option key={country} value={country}>
							{country}
						</option>
					))}
				</select>
			</div>

			{loading ? (
				<div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-[#0B1220]">
					<div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="mt-3 text-gray-600 dark:text-gray-400">Loading listings...</p>
				</div>
			) : error ? (
				<div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
					Unable to load procurement and tender listings right now.
				</div>
			) : filteredItems.length === 0 ? (
				<div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-[#0B1220]">
					<p className="text-gray-700 dark:text-gray-300">No {activeTab} matched your filters.</p>
				</div>
			) : (
				<>
				<div className="grid gap-5 md:grid-cols-2">
					{pagedItems.map((item) => (
						<article
							key={item.id}
							className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-[#0B1220]"
						>
							{item.heroImage ? (
								<img
									src={item.heroImage}
									alt={item.title}
									className="mb-4 h-44 w-full rounded-xl object-cover"
									loading="lazy"
								/>
							) : null}
							<div className="mb-3 flex items-center justify-between gap-2">
								<span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
									{item.category || "Uncategorized"}
								</span>
								<span className="text-xs text-gray-500 dark:text-gray-400">
									Published {item.postedAt ? new Date(item.postedAt).toLocaleDateString() : "—"}
								</span>
							</div>

							<h2 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h2>

							{item.quickSummary ? (
								<p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{item.quickSummary}</p>
							) : item.overview ? (
								<p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{item.overview}</p>
							) : item.description ? (
								<p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{String(item.description).replace(/<[^>]*>/g, " ")}</p>
							) : null}

							<div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
								{item.agency ? (
									<div className="flex items-center gap-2">
										<Building2 size={14} />
										<span>{item.agency}</span>
									</div>
								) : null}
								{item.country || item.region ? (
									<div className="flex items-center gap-2">
										<MapPin size={14} />
										<span>{[item.country, item.region].filter(Boolean).join(", ")}</span>
									</div>
								) : null}
								{item.deadline ? (
									<div className="flex items-center gap-2">
										<Calendar size={14} />
										<span>Deadline: {item.deadline}</span>
									</div>
								) : null}
							</div>

							<div className="mt-4 flex items-center gap-3">
								<Link
									to={`/procurement-tenders/${encodeURIComponent(item.id)}`}
									className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-300 dark:hover:border-primary dark:hover:text-primary"
								>
									View Details
								</Link>
							</div>
						</article>
					))}
				</div>
				{totalPages > 1 && (
					<nav className="flex flex-wrap items-center justify-center gap-2 pt-2" aria-label="Procurement and tenders pagination">
						<button
							type="button"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={currentPage <= 1}
							className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-[#0B1220] dark:text-gray-300 dark:hover:bg-gray-800"
						>
							<ChevronLeft size={18} /> Previous
						</button>
						<div className="text-sm text-gray-600 dark:text-gray-400">
							Page {currentPage} of {totalPages}
						</div>
						<button
							type="button"
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage >= totalPages}
							className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-[#0B1220] dark:text-gray-300 dark:hover:bg-gray-800"
						>
							Next <ChevronRight size={18} />
						</button>
					</nav>
				)}
				</>
			)}

			<div className="flex items-center justify-start">
				<Link
					to="/opportunities"
					className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-300 dark:hover:border-primary dark:hover:text-primary"
				>
					Explore Other Opportunities
				</Link>
			</div>
		</div>
	);
}
