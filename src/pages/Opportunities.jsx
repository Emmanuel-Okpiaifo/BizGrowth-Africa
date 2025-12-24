import { Briefcase, Filter, ArrowRight } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import CategoryPills from "../components/CategoryPills";
import PlaceholderBlock from "../components/PlaceholderBlock";
import Pagination from "../components/Pagination";

export default function Opportunities() {
	const categories = ["Grants", "Accelerators", "Competitions", "Investors", "Scholarships"];
	return (
		<div className="space-y-8">
			<header className="rounded-2xl bg-gradient-to-br from-primary/10 via-white to-primary/5 p-6 dark:via-[#0B1220]">
				<h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
					<Briefcase size={22} /> Opportunities
				</h1>
				<p className="mt-1 text-gray-600 dark:text-gray-300">
					Discover grants, accelerators, competitions, and investors tailored for MSMEs.
				</p>
			</header>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<CategoryPills categories={categories} />
				<a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
					Filter <Filter size={14} />
				</a>
			</div>

			<SectionHeader
				title="Featured Programs"
				action={
					<a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
						Filter <Filter size={14} />
					</a>
				}
			/>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<h3 className="font-semibold text-gray-900 dark:text-white">Program Title {i + 1}</h3>
						<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
							Brief eligibility and region. Deadline: TBA
						</p>
						<a href="#" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
							Apply Now <ArrowRight size={14} />
						</a>
					</div>
				))}
			</div>

			<SectionHeader title="Guides & Resources" />
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<PlaceholderBlock title="Funding Guide PDF Placeholder" />
				<PlaceholderBlock title="Investor List Placeholder" />
				<PlaceholderBlock title="Application Tips Placeholder" />
			</div>

			<Pagination />
		</div>
	);
}


