import { Link } from "react-router-dom";
export default function NewsInlineCard({ article }) {
	const { title, url, source } = article;
	const isInternal = typeof url === "string" && url.startsWith("/news/");
	if (isInternal) {
		return (
			<Link
				to={url}
				className="min-w-[260px] max-w-[280px] rounded-xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/30 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800"
			>
				<h4 className="line-clamp-3 text-sm font-semibold text-gray-900 dark:text-white">
					{title}
				</h4>
				<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{source}</p>
			</Link>
		);
	}
	return (
		<a
			href={url}
			target="_blank"
			rel="noreferrer"
			className="min-w-[260px] max-w-[280px] rounded-xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/30 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800"
		>
			<h4 className="line-clamp-3 text-sm font-semibold text-gray-900 dark:text-white">
				{title}
			</h4>
			<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{source}</p>
		</a>
	);
}


