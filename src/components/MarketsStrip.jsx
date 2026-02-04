import SectionHeader from "./SectionHeader";
import Sparkline from "./Sparkline";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import useMarketData from "../hooks/useMarketData";

/** Map API quotes to strip item shape: { symbol, name, value, change, series } */
function quotesToItems(quotes) {
	return (quotes || []).map((q) => ({
		symbol: q.id,
		name: q.label || q.id,
		value: q.price != null ? q.price : 0,
		change: q.changePct != null ? q.changePct : 0,
		series: Array.isArray(q.points) ? q.points.map((p) => p.v) : [],
	}));
}

export default function MarketsStrip({ items: itemsProp }) {
	const { quotes, loading, error } = useMarketData({});
	const items = useMemo(() => {
		if (itemsProp != null && Array.isArray(itemsProp) && itemsProp.length > 0) return itemsProp;
		return quotesToItems(quotes);
	}, [itemsProp, quotes]);
	const showError = !loading && items.length === 0 && error;
	const scrollerRef = useRef(null);
	const [auto, setAuto] = useState(false);

	// Enable auto-scroll only on mobile (<= sm)
	useEffect(() => {
		if (typeof window === "undefined" || !("matchMedia" in window)) return;
		const mq = window.matchMedia("(max-width: 640px)");
		const update = () => setAuto(!!mq.matches);
		update();
		if (mq.addEventListener) mq.addEventListener("change", update);
		else mq.addListener(update);
		return () => {
			if (mq.removeEventListener) mq.removeEventListener("change", update);
			else mq.removeListener(update);
		};
	}, []);

	// Smooth continuous auto-scroll with pause on user interaction
	useEffect(() => {
		const el = scrollerRef.current;
		if (!auto || !el) return;
		let raf = 0;
		let lastTs = 0;
		let paused = false;
		let resumeTimer = 0;
		const speedPxPerMs = 0.05; // slower (~50px/s)

		function onUserInteract() {
			paused = true;
			if (resumeTimer) clearTimeout(resumeTimer);
			resumeTimer = setTimeout(() => {
				paused = false;
			}, 2000);
		}

		const step = (ts) => {
			if (!lastTs) lastTs = ts;
			const dt = ts - lastTs;
			lastTs = ts;
			if (!paused) {
				el.scrollLeft += dt * speedPxPerMs;
				const max = el.scrollWidth - el.clientWidth;
				if (el.scrollLeft >= max - 1) {
					el.scrollLeft = 0;
				}
			}
			raf = requestAnimationFrame(step);
		};

		el.addEventListener("touchstart", onUserInteract, { passive: true });
		el.addEventListener("wheel", onUserInteract, { passive: true });
		raf = requestAnimationFrame(step);

		return () => {
			cancelAnimationFrame(raf);
			if (resumeTimer) clearTimeout(resumeTimer);
			el.removeEventListener("touchstart", onUserInteract);
			el.removeEventListener("wheel", onUserInteract);
		};
	}, [auto]);
	return (
		<section className="relative">
			<SectionHeader
				title="Latest Markets"
				action={<Link to="/markets" className="text-sm font-semibold text-primary">View all</Link>}
			/>
			<div className="no-scrollbar -mx-4 overflow-x-auto px-4" ref={scrollerRef}>
				{showError ? (
					<div className="rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/30 px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
						Unable to load markets right now.{" "}
						<Link to="/markets" className="font-semibold underline hover:no-underline">View markets</Link>
					</div>
				) : loading && items.length === 0 ? (
					<div className="flex gap-3 py-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="min-w-[220px] rounded-xl border bg-white dark:border-gray-800 dark:bg-[#0B1220] p-4 animate-pulse">
								<div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
								<div className="mt-2 h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
								<div className="mt-2 h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
								<div className="mt-2 h-9 w-full bg-gray-200 dark:bg-gray-700 rounded" />
							</div>
						))}
					</div>
				) : (
				<div className="flex snap-x snap-mandatory gap-3 sm:gap-4">
					{items.map((m) => {
						const up = (m.change ?? 0) >= 0;
						const color = up ? "#16a34a" : "#dc2626";
						return (
							<Link
								key={m.symbol}
								to={`/markets/${encodeURIComponent(m.symbol)}`}
								className="snap-start min-w-[220px] sm:min-w-[260px] rounded-xl border bg-white p-3 sm:p-4 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/30 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800"
							>
								<div className="flex items-center justify-between">
									<div>
										<div className="text-xs text-gray-500 dark:text-gray-400">{m.symbol}</div>
										<div className="text-sm font-semibold leading-snug text-gray-900 dark:text-white line-clamp-2">{m.name}</div>
									</div>
									<div className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-green-500" : "text-red-500"}`}>
										{up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
										{Math.abs(m.change ?? 0).toFixed(2)}%
									</div>
								</div>
								<div className="mt-1 text-base sm:text-lg font-bold text-gray-900 dark:text-white">
									{Number(m.value).toLocaleString()}
								</div>
								<div className="mt-2">
									<Sparkline points={m.series || []} color={color} />
								</div>
							</Link>
						);
					})}
				</div>
				)}
			</div>
			<style>{`
				.no-scrollbar::-webkit-scrollbar { display: none; }
				.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
				/* smooth momentum scrolling on iOS */
				.no-scrollbar { -webkit-overflow-scrolling: touch; }
			`}</style>
		</section>
	);
}


