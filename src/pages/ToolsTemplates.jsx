import { Link } from "react-router-dom";
import { Wrench, ArrowRight, Sparkles } from "lucide-react";
import SEO from "../components/SEO";

export default function ToolsTemplates() {
	return (
		<div className="min-h-[80vh] flex flex-col">
			<SEO
				title="Tools & Templates — Coming Soon | BizGrowth Africa"
				description="Ready-to-use business templates, tools, and guides for African MSMEs. This section is coming soon."
				canonicalPath="/tools-templates"
			/>
			{/* Hero-style Coming Soon */}
			<section className="relative flex-1 flex items-center justify-center overflow-hidden px-4 py-24 sm:py-32">
				{/* Background gradients and shapes */}
				<div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-white to-primary/5 dark:from-[#0B1220] dark:via-[#0f172a] dark:to-amber-500/10" />
				<div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-500/15" />
				<div className="absolute bottom-1/3 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_80%_50%,rgba(245,158,11,0.08),transparent)] dark:bg-[radial-gradient(ellipse_70%_40%_at_80%_50%,rgba(245,158,11,0.12),transparent)]" />

				<div className="relative z-10 max-w-2xl mx-auto text-center">
					{/* Icon */}
					<div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xl shadow-amber-500/25 mb-8 animate-[pulse_3s_ease-in-out_infinite]">
						<Wrench className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2} />
					</div>
					<div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 dark:bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-700 dark:text-amber-300 mb-6">
						<Sparkles className="w-4 h-4" />
						Coming Soon
					</div>
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
						Tools & Templates
					</h1>
					<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-lg mx-auto leading-relaxed">
						We’re preparing ready-to-use business templates, tools, and guides to help you streamline operations and strengthen your systems.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-4">
						<Link
							to="/news-insights"
							className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition hover:opacity-90 hover:shadow-xl hover:shadow-primary/30"
						>
							Read News & Insights <ArrowRight className="w-5 h-5" />
						</Link>
						<Link
							to="/"
							className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 px-6 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-300 transition hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary"
						>
							Back to Home
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
