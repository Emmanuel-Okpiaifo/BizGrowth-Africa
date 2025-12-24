export default function PlaceholderBlock({ title = "Placeholder Area", height = "h-32", note }) {
	return (
		<div className={["rounded-xl border-2 border-dashed border-gray-300 bg-white/50 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-white/5 dark:text-gray-400", height].join(" ")}>
			<div className="font-semibold text-gray-700 dark:text-gray-300">{title}</div>
			{note ? <div className="mt-1 text-xs opacity-80">{note}</div> : null}
		</div>
	);
}


