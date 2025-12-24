import { Users, MessageCircle, CalendarRange, ShieldCheck, ArrowRight } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import PlaceholderBlock from "../components/PlaceholderBlock";

export default function Community() {
	return (
		<div className="space-y-8">
			<header className="rounded-2xl bg-gradient-to-br from-primary/10 via-white to-primary/5 p-6 dark:via-[#0B1220]">
				<h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
					<Users size={22} /> Community
				</h1>
				<p className="mt-1 text-gray-600 dark:text-gray-300">
					Connect, collaborate, and learn with fellow entrepreneurs across Africa.
				</p>
			</header>

			<SectionHeader title="Join the conversation" />
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<h3 className="font-semibold text-gray-900 dark:text-white">Topic {i + 1}</h3>
						<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Latest thread preview.</p>
						<a href="#" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
							<MessageCircle size={14} /> View Thread
						</a>
					</div>
				))}
			</div>

			<SectionHeader title="Featured Groups" />
			<PlaceholderBlock title="Groups Grid Placeholder" height="h-32" />

			<SectionHeader title="Upcoming Events" />
			<div className="rounded-xl border bg-white p-4 dark:border-gray-800 dark:bg-[#0B1220]">
				<div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
					<CalendarRange size={14} className="text-primary" /> Events Calendar
				</div>
				<PlaceholderBlock title="Events Calendar Placeholder" height="h-40" />
			</div>

			<SectionHeader title="Community Guidelines" />
			<div className="rounded-xl border bg-white p-4 dark:border-gray-800 dark:bg-[#0B1220]">
				<div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
					<ShieldCheck size={14} className="text-primary" /> Code of Conduct
				</div>
				<PlaceholderBlock title="Guidelines Content Placeholder" height="h-28" />
			</div>

			<div className="flex justify-center">
				<a href="#" className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-200">
					Join Community <ArrowRight size={14} />
				</a>
			</div>
		</div>
	);
}


