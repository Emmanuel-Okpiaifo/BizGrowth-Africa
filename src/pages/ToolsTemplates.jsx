import { Download, FolderGit2, FileText, Layers, PlusCircle } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import CategoryPills from "../components/CategoryPills";
import PlaceholderBlock from "../components/PlaceholderBlock";

export default function ToolsTemplates() {
	const categories = ["All", "Finance", "HR", "Legal", "Operations", "Marketing"];
	return (
		<div className="space-y-8">
			<header className="rounded-2xl bg-gradient-to-br from-primary/10 via-white to-primary/5 p-6 dark:via-[#0B1220]">
				<h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
					<FolderGit2 size={22} /> Tools & Templates
				</h1>
				<p className="mt-1 text-gray-600 dark:text-gray-300">
					Download ready-to-use templates and tools to streamline your operations.
				</p>
			</header>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<CategoryPills categories={categories} />
				<a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
					<Layers size={14} /> Categories
				</a>
			</div>

			<SectionHeader title="Popular Downloads" />
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="flex items-center gap-2">
							<FileText size={16} className="text-primary" />
							<h3 className="font-semibold text-gray-900 dark:text-white">Template {i + 1}</h3>
						</div>
						<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Brief description (PDF/Excel/Doc).</p>
						<a href="#" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
							<Download size={14} /> Download
						</a>
					</div>
				))}
			</div>

			<SectionHeader title="How to use templates" />
			<PlaceholderBlock title="Usage Guide Placeholder" height="h-40" />

			<SectionHeader title="Request a template" />
			<a href="#" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-200">
				<PlusCircle size={14} /> Submit Request
			</a>
		</div>
	);
}


