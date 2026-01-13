import { ENV } from "../config/env";

function teCreds() {
	const { TE_CLIENT, TE_KEY } = ENV;
	if (TE_CLIENT && TE_KEY) return `${encodeURIComponent(TE_CLIENT)}:${encodeURIComponent(TE_KEY)}`;
	return "";
}

export async function fetchCommodityTimeseries(symbol, days = 120) {
	const creds = teCreds();
	if (!creds) throw new Error("Trading Economics credentials not configured");
	const end = new Date();
	const start = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
	const toISO = (d) => d.toISOString().slice(0, 10);
	const url = `https://api.tradingeconomics.com/markets/historical?symbol=${encodeURIComponent(
		symbol
	)}&period=daily&start=${toISO(start)}&end=${toISO(end)}&c=${creds}&format=json`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Commodity timeseries failed: ${res.status}`);
	const data = await res.json();
	const labels = [];
	const series = [];
	for (const row of data) {
		const date = row.Date || row.DateTime || row.date || row.datetime;
		const val = row.Close ?? row.close ?? row.Price ?? row.price;
		if (date && typeof val === "number") {
			labels.push(String(date).slice(0, 10));
			series.push(val);
		}
	}
	return { labels, series };
}

export async function fetchCommodityLatest(symbol) {
	const creds = teCreds();
	if (!creds) throw new Error("Trading Economics credentials not configured");
	const url = `https://api.tradingeconomics.com/markets/symbol/${encodeURIComponent(symbol)}?c=${creds}&format=json`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Commodity latest failed: ${res.status}`);
	const data = await res.json();
	const first = Array.isArray(data) ? data[0] : data;
	const price = first?.Last ?? first?.Price ?? first?.Close;
	return typeof price === "number" ? price : null;
}


