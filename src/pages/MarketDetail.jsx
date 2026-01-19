import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import SEO from "../components/SEO";
import SectionHeader from "../components/SectionHeader";
import FullChart from "../components/FullChart";
import { markets } from "../data/markets.sample";
import useMarketData from "../hooks/useMarketData";
import useWatchlist from "../hooks/useWatchlist";
import { Star } from "lucide-react";

export default function MarketDetail() {
	const { symbol } = useParams();
	const marketId = decodeURIComponent(symbol || "");
	const base = useMemo(
		() => markets.find((m) => m.symbol.toLowerCase() === marketId.toLowerCase()),
		[marketId]
	);

	const { loadHistory } = useMarketData({ ids: [marketId], pollMs: 60000 });
	const { has: inWatch, toggle: toggleWatch } = useWatchlist();

	const [timeframe, setTimeframe] = useState("1D"); // 1D, 5D, 1M
	const [series, setSeries] = useState([]);
	const [labels, setLabels] = useState([]);
	const [quote, setQuote] = useState(null);
	const [showMA, setShowMA] = useState(true);
	const [showVolume, setShowVolume] = useState(true);
	const [chartType, setChartType] = useState("area"); // 'area' | 'line'

	useEffect(() => {
		let aborted = false;
		async function fetchAll() {
			// Seed backend cache and get latest quote
			try {
				const params = new URLSearchParams({ ids: marketId });
				const res = await fetch(`/api/market/snapshot.php?${params.toString()}`);
				if (res.ok) {
					const data = await res.json();
					if (!aborted) {
						const q = (data?.["quotes"] || [])[0] || null;
						setQuote(q || null);
					}
				}
			} catch {}
			// Load history for current timeframe
			try {
				const h = await loadHistory(marketId, timeframe);
				if (!aborted) {
					const pts = Array.isArray(h?.points) ? h.points : [];
					setSeries(pts.map((p) => p.v));
					setLabels(pts.map((p) => new Date(p.t).toLocaleTimeString()));
				}
			} catch {}
		}
		fetchAll();
		const iv = setInterval(() => fetchAll(), 60000);
		return () => {
			aborted = true;
			clearInterval(iv);
		};
	}, [marketId, timeframe, loadHistory]);

	if (!base && !quote) {
		return (
			<div className="mx-auto max-w-3xl">
				<div className="rounded-2xl border bg-white p-8 text-center shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Market not found</h1>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
						The market you’re looking for doesn’t exist or has moved.
					</p>
					<Link
						to="/markets"
						className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
					>
						Browse markets
					</Link>
				</div>
			</div>
		);
	}

	const currentValue = typeof quote?.price === "number" ? quote.price : (series.length ? series[series.length - 1] : (base?.value ?? 0));
	const prevValue = series.length > 1 ? series[series.length - 2] : currentValue;
	const changeAbs = currentValue - prevValue;
	const changePct = prevValue ? (changeAbs / prevValue) * 100 : 0;
	const up = changeAbs >= 0;
	const dayHigh = series.length ? Math.max(...series) : currentValue;
	const dayLow = series.length ? Math.min(...series) : currentValue;
	const open = series.length ? series[0] : currentValue;
	const quoteLabel = quote?.label || base?.name || marketId;
	const quoteCurrency = quoteLabel.includes("/") ? (quoteLabel.split("/")[1] || "") : (base?.currency || "");

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<SEO
				title={`${quoteLabel} — Live Market Data | BizGrowth Africa`}
				description={`Live market data and analysis for ${quoteLabel}. Track real-time prices, trends, and market insights for African markets including indices, FX, and commodities.`}
				type="website"
				canonicalPath={`/markets/${encodeURIComponent(marketId)}`}
			/>
			<nav className="text-xs text-gray-500 dark:text-gray-400">
				<Link to="/" className="hover:text-primary">Home</Link> <span>/</span>{" "}
				<Link to="/markets" className="hover:text-primary">Markets</Link> <span>/</span>{" "}
				<span className="text-gray-700 dark:text-gray-300">{marketId}</span>
			</nav>

			<header className="rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-bold text-gray-900 dark:text-white">{quoteLabel}</h1>
						<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
							<span className="font-semibold">{marketId}</span> {base ? <>• {base.region} • {base.category}</> : null}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => toggleWatch(marketId)}
							className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent hover:bg-black/5 dark:hover:bg-white/10"
							aria-label={inWatch(marketId) ? "Remove from watchlist" : "Add to watchlist"}
							title={inWatch(marketId) ? "Remove from watchlist" : "Add to watchlist"}
						>
							<Star size={16} className={inWatch(marketId) ? "text-yellow-500" : "text-gray-400"} />
						</button>
						<div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${up ? "text-green-600" : "text-red-600"}`}>
							<span>{up ? "▲" : "▼"}</span>
							{Math.abs(changePct).toFixed(2)}%
						</div>
					</div>
				</div>
				<div className="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white">
					{Number(currentValue).toLocaleString()} {quoteCurrency}
				</div>
				<div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
					{quote?.stale ? <span className="inline-flex items-center gap-1 text-amber-600">● <span>Stale</span></span> : <span className="inline-flex items-center gap-1 text-green-600">● <span>Live</span></span>}
					<button
						className={["rounded-md border px-2 py-1", timeframe === "1D" ? "border-primary text-primary" : "border-gray-300 dark:border-gray-700"].join(" ")}
						onClick={() => setTimeframe("1D")}
					>
						1D
					</button>
					<button
						className={["rounded-md border px-2 py-1", timeframe === "5D" ? "border-primary text-primary" : "border-gray-300 dark:border-gray-700"].join(" ")}
						onClick={() => setTimeframe("5D")}
					>
						5D
					</button>
					<button
						className={["rounded-md border px-2 py-1", timeframe === "1M" ? "border-primary text-primary" : "border-gray-300 dark:border-gray-700"].join(" ")}
						onClick={() => setTimeframe("1M")}
					>
						1M
					</button>
				</div>
				<div className="mt-4">
					<FullChart
						points={series}
						labels={labels}
						color="#0067FF"
						height={360}
						showArea={chartType === "area"}
						showMA={showMA}
						volumePoints={showVolume ? series.map(() => 1) : []}
						yFormatter={(v) => `${Number(v).toLocaleString()} ${quoteCurrency}`}
					/>
				</div>
			</header>

			<section className="space-y-3">
				<SectionHeader title="About this market" />
				<p className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
					{base?.description || "Live market data for key African FX, crypto, and macro indicators relevant to businesses."}
				</p>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<div className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="text-xs text-gray-500 dark:text-gray-400">Open</div>
						<div className="text-sm font-semibold text-gray-900 dark:text-white">{Number(open).toLocaleString()} {quoteCurrency}</div>
					</div>
					<div className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="text-xs text-gray-500 dark:text-gray-400">Previous</div>
						<div className="text-sm font-semibold text-gray-900 dark:text-white">{Number(prevValue).toLocaleString()} {quoteCurrency}</div>
					</div>
					<div className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="text-xs text-gray-500 dark:text-gray-400">Day High / Low</div>
						<div className="text-sm font-semibold text-gray-900 dark:text-white">{Number(dayHigh).toLocaleString()} / {Number(dayLow).toLocaleString()} {quoteCurrency}</div>
					</div>
					{base?.category ? (
						<div className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
							<div className="text-xs text-gray-500 dark:text-gray-400">Category / Region</div>
							<div className="text-sm font-semibold text-gray-900 dark:text-white">{base.category} • {base.region}</div>
						</div>
					) : null}
					<div className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="text-xs text-gray-500 dark:text-gray-400">Last updated</div>
						<div className="text-sm font-semibold text-gray-900 dark:text-white">{quote?.ts ? new Date(quote.ts).toLocaleString() : "—"}</div>
					</div>
				</div>
			</section>

			<section className="space-y-3">
				<SectionHeader title="Related markets" />
				<div className="grid gap-3 sm:grid-cols-2">
					{markets
						.filter((m) => m.symbol !== marketId)
						.filter((m) => !base?.category || m.category === base.category || m.region === base.region)
						.slice(0, 6)
						.map((m) => (
							<Link
								key={m.symbol}
								to={`/markets/${encodeURIComponent(m.symbol)}`}
								className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/30 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800"
							>
								<div className="text-xs text-gray-500 dark:text-gray-400">{m.symbol}</div>
								<div className="text-sm font-semibold text-gray-900 dark:text-white">{m.name}</div>
							</Link>
						))}
				</div>
			</section>
		</div>
	);
}

