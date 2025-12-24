import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

const navItems = [
	{ to: "/", label: "Home" },
	{ to: "/opportunities", label: "Opportunities" },
	{ to: "/procurement-tenders", label: "Procurement & Tenders" },
	{ to: "/news-insights", label: "News & Insights" },
	{ to: "/tools-templates", label: "Tools & Templates" },
	{ to: "/community", label: "Community" },
	{ to: "/about", label: "About" },
	{ to: "/contact", label: "Contact" },
];

export default function Navbar() {
	const [dark, setDark] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem("theme");
		// Default to light mode unless user explicitly stored "dark"
		const enabled = stored ? stored === "dark" : false;
		document.documentElement.classList.toggle("dark", enabled);
		setDark(enabled);
	}, []);

	function toggleTheme() {
		const next = !dark;
		setDark(next);
		document.documentElement.classList.toggle("dark", next);
		localStorage.setItem("theme", next ? "dark" : "light");
	}

	return (
		<header className="border-b bg-white dark:border-gray-800 dark:bg-[#0B1220]">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<Link to="/" className="flex items-center gap-2">
						<div className="h-8 w-8 rounded bg-primary" />
						<span className="text-lg font-bold text-gray-900 dark:text-white">
							BizGrowth Africa
						</span>
					</Link>
					<nav className="hidden items-center gap-6 md:flex">
						{navItems.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								className={({ isActive }) =>
									[
										"px-2 py-1 text-sm font-medium transition",
										isActive
											? "text-primary"
											: "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
									].join(" ")
								}
							>
								{item.label}
							</NavLink>
						))}
					</nav>
					{/* Theme toggle (always visible on mobile and desktop) */}
					<button
						type="button"
						onClick={toggleTheme}
						aria-label="Toggle dark mode"
						className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
						title={dark ? "Switch to light mode" : "Switch to dark mode"}
					>
						{dark ? <Moon size={16} /> : <Sun size={16} />}
					</button>
				</div>
			</div>
		</header>
	);
}


