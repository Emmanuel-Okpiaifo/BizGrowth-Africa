import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import RouteProgress from "./RouteProgress";
import ScrollToTop from "./ScrollToTop";
import Preloader from "./Preloader";
import CookieConsent from "./CookieConsent";
import { usePageTracking } from "../hooks/usePageTracking";

export default function Layout() {
	// Track page views on route changes
	usePageTracking();

	return (
		<div className="flex min-h-screen flex-col bg-white dark:bg-[#0B1220]">
			<Preloader />
			<RouteProgress />
			<ScrollToTop />
			<Navbar />
			<main className="flex-1">
				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
					<Outlet />
				</div>
			</main>
			<Footer />
			<CookieConsent />
		</div>
	);
}


