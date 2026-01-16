import { FileText, Search, Filter, ArrowRight } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import CategoryPills from "../components/CategoryPills";
import PlaceholderBlock from "../components/PlaceholderBlock";
import Pagination from "../components/Pagination";

export default function ProcurementTenders() {
	const categories = ["IT & Telecoms", "Construction", "Healthcare", "Energy", "Logistics"];
	return (
		<div className="space-y-8">
			<header className="rounded-2xl bg-gradient-to-br from-primary/10 via-white to-primary/5 p-6 dark:via-[#0B1220]">
				<h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
					<FileText size={22} /> Procurement & Tenders
				</h1>
				<p className="mt-1 text-gray-600 dark:text-gray-300">
					Explore tender notices, eligibility, and timelines from public and private sector sources.
				</p>
			</header>

			<div className="grid gap-3 sm:grid-cols-3">
				<div className="sm:col-span-2">
					<div className="flex items-center gap-2">
						<div className="flex-1">
							<input
								placeholder="Search tenders..."
								className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition placeholder:text-gray-400 focus:border-primary dark:border-gray-700 dark:bg-transparent dark:text-white"
							/>
						</div>
						<button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-200">
							<Search size={14} /> Search
						</button>
					</div>
				</div>
				<div className="flex items-center justify-end">
					<a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
						<Filter size={14} /> Filters
					</a>
				</div>
			</div>
			<CategoryPills categories={categories} />

			<SectionHeader
				title="Open Tenders"
				action={
					<a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
						Search <Search size={14} />
					</a>
				}
			/>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<h3 className="font-semibold text-gray-900 dark:text-white">Tender Notice {i + 1}</h3>
						<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
							Agency • Category • Closing: TBA
						</p>
						<a href="#" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
							View Details <ArrowRight size={14} />
						</a>
					</div>
				))}
			</div>

			<SectionHeader title="How to Bid (Guide placeholders)" />
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<PlaceholderBlock title="Eligibility Checklist" />
				<PlaceholderBlock title="Bid Proposal Template" />
				<PlaceholderBlock title="Compliance & Certificates" />
			</div>

			<Pagination />
		</div>
	);
}


