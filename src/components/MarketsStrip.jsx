import SectionHeader from "./SectionHeader";
import Sparkline from "./Sparkline";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const sampleMarkets = [
	// Equity indices
	{ symbol: "NGX-ASI", name: "NGX All Share (Nigeria)", value: 104532.7, change: +0.82, series: [98, 102, 101, 103, 104, 105] },
	{ symbol: "JSE-ALSI", name: "JSE All Share (South Africa)", value: 78112.3, change: -0.34, series: [80, 79, 78, 78.5, 78.2, 78.1] },
	{ symbol: "NSE-20", name: "NSE 20 (Kenya)", value: 1754.2, change: +0.21, series: [17.1, 17.2, 17.0, 17.3, 17.4, 17.54] },
	{ symbol: "EGX30", name: "EGX 30 (Egypt)", value: 32651.9, change: +0.47, series: [31, 31.5, 32, 32.2, 32.4, 32.65] },
	{ symbol: "BRVM-C", name: "BRVM Composite (WAEMU)", value: 230.5, change: -0.18, series: [2.35, 2.32, 2.31, 2.29, 2.305, 2.305] },
	{ symbol: "BSE-DFI", name: "BSE Domestic Companies (Botswana)", value: 8034.6, change: +0.12, series: [79.5, 80.0, 80.2, 80.3, 80.34, 80.346] },
	// FX pairs (illustrative)
	{ symbol: "USD/NGN", name: "USD-Naira", value: 1235.5, change: +0.15, series: [1210, 1220, 1230, 1225, 1234, 1235] },
	{ symbol: "USD/KES", name: "USD-Kenyan Shilling", value: 154.6, change: -0.08, series: [155.1, 155.0, 154.9, 154.8, 154.7, 154.6] },
	{ symbol: "USD/ZAR", name: "USD-Rand", value: 18.7, change: +0.05, series: [18.4, 18.5, 18.55, 18.6, 18.65, 18.7] },
	{ symbol: "USD/GHS", name: "USD-Cedi", value: 14.9, change: -0.11, series: [15.2, 15.1, 15.0, 14.95, 14.92, 14.9] },
	// Commodities (regional relevance)
	{ symbol: "BRENT", name: "Brent Crude (USD/bbl)", value: 81.2, change: +0.32, series: [78, 79, 80, 80.5, 81, 81.2] },
	{ symbol: "GOLD", name: "Gold (USD/oz)", value: 2298.5, change: -0.27, series: [2305, 2302, 2300, 2299, 2298.8, 2298.5] },
];

export default function MarketsStrip({ items = sampleMarkets }) {
	return (
		<section className="relative">
			<SectionHeader title="Latest Markets" />
			<div className="no-scrollbar -mx-4 overflow-x-auto px-4">
				<div className="flex gap-4">
					{items.map((m) => {
						const up = m.change >= 0;
						const color = up ? "#16a34a" : "#dc2626";
						return (
							<Link
								key={m.symbol}
								to={`/markets/${encodeURIComponent(m.symbol)}`}
								className="min-w-[260px] rounded-xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/30 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800"
							>
								<div className="flex items-center justify-between">
									<div>
										<div className="text-xs text-gray-500 dark:text-gray-400">{m.symbol}</div>
										<div className="text-sm font-semibold text-gray-900 dark:text-white">{m.name}</div>
									</div>
									<div className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-green-500" : "text-red-500"}`}>
										{up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
										{Math.abs(m.change).toFixed(2)}%
									</div>
								</div>
								<div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
									{m.value.toLocaleString()}
								</div>
								<div className="mt-2">
									<Sparkline points={m.series} color={color} />
								</div>
							</Link>
						);
					})}
				</div>
			</div>
			<style>{`
				.no-scrollbar::-webkit-scrollbar { display: none; }
				.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
			`}</style>
		</section>
	);
}


