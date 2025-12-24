import SectionHeader from "./SectionHeader";
import Sparkline from "./Sparkline";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const sampleMarkets = [
	{ symbol: "NGX-ASI", name: "NGX All Share", value: 104532.7, change: +0.82, series: [98, 102, 101, 103, 104, 105] },
	{ symbol: "JSE-ALSI", name: "JSE All Share", value: 78112.3, change: -0.34, series: [80, 79, 78, 78.5, 78.2, 78.1] },
	{ symbol: "USD/NGN", name: "USD-Naira", value: 1235.5, change: +0.15, series: [1210, 1220, 1230, 1225, 1234, 1235] },
	{ symbol: "BTC/USD", name: "Bitcoin", value: 96432.1, change: +1.25, series: [92, 93, 91, 94, 95, 96] },
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
							<div
								key={m.symbol}
								className="min-w-[260px] rounded-xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:shadow-lg dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800"
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
							</div>
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


