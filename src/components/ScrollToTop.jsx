import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
	const location = useLocation();
	useEffect(() => {
		// Smoothly scroll to top on every route change
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [location]);
	return null;
}


