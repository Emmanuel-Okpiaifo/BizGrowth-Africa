import { Flame } from "lucide-react";
import { Link } from "react-router-dom";

export default function Ticker({ items = [], speedSec = 24 }) {
	// Repeat content to ensure seamless infinite scroll
	const repeated = [...items, ...items, ...items];
	return (
		<div className="relative overflow-hidden rounded-2xl border bg-white ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
			<div className="flex items-center gap-3 px-4 py-2 sm:px-6">
				<span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-primary/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
					<Flame size={14} /> Trending
				</span>
				<div className="relative flex-1">
					<div className="ticker-track group" aria-label="Trending headlines">
						<div
							className="ticker-row group-hover:[animation-play-state:paused]"
							style={{ ["--ticker-speed"]: `${speedSec}s` }}
						>
							{repeated.map((t, i) => {
								const isInternal = typeof t.url === "string" && t.url.startsWith("/news/");
								const Anchor = ({ children }) =>
									isInternal ? (
										<Link to={t.url} className="mx-3 inline-block max-w-[24ch] truncate text-sm text-gray-800 hover:text-primary dark:text-gray-200 sm:mx-4 sm:max-w-[40ch]" title={t.title}>
											{children}
										</Link>
									) : (
										<a href={t.url} target="_blank" rel="noreferrer" className="mx-3 inline-block max-w-[24ch] truncate text-sm text-gray-800 hover:text-primary dark:text-gray-200 sm:mx-4 sm:max-w-[40ch]" title={t.title}>
											{children}
										</a>
									);
								return (
									<span key={i} className="inline-flex items-center">
										<Anchor>{t.title}</Anchor>
										<span aria-hidden className="text-gray-300 dark:text-gray-600">•</span>
									</span>
								);
							})}
						</div>
					</div>
					<div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white to-transparent dark:from-[#0B1220]" />
					<div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent dark:from-[#0B1220]" />
				</div>
			</div>
			<style>{`
				.ticker-track {
					overflow: hidden;
					white-space: nowrap;
					position: relative;
				}
				.ticker-row {
					display: inline-block;
					min-width: 300%;
					animation: ticker-marquee var(--ticker-speed, 24s) linear infinite;
				}
				@keyframes ticker-marquee {
					0% { transform: translateX(0%); }
					100% { transform: translateX(-33.3333%); }
				}
				@media (prefers-reduced-motion: reduce) {
					.ticker-row {
						animation: none;
					}
				}
			`}</style>
		</div>
	);
}


