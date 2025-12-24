import { Info, Target, Users, Award, Building2, Newspaper } from "lucide-react";
import PlaceholderBlock from "../components/PlaceholderBlock";

export default function About() {
	return (
		<div className="space-y-8">
			<header className="rounded-2xl bg-gradient-to-br from-primary/10 via-white to-primary/5 p-6 dark:via-[#0B1220]">
				<h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
					<Info size={22} /> About
				</h1>
				<p className="mt-1 text-gray-600 dark:text-gray-300">
					BizGrowth Africa empowers MSMEs with intelligence, actionable tools, and a supportive community.
				</p>
			</header>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
					<div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
						<Target size={16} className="text-primary" /> Our Mission
					</div>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
						Accelerate MSME success with reliable information, opportunities, and resources.
					</p>
				</div>
				<div className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
					<div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
						<Users size={16} className="text-primary" /> Our Community
					</div>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
						Founders, operators, and ecosystem partners from across the continent.
					</p>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<div className="rounded-xl border bg-white p-5 text-center dark:border-gray-800 dark:bg-[#0B1220]">
					<div className="text-2xl font-extrabold text-gray-900 dark:text-white">1M+</div>
					<div className="text-xs text-gray-600 dark:text-gray-400">Monthly Readers (placeholder)</div>
				</div>
				<div className="rounded-xl border bg-white p-5 text-center dark:border-gray-800 dark:bg-[#0B1220]">
					<div className="text-2xl font-extrabold text-gray-900 dark:text-white">50k+</div>
					<div className="text-xs text-gray-600 dark:text-gray-400">Newsletter Subscribers (placeholder)</div>
				</div>
				<div className="rounded-xl border bg-white p-5 text-center dark:border-gray-800 dark:bg-[#0B1220]">
					<div className="text-2xl font-extrabold text-gray-900 dark:text-white">20+</div>
					<div className="text-xs text-gray-600 dark:text-gray-400">Countries Covered (placeholder)</div>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="rounded-xl border bg-white p-5 dark:border-gray-800 dark:bg-[#0B1220]">
					<div className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
						<Award size={16} className="text-primary" /> Team & Leadership
					</div>
					<PlaceholderBlock title="Team Grid Placeholder" height="h-48" />
				</div>
				<div className="rounded-xl border bg-white p-5 dark:border-gray-800 dark:bg-[#0B1220]">
					<div className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
						<Building2 size={16} className="text-primary" /> Partners & Sponsors
					</div>
					<PlaceholderBlock title="Partner Logos Placeholder" height="h-48" />
				</div>
			</div>

			<div className="rounded-xl border bg-white p-5 dark:border-gray-800 dark:bg-[#0B1220]">
				<div className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
					<Newspaper size={16} className="text-primary" /> Press
				</div>
				<PlaceholderBlock title="Press Mentions Placeholder" height="h-32" />
			</div>
		</div>
	);
}


