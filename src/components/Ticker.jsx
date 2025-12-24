import { Flame } from "lucide-react";
export default function Ticker({ items }) {
	const doubled = [...items, ...items];
	return (
		<div className="relative overflow-hidden rounded-2xl border bg-white dark:border-gray-800 dark:bg-[#0B1220]">
			<div className="flex items-center gap-3 px-4 py-2 sm:px-6">
				<span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
					<Flame size={14} /> Trending
				</span>
				<div className="relative flex-1">
					<div className="ticker-track group">
						<div className="ticker-row group-hover:[animation-play-state:paused]">
							{doubled.map((t, i) => (
								<span key={i} className="inline-flex items-center">
									<a
										href={t.url}
										target="_blank"
										rel="noreferrer"
										className="mx-3 inline-block truncate text-sm text-gray-800 hover:text-primary dark:text-gray-200 sm:mx-4 sm:max-w-[40ch] max-w-[24ch]"
										title={t.title}
									>
										{t.title}
									</a>
									<span className="text-gray-300 dark:text-gray-600">•</span>
								</span>
							))}
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
					min-width: 200%;
					animation: ticker-marquee 28s linear infinite;
				}
				@keyframes ticker-marquee {
					0% { transform: translateX(0%); }
					100% { transform: translateX(-50%); }
				}
			`}</style>
		</div>
	);
}


