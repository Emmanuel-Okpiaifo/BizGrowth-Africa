import { Clock, CheckCircle2 } from "lucide-react";

export default function CountDownBadge({ date }) {
	const now = new Date();
	const d = date ? new Date(date) : null;
	if (!d || Number.isNaN(d.getTime())) return null;
	const ms = d.getTime() - now.getTime();
	const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
	const closed = days < 0;
	return (
		<span
			className={[
				"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
				closed ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
			].join(" ")}
			title={d.toDateString()}
		>
			{closed ? <span className="inline-flex items-center"><span className="mr-1">⏳</span>Closed</span> : <><Clock size={14} />{days}d left</>}
		</span>
	);
}


