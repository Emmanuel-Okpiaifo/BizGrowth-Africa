import { useMemo } from "react";

const DEFAULT_ITEMS = [
	"AfDB",
	"ECOWAS",
	"UNDP",
	"World Bank",
	"IFC",
	"USAID",
	"GIZ",
	"Mastercard Foundation",
	"Tony Elumelu Foundation",
	"GSMA",
	"Google for Startups",
];

export default function BrandMarquee({ items = DEFAULT_ITEMS, speedMs = 20000 }) {
	const list = useMemo(() => [...items, ...items], [items]);
	return (
		<div className="relative overflow-hidden rounded-xl border bg-white/70 p-2 backdrop-blur ring-1 ring-gray-200 dark:border-gray-800 dark:bg-white/5 dark:ring-gray-800">
			<div
				className="flex min-w-max animate-[marquee_linear_infinite] items-center gap-6 px-2"
				style={{ animationDuration: `${speedMs}ms` }}
			>
				{list.map((label, i) => (
					<div
						key={`${label}-${i}`}
						className="whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-200"
					>
						{label}
					</div>
				))}
			</div>
			<style>{`
				@keyframes marquee {
					0% { transform: translateX(0); }
					100% { transform: translateX(-50%); }
				}
				.animate-[marquee_linear_infinite] {
					animation-name: marquee;
					animation-timing-function: linear;
					animation-iteration-count: infinite;
				}
			`}</style>
		</div>
	);
}

