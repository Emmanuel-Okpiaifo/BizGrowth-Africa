export default function Pagination() {
	return (
		<nav className="flex items-center justify-center gap-2">
			<button className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-200">
				Previous
			</button>
			<button className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-200">
				1
			</button>
			<button className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-200">
				2
			</button>
			<button className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-200">
				3
			</button>
			<button className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-200">
				Next
			</button>
		</nav>
	);
}


