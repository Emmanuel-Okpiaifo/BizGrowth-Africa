import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import SectionHeader from "../components/SectionHeader";
import Sparkline from "../components/Sparkline";
import useMarketData from "../hooks/useMarketData";
import useWatchlist from "../hooks/useWatchlist";
import { Star } from "lucide-react";

export default function Markets() {
	const [q, setQ] = useState("");
	const [tab, setTab] = useState("FX"); // FX | Crypto | Macro | Watchlist
	const [results, setResults] = useState([]);
	const { quotes, lastUpdated, loading, error, search } = useMarketData({});
	const { ids: watchlist, toggle: toggleWatch, has: inWatch } = useWatchlist();

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const data = await search(q);
				if (!active) return;
				setResults(data.results || []);
			} catch (e) {
				setResults([]);
			}
		})();
		return () => { active = false; };
	}, [q, search]);

	const categories = ["FX", "Crypto", "Macro", "Watchlist"];

	const filteredQuotes = useMemo(() => {
		if (tab === "FX") return quotes.filter((q) => q.source === "alphavantage");
		if (tab === "Crypto") return quotes.filter((q) => q.source === "coingecko");
		if (tab === "Macro") return quotes.filter((q) => q.source === "fred");
		if (tab === "Watchlist") return quotes.filter((q) => watchlist.includes(q.id));
		return quotes;
	}, [quotes, tab, watchlist]);

	return (
		<div className="space-y-6">
			<SEO
				title="Latest Markets — BizGrowth Africa"
				description="Key African markets with mini charts and quick stats. Explore detailed pages for indices, FX, and commodities."
				type="website"
				canonicalPath="/markets"
			/>
			<header className="rounded-2xl bg-gradient-to-br from-primary/10 via-white to-primary/5 p-6 dark:via-[#0B1220]">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Markets</h1>
				<p className="mt-1 text-gray-600 dark:text-gray-300">Live context for FX, crypto, and macro series. Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "—"}</p>
			</header>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					{categories.map((c) => (
						<button
							key={c}
							onClick={() => setTab(c)}
							className={["rounded-lg border px-3 py-2 text-sm", tab === c ? "border-primary text-primary" : "border-gray-300 dark:border-gray-700 dark:text-white"].join(" ")}
						>
							{c}
						</button>
					))}
				</div>
				<input
					type="search"
					placeholder="Search symbols (e.g., USDZAR, BTCUSD)..."
					value={q}
					onChange={(e) => setQ(e.target.value)}
					className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none dark:border-gray-700 dark:bg-transparent dark:text-white sm:max-w-xs"
				/>
			</div>

			<SectionHeader title="Overview" />
			{error ? <div className="text-sm text-red-600 dark:text-red-400">{error}</div> : null}
			{loading && !quotes.length ? <div className="text-sm text-gray-500">Loading…</div> : null}

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{filteredQuotes.map((q) => {
					const up = (q.change ?? 0) >= 0;
					const color = up ? "#16a34a" : "#dc2626";
					const watched = inWatch(q.id);
					return (
						<Link
							key={q.id}
							to={`/markets/${encodeURIComponent(q.id)}`}
							className="relative rounded-xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/30 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800"
						>
							<button
								onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWatch(q.id); }}
								className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent hover:bg-black/5 dark:hover:bg-white/10"
								aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
								title={watched ? "Remove from watchlist" : "Add to watchlist"}
							>
								<Star size={16} className={watched ? "text-yellow-500" : "text-gray-400"} />
							</button>
							<div className="flex items-center justify-between pr-7">
								<div>
									<div className="text-xs text-gray-500 dark:text-gray-400">{q.id}</div>
									<div className="text-sm font-semibold text-gray-900 dark:text-white">{q.label}</div>
								</div>
								<div className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-green-500" : "text-red-500"}`}>
									<span>{up ? "▲" : "▼"}</span>
									{q.changePct != null ? Math.abs(q.changePct).toFixed(2) + "%" : "—"}
								</div>
							</div>
							<div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
								{q.price?.toLocaleString?.() ?? q.price}
							</div>
							<div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
								{q.stale ? <span className="text-amber-600">● Stale</span> : <span className="text-green-600">● Live</span>}
								<span className="mx-2">•</span>
								<span>Updated {q.ts ? new Date(q.ts).toLocaleTimeString() : "—"}</span>
							</div>
							<div className="mt-2">
								<Sparkline points={[]} color={color} />
							</div>
						</Link>
					);
				})}
			</div>

			{results.length ? (
				<>
					<SectionHeader title="Search results" />
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{results.map((r) => (
							<Link key={r.id} to={`/markets/${encodeURIComponent(r.id)}`} className="rounded-lg border bg-white p-3 text-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/30 dark:border-gray-800 dark:bg-[#0B1220]">
								<div className="font-semibold text-gray-900 dark:text-white">{r.label}</div>
								<div className="text-xs text-gray-500 dark:text-gray-400">{r.id} • {r.type}</div>
							</Link>
						))}
					</div>
				</>
			) : null}
		</div>
	);
}


