import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { Home, ArrowLeft } from "lucide-react";

/**
 * 404 page for unknown routes on the main site.
 * Prevents blank content when no route matches.
 */
export default function NotFound() {
	return (
		<div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
			<SEO
				title="Page not found — BizGrowth Africa"
				description="The page you're looking for doesn't exist or has moved."
				canonicalPath="/"
			/>
			<div className="max-w-md w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-8 text-center shadow-sm">
				<h1 className="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
				<p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Page not found</p>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					The page you're looking for doesn't exist or has been moved.
				</p>
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<Link
						to="/"
						className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
					>
						<Home size={18} /> Home
					</Link>
					<button
						type="button"
						onClick={() => window.history.back()}
						className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-800"
					>
						<ArrowLeft size={18} /> Back
					</button>
				</div>
			</div>
		</div>
	);
}
