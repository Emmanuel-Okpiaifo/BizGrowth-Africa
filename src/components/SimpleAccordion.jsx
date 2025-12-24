import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function SimpleAccordion({ items = [] }) {
	return (
		<div className="divide-y divide-gray-200 rounded-xl border border-gray-200 dark:border-gray-800 dark:divide-gray-800">
			{items.map((it, idx) => (
				<Item key={idx} {...it} />
			))}
		</div>
	);
}

function Item({ q, a }) {
	const [open, setOpen] = useState(false);
	return (
		<div>
			<button
				type="button"
				className="flex w-full items-center justify-between gap-3 p-4 text-left"
				onClick={() => setOpen((v) => !v)}
			>
				<span className="font-medium text-gray-900 dark:text-white">{q}</span>
				<ChevronDown
					className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
					size={18}
				/>
			</button>
			{open ? (
				<div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-300">{a}</div>
			) : null}
		</div>
	);
}


