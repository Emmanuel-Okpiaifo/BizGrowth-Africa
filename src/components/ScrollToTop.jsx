import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
	const location = useLocation();

	useEffect(() => {
		const hash = location.hash?.replace(/^#/, "").trim();
		if (hash) {
			// Wait for the target section to be in the DOM (e.g. after Community/Footer render)
			const t = setTimeout(() => {
				const el = document.getElementById(hash);
				if (el) {
					el.scrollIntoView({ behavior: "smooth", block: "start" });
				} else {
					window.scrollTo({ top: 0, behavior: "smooth" });
				}
			}, 100);
			return () => clearTimeout(t);
		}
		// No hash: scroll to top on route change
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [location.pathname, location.hash]);

	return null;
}


