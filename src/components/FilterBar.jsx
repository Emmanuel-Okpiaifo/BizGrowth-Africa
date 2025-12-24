import { Search, X, SlidersHorizontal } from "lucide-react";

export default function FilterBar({
	query,
	setQuery,
	country,
	setCountry,
	category,
	setCategory,
	typology,
	setTypology,
	minAmount,
	setMinAmount,
	maxAmount,
	setMaxAmount,
	sort,
	setSort,
	countries = [],
	categories = [],
	types = [],
	onReset,
}) {
	return (
		<div className="rounded-xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
			<div className="grid gap-3 lg:grid-cols-12">
				<div className="relative lg:col-span-4">
					<Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
					<input
						value={query}
						onChange={(e) => setQuery?.(e.target.value)}
						placeholder="Search opportunities, org, tags…"
						className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary dark:bg-transparent dark:text-white dark:border-gray-700"
					/>
				</div>
				<div className="grid grid-cols-2 gap-3 lg:col-span-8 lg:grid-cols-5">
					<select className="input" value={country} onChange={(e) => setCountry?.(e.target.value)}>
						<option value="">All countries</option>
						{countries.map((c) => (
							<option key={c} value={c}>{c}</option>
						))}
					</select>
					<select className="input" value={category} onChange={(e) => setCategory?.(e.target.value)}>
						<option value="">All categories</option>
						{categories.map((c) => (
							<option key={c} value={c}>{c}</option>
						))}
					</select>
					<select className="input" value={typology} onChange={(e) => setTypology?.(e.target.value)}>
						<option value="">Type</option>
						{types.map((t) => (
							<option key={t} value={t}>{t}</option>
						))}
					</select>
					<input
						type="number"
						min="0"
						className="input"
						placeholder="Min $"
						value={minAmount ?? ""}
						onChange={(e) => setMinAmount?.(e.target.value ? Number(e.target.value) : "")}
					/>
					<input
						type="number"
						min="0"
						className="input"
						placeholder="Max $"
						value={maxAmount ?? ""}
						onChange={(e) => setMaxAmount?.(e.target.value ? Number(e.target.value) : "")}
					/>
				</div>
			</div>

			<div className="mt-3 flex items-center justify-between">
				<div className="flex flex-wrap items-center gap-2 text-xs">
					{query ? <Pill onClear={() => setQuery?.("")} label={`“${query}”`} /> : null}
					{country ? <Pill onClear={() => setCountry?.("")} label={country} /> : null}
					{category ? <Pill onClear={() => setCategory?.("")} label={category} /> : null}
					{typology ? <Pill onClear={() => setTypology?.("")} label={typology} /> : null}
					{minAmount !== "" ? <Pill onClear={() => setMinAmount?.("")} label={`≥ ${minAmount}`} /> : null}
					{maxAmount !== "" ? <Pill onClear={() => setMaxAmount?.("")} label={`≤ ${maxAmount}`} /> : null}
				</div>
				<div className="flex items-center gap-2">
					<select className="input" value={sort} onChange={(e) => setSort?.(e.target.value)}>
						<option value="deadline">Sort: Deadline</option>
						<option value="latest">Sort: Latest</option>
						<option value="amount_desc">Amount: High → Low</option>
						<option value="amount_asc">Amount: Low → High</option>
					</select>
					<button
						type="button"
						className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px4 py-1.5 text-sm text-gray-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-200"
						onClick={() => on?._reset?.()}
					>
						<X size={14} /> Reset
					</button>
					<span className="hidden items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300 lg:flex">
						<SlidersHorizontal size={12} /> Filters
					</span>
				</div>
			</div>

			<style jsx>{`
				.input {
					@apply w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary dark:bg-transparent dark:text-white dark:border-gray-700;
				}
			`}</style>
		</div>
	);
}

function Pill({ label, onClear }) {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-700 text-[11px] dark:bg-gray-800 dark:text-gray-300">
			{label}
			<button
				type="button"
				onClick={onClear}
				className="inline-flex items-center justify-center rounded-full hover:text-primary"
				aria-label="Clear filter"
			>
				<X size={12} />
			</button>
		</span>
	);
}


