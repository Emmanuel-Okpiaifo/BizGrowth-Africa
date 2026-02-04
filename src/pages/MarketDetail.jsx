import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import SectionHeader from "../components/SectionHeader";
import FullChart from "../components/FullChart";
import useMarketData from "../hooks/useMarketData";
import useWatchlist from "../hooks/useWatchlist";
import { getApiBaseUrl } from "../utils/apiBaseUrl";
import { fetchCryptoQuotes, fetchCryptoHistory } from "../utils/coingeckoClient";
import { Star } from "lucide-react";

const SNAPSHOT_TIMEOUT_MS = 6000;
const isCrypto = (id) => id === "BTCUSD" || id === "ETHUSD";

/** Derive display label and provider from API quote.source */
function sourceInfo(source) {
	const s = (source || "").toLowerCase();
	if (s === "finnhub") return { label: "Market", provider: "Finnhub" };
	if (s === "coingecko") return { label: "Crypto", provider: "CoinGecko" };
	return { label: "Market", provider: "API" };
}

/** Short description when no sample base, by source */
function descriptionBySource(source) {
	const s = (source || "").toLowerCase();
	if (s === "finnhub") return "Live price from Finnhub. Data updates periodically.";
	if (s === "coingecko") return "Live crypto price from CoinGecko. Data updates periodically.";
	return "Live market data. Price and history update periodically.";
}

/** Sort points by time ascending (oldest first) so chart shows past→present left to right. */
function sortPointsByTime(points) {
	if (!Array.isArray(points) || points.length === 0) return [];
	return [...points].sort((a, b) => (a.t ?? 0) - (b.t ?? 0));
}

/** Format chart x-axis labels: for many points use short date; for 2 points use "Earlier" / "Now". */
function formatChartLabels(points, useDateOnly) {
	if (!Array.isArray(points) || points.length === 0) return [];
	if (points.length <= 2) {
		return points.length === 1
			? [new Date(points[0].t).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })]
			: ["Earlier", "Now"];
	}
	return points.map((p) =>
		useDateOnly
			? new Date(p.t).toLocaleDateString(undefined, { month: "short", day: "numeric" })
			: new Date(p.t).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
	);
}

/** Fallback catalog for Related markets when API search fails or returns empty. */
const RELATED_MARKETS_FALLBACK = [
	{ id: "AAPL", label: "Apple Inc.", type: "stock" },
	{ id: "MSFT", label: "Microsoft", type: "stock" },
	{ id: "IBM", label: "IBM", type: "stock" },
	{ id: "BTCUSD", label: "BTC/USD", type: "crypto" },
	{ id: "ETHUSD", label: "ETH/USD", type: "crypto" },
];

export default function MarketDetail() {
	const { symbol } = useParams();
	const navigate = useNavigate();
	const marketId = decodeURIComponent(symbol || "");

	const { loadHistory } = useMarketData({ ids: [marketId], pollMs: 60000 });
	const { has: inWatch, toggle: toggleWatch } = useWatchlist();

	const [timeframe, setTimeframe] = useState("1D"); // 1D, 5D, 1M
	const [series, setSeries] = useState([]);
	const [labels, setLabels] = useState([]);
	const [quote, setQuote] = useState(null);
	const [quoteLoadAttempted, setQuoteLoadAttempted] = useState(false);
	const [relatedCatalog, setRelatedCatalog] = useState([]);
	const [showMA, setShowMA] = useState(true);
	const [showVolume, setShowVolume] = useState(true);
	const [chartType, setChartType] = useState("area"); // 'area' | 'line'

	const source = useMemo(() => sourceInfo(quote?.source), [quote?.source]);

	useEffect(() => {
		if (!marketId) return;
		setQuoteLoadAttempted(false);
	}, [marketId]);

	// Fetch quote, chart, and related in parallel so the page shows as soon as quote is ready.
	useEffect(() => {
		if (!marketId) return;
		let aborted = false;
		const useDateOnly = timeframe === "1M" || timeframe === "5D";

		function applyChartFromQuote(q) {
			if (!q) return;
			const pts = sortPointsByTime(Array.isArray(q.points) ? q.points : []);
			if (pts.length >= 2) {
				setSeries(pts.map((p) => p.v));
				setLabels(formatChartLabels(pts, useDateOnly));
			} else if (typeof q.price === "number") {
				setSeries([q.price, q.price]);
				setLabels(["Earlier", "Now"]);
			}
		}

		// 1) Quote: snapshot with timeout so we don't block; then crypto fallback for BTC/ETH
		async function fetchQuote() {
			const baseUrl = getApiBaseUrl();
			const snapshotUrl = baseUrl
				? `${baseUrl}/api/market/snapshot.php?ids=${encodeURIComponent(marketId)}`
				: `/api/market/snapshot.php?ids=${encodeURIComponent(marketId)}`;
			let q = null;
			try {
				const controller = new AbortController();
				const t = setTimeout(() => controller.abort(), SNAPSHOT_TIMEOUT_MS);
				const res = await fetch(snapshotUrl, { signal: controller.signal });
				clearTimeout(t);
				if (res.ok) {
					const data = await res.json();
					q = (data?.quotes || [])[0] || null;
				}
			} catch {
				// timeout or fetch failed
			}
			if (!q && isCrypto(marketId)) {
				try {
					const cryptoQuotes = await fetchCryptoQuotes();
					q = cryptoQuotes.find((c) => c.id === marketId) || null;
				} catch {
					// fallback failed
				}
			}
			if (aborted) return;
			setQuote(q);
			setQuoteLoadAttempted(true);
			// Set chart from quote so we show something immediately; crypto chart will overwrite when fetchChart gets 30-day data
			if (q) applyChartFromQuote(q);
		}

		// 2) Chart: for crypto use client CoinGecko (fast, real 30-day data); for stocks use loadHistory (returns [])
		async function fetchChart() {
			let points = [];
			if (isCrypto(marketId)) {
				try {
					points = await fetchCryptoHistory(marketId);
				} catch {
					// ignore
				}
			} else {
				try {
					const h = await loadHistory(marketId, timeframe);
					points = Array.isArray(h?.points) ? h.points : [];
				} catch {
					// ignore
				}
			}
			if (aborted) return;
			if (points.length > 0) {
				const pts = sortPointsByTime(points);
				if (pts.length === 1) {
					setSeries([pts[0].v, pts[0].v]);
					setLabels(["Earlier", "Now"]);
				} else {
					setSeries(pts.map((p) => p.v));
					setLabels(formatChartLabels(pts, useDateOnly));
				}
			}
		}

		// 3) Related markets
		async function fetchRelated() {
			try {
				const baseUrl = getApiBaseUrl();
				const searchUrl = baseUrl ? `${baseUrl}/api/market/search.php?q=` : "/api/market/search.php?q=";
				const res = await fetch(searchUrl);
				const data = res.ok ? await res.json() : null;
				const results = Array.isArray(data?.results) ? data.results : RELATED_MARKETS_FALLBACK;
				if (!aborted) {
					setRelatedCatalog(
						results
							.filter((r) => (r.id || "").toUpperCase() !== marketId.toUpperCase())
							.slice(0, 6)
					);
				}
			} catch {
				if (!aborted) {
					setRelatedCatalog(
						RELATED_MARKETS_FALLBACK
							.filter((r) => (r.id || "").toUpperCase() !== marketId.toUpperCase())
							.slice(0, 6)
					);
				}
			}
		}

		// Run all in parallel so "Loading market data" ends as soon as quote is ready
		fetchQuote();
		fetchChart();
		fetchRelated();

		const iv = setInterval(() => {
			fetchQuote();
			fetchChart();
		}, 60000);
		return () => {
			aborted = true;
			clearInterval(iv);
		};
	}, [marketId, timeframe, loadHistory]);

	// No data for this symbol: redirect to markets list (must run before any conditional return so hook order is stable)
	useEffect(() => {
		if (quoteLoadAttempted && !quote && marketId) {
			navigate("/markets", { replace: true });
		}
	}, [quoteLoadAttempted, quote, marketId, navigate]);

	// Loading: we have a symbol but haven't finished first fetch yet
	if (marketId && !quoteLoadAttempted && !quote) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-16">
				<div className="rounded-2xl border bg-white p-12 text-center shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="mt-4 text-gray-600 dark:text-gray-400">Loading market data…</p>
				</div>
			</div>
		);
	}

	if (quoteLoadAttempted && !quote) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-16">
				<div className="rounded-2xl border bg-white p-12 text-center shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="mt-4 text-gray-600 dark:text-gray-400">Taking you to markets…</p>
				</div>
			</div>
		);
	}

	// From API quote
	const currentValue = typeof quote?.price === "number" ? quote.price : (series.length ? series[series.length - 1] : 0);
	const prevValue = series.length > 1 ? series[series.length - 2] : currentValue;
	const derivedChangePct = prevValue ? ((currentValue - prevValue) / prevValue) * 100 : 0;
	const changePct = quote?.changePct != null ? quote.changePct : derivedChangePct;
	const changeAbs = (changePct / 100) * (prevValue || currentValue);
	const up = (quote?.changePct ?? derivedChangePct) >= 0;
	const dayHigh = series.length ? Math.max(...series) : currentValue;
	const dayLow = series.length ? Math.min(...series) : currentValue;
	const open = series.length ? series[0] : currentValue;
	const quoteLabel = quote?.label || marketId;
	const quoteCurrency = quoteLabel.includes("/") ? (quoteLabel.split("/")[1] || "").trim() : "";

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
							<span className="font-semibold">{marketId}</span> • {source.label}
							{quote?.source ? ` • ${source.provider}` : ""}
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
					{series.length === 0 && typeof quote?.price === "number" ? (
						<div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-8 text-center dark:border-gray-800 dark:bg-gray-900/30">
							<p className="text-sm text-gray-500 dark:text-gray-400">Loading chart…</p>
							<FullChart
								points={[quote.price, quote.price]}
								labels={["Earlier", "Now"]}
								color="#0067FF"
								height={360}
								showArea={chartType === "area"}
								showMA={false}
								yFormatter={(v) => (quoteCurrency ? `${Number(v).toLocaleString()} ${quoteCurrency}` : Number(v).toLocaleString())}
							/>
						</div>
					) : (
						<FullChart
							points={series.length ? series : (typeof quote?.price === "number" ? [quote.price, quote.price] : [])}
							labels={labels.length ? labels : ["Earlier", "Now"]}
							color="#0067FF"
							height={360}
							showArea={chartType === "area"}
							showMA={showMA}
							volumePoints={showVolume && series.length ? series.map(() => 1) : []}
							yFormatter={(v) => (quoteCurrency ? `${Number(v).toLocaleString()} ${quoteCurrency}` : Number(v).toLocaleString())}
						/>
					)}
				</div>
			</header>

			<section className="space-y-3">
				<SectionHeader title="About this market" />
				<p className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
					{descriptionBySource(quote?.source)}
				</p>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<div className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="text-xs text-gray-500 dark:text-gray-400">Current / Last</div>
						<div className="text-sm font-semibold text-gray-900 dark:text-white">{Number(currentValue).toLocaleString()}{quoteCurrency ? ` ${quoteCurrency}` : ""}</div>
					</div>
					<div className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="text-xs text-gray-500 dark:text-gray-400">Open</div>
						<div className="text-sm font-semibold text-gray-900 dark:text-white">{Number(open).toLocaleString()}{quoteCurrency ? ` ${quoteCurrency}` : ""}</div>
					</div>
					<div className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="text-xs text-gray-500 dark:text-gray-400">High / Low</div>
						<div className="text-sm font-semibold text-gray-900 dark:text-white">{Number(dayHigh).toLocaleString()} / {Number(dayLow).toLocaleString()}{quoteCurrency ? ` ${quoteCurrency}` : ""}</div>
					</div>
					<div className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="text-xs text-gray-500 dark:text-gray-400">Data source</div>
						<div className="text-sm font-semibold text-gray-900 dark:text-white">{source.provider}</div>
					</div>
					<div className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="text-xs text-gray-500 dark:text-gray-400">Last updated</div>
						<div className="text-sm font-semibold text-gray-900 dark:text-white">{quote?.ts ? new Date(quote.ts).toLocaleString() : "—"}</div>
					</div>
				</div>
			</section>

			<section className="space-y-3">
				<SectionHeader title="Related markets" />
				<div className="grid gap-3 sm:grid-cols-2">
					{relatedCatalog.map((r) => (
						<Link
							key={r.id}
							to={`/markets/${encodeURIComponent(r.id)}`}
							className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/30 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800"
						>
							<div className="text-xs text-gray-500 dark:text-gray-400">{r.id}</div>
							<div className="text-sm font-semibold text-gray-900 dark:text-white">{r.label || r.id}</div>
							{r.type ? <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.type}</div> : null}
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}

