import { Link } from "react-router-dom";
import { FileText, ArrowRight, Sparkles } from "lucide-react";
import SEO from "../components/SEO";

export default function ProcurementTenders() {
	return (
		<div className="min-h-[80vh] flex flex-col">
			<SEO
				title="Procurement & Tenders — Coming Soon | BizGrowth Africa"
				description="Curated procurement opportunities and tender notices for African MSMEs. This section is coming soon."
				canonicalPath="/procurement-tenders"
			/>
			{/* Hero-style Coming Soon */}
			<section className="relative flex-1 flex items-center justify-center overflow-hidden px-4 py-24 sm:py-32">
				{/* Background gradients and shapes */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-emerald-500/5 dark:from-[#0B1220] dark:via-[#0f172a] dark:to-primary/10" />
				<div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(220,38,38,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(220,38,38,0.15),transparent)]" />

				<div className="relative z-10 max-w-2xl mx-auto text-center">
					{/* Icon */}
					<div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl shadow-primary/25 mb-8 animate-[pulse_3s_ease-in-out_infinite]">
						<FileText className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2} />
					</div>
					<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-2 text-sm font-semibold text-primary dark:text-primary/90 mb-6">
						<Sparkles className="w-4 h-4" />
						Coming Soon
					</div>
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
						Procurement & Tenders
					</h1>
					<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-lg mx-auto leading-relaxed">
						We’re building a dedicated space for verified procurement opportunities and tender notices from public and private sectors across Africa.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-4">
						<Link
							to="/opportunities"
							className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition hover:opacity-90 hover:shadow-xl hover:shadow-primary/30"
						>
							Explore Opportunities <ArrowRight className="w-5 h-5" />
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
