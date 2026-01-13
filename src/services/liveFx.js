const BASE = "https://api.exchangerate.host";

export async function fetchFxLatest(base = "USD", quote = "NGN") {
	const url = `${BASE}/latest?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(quote)}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`FX latest failed: ${res.status}`);
	const data = await res.json();
	const rate = data?.rates?.[quote];
	return rate;
}

export async function fetchFxTimeseries(base = "USD", quote = "NGN", days = 60) {
	// Build date range for the last N days
	const end = new Date();
	const start = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
	const toISO = (d) => d.toISOString().slice(0, 10);
	const url = `${BASE}/timeseries?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(
		quote
	)}&start_date=${toISO(start)}&end_date=${toISO(end)}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`FX timeseries failed: ${res.status}`);
	const data = await res.json();
	const series = [];
	const labels = [];
	const rates = data?.rates || {};
	const keys = Object.keys(rates).sort(); // chronological
	for (const k of keys) {
		const r = rates[k]?.[quote];
		if (typeof r === "number") {
			labels.push(k);
			series.push(r);
		}
	}
	return { labels, series };
}


