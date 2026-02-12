export default function CategoryPills({ categories, active, onChange }) {
	const list = Array.isArray(categories) ? categories : [];
	return (
		<div className="flex flex-wrap gap-2">
			{["All", ...list].map((cat) => {
				const isActive = (active || "All") === cat;
				return (
					<button
						key={cat}
						onClick={() => onChange?.(cat)}
						className={[
							"rounded-full px-3 py-1 text-xs font-semibold transition",
							isActive
								? "bg-primary text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
						].join(" ")}
					>
						{cat}
					</button>
				);
			})}
		</div>
	);
}


