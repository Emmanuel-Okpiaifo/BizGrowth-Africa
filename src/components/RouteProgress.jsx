import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function RouteProgress() {
	const location = useLocation();
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		setVisible(true);
		const t = setTimeout(() => setVisible(false), 600);
		return () => clearTimeout(t);
	}, [location]);

	return (
		<div
			className={[
				"pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5",
				visible ? "opacity-100" : "opacity-0",
				"transition-opacity duration-300",
			].join(" ")}
		>
			<div className="h-full w-full animate-[progress_0.6s_ease-out] bg-primary" />
			<style>{`
				@keyframes progress {
					from { transform: scaleX(0); transform-origin: left; }
					to { transform: scaleX(1); transform-origin: left; }
				}
			`}</style>
		</div>
	);
}


