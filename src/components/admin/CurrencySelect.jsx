import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { CURRENCIES } from '../../data/currencies';

/**
 * Searchable currency selector for opportunity create/edit.
 * value/onChange: same as a controlled select (value = code string, e.g. 'USD').
 */
export default function CurrencySelect({ value, onChange, className = '', id }) {
	const [search, setSearch] = useState('');
	const [open, setOpen] = useState(false);
	const containerRef = useRef(null);

	const selected = CURRENCIES.find((c) => c.code === value) || null;
	const searchLower = (search || '').trim().toLowerCase();
	const filtered =
		searchLower === ''
			? CURRENCIES
			: CURRENCIES.filter(
					(c) =>
						c.code.toLowerCase().includes(searchLower) ||
						c.name.toLowerCase().includes(searchLower)
				);

	// Close on click outside
	useEffect(() => {
		function handleClickOutside(e) {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setOpen(false);
			}
		}
		if (open) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
	}, [open]);

	const displayLabel = selected ? `${selected.code} - ${selected.name}` : 'Select currency';

	return (
		<div ref={containerRef} className="relative">
			<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
				Currency
			</label>
			<div className="flex gap-2">
				<div className="flex-1 relative">
					<input
						type="text"
						role="combobox"
						aria-expanded={open}
						aria-haspopup="listbox"
						aria-controls="currency-listbox"
						id={id}
						value={open ? search : displayLabel}
						onChange={(e) => {
							setSearch(e.target.value);
							setOpen(true);
						}}
						onFocus={() => setOpen(true)}
						onKeyDown={(e) => {
							if (e.key === 'Escape') {
								setOpen(false);
								setSearch('');
							}
						}}
						placeholder="Search by code or name..."
						className={`w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 pr-10 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none ${className}`}
					/>
					<Search
						className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
						aria-hidden
					/>
				</div>
			</div>
			{open && (
				<ul
					id="currency-listbox"
					role="listbox"
					className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] shadow-lg py-1"
				>
					{filtered.length === 0 ? (
						<li className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
							No currency found. Try another search.
						</li>
					) : (
						filtered.map((c) => (
							<li
								key={c.code}
								role="option"
								aria-selected={value === c.code}
								onClick={() => {
									onChange(c.code);
									setSearch('');
									setOpen(false);
								}}
								className={`px-4 py-2 cursor-pointer text-sm ${
									value === c.code
										? 'bg-primary/20 text-primary font-medium'
										: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
								}`}
							>
								<span className="font-medium">{c.code}</span>
								<span className="text-gray-500 dark:text-gray-400"> — {c.name}</span>
							</li>
						))
					)}
				</ul>
			)}
		</div>
	);
}
