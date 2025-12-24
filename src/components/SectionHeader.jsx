export default function SectionHeader({ title, action }) {
	return (
		<div className="mb-4 flex items-center justify-between">
			<h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">{title}</h2>
			{action ? <div>{action}</div> : null}
		</div>
	);
}


