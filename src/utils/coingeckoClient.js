/**
 * Client-side CoinGecko API (no API key required).
 * Used when the PHP market API is not available, so crypto (BTC, ETH) still works.
 * Rate limit: free tier ~10–30 calls/min — we poll every 2–3 min.
 */

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const CRYPTO_IDS = ["bitcoin", "ethereum"];
const SYMBOL_MAP = { bitcoin: "BTCUSD", ethereum: "ETHUSD" };
const LABEL_MAP = { bitcoin: "BTC/USD", ethereum: "ETH/USD" };

/**
 * Fetch current prices and 24h change for BTC and ETH.
 * @returns {Promise<Array<{ id, label, price, changePct, ts, source, stale, points? }>>}
 */
export async function fetchCryptoQuotes() {
	const ids = CRYPTO_IDS.join(",");
	const url = `${COINGECKO_BASE}/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
	const data = await res.json();
	const ts = Date.now();
	const quotes = [];
	for (const cgId of CRYPTO_IDS) {
		const row = data[cgId];
		if (!row || typeof row.usd !== "number") continue;
		quotes.push({
			id: SYMBOL_MAP[cgId],
			label: LABEL_MAP[cgId],
			price: row.usd,
			change: null,
			changePct: row.usd_24h_change != null ? row.usd_24h_change : null,
			ts,
			source: "coingecko",
			stale: false,
			points: [], // filled optionally from market_chart for sparkline
		});
	}
	return quotes;
}

/**
 * Fetch 30-day price history for sparkline/chart.
 * @param {string} symbolId - BTCUSD or ETHUSD
 * @returns {Promise<Array<{ t: number, v: number }>>}
 */
export async function fetchCryptoHistory(symbolId) {
	const id = symbolId === "ETHUSD" ? "ethereum" : symbolId === "BTCUSD" ? "bitcoin" : null;
	if (!id) return [];
	const url = `${COINGECKO_BASE}/coins/${id}/market_chart?vs_currency=usd&days=30`;
	const res = await fetch(url);
	if (!res.ok) return [];
	const data = await res.json();
	const prices = data.prices || [];
	const points = prices
		.filter((p) => Array.isArray(p) && p.length >= 2)
		.map(([t, v]) => ({ t: Number(t), v: Number(v) }))
		.sort((a, b) => a.t - b.t);
	return points.slice(-120);
}
