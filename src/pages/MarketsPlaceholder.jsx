import { Link } from "react-router-dom";
import SEO from "../components/SEO";

/**
 * Placeholder for Markets. All market functionality has been torn down.
 * Rebuild only when directed.
 */
export default function MarketsPlaceholder() {
	return (
		<div className="mx-auto max-w-2xl px-4 py-16">
			<SEO
				title="Markets — BizGrowth Africa"
				description="Market data and charts will return in a future update."
				canonicalPath="/markets"
			/>
			<div className="rounded-2xl border bg-white p-12 text-center shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Markets</h1>
				<p className="mt-3 text-gray-600 dark:text-gray-400">
					Market data and charts are currently unavailable. This section will be rebuilt when ready.
				</p>
				<Link
					to="/"
					className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
				>
					Back to Home
				</Link>
			</div>
		</div>
	);
}
