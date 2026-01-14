import { useEffect, useState } from "react";
import brandLogo from "../assets/img/logos/bizgrowth2.png";

export default function Preloader() {
	const [visible, setVisible] = useState(true);
	useEffect(() => {
		let timeoutId = 0;
		function hide() {
			timeoutId = window.setTimeout(() => setVisible(false), 400);
		}
		if (document.readyState === "complete") {
			hide();
		} else {
			window.addEventListener("load", hide, { once: true });
		}
		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener("load", hide);
		};
	}, []);
	if (!visible) return null;
	return (
		<div className="fixed inset-0 z-[9999] grid place-items-center bg-red-50 transition-opacity duration-300 dark:bg-[#0B1220]">
			<div className="relative">
				<div className="pointer-events-none absolute -right-16 -top-16 h-28 w-28 rounded-full bg-primary/20 blur-2xl" />
				<div className="pointer-events-none absolute -bottom-16 -left-16 h-28 w-28 rounded-full bg-red-500/20 blur-2xl" />
				<div className="flex flex-col items-center gap-4 rounded-2xl">
					<div className="relative h-12 w-12">
						<div className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
						<div className="absolute inset-2 rounded-full bg-primary" />
					</div>
					<img src={brandLogo} alt="BizGrowth Africa" className="h-8 w-auto object-contain" />
					<div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Loading BizGrowth Africa…</div>
				</div>
			</div>
		</div>
	);
}

