import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Moon, Sun, Menu, X } from "lucide-react";
import brandLogo from "../assets/img/logos/bizgrowth3.png";

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
	const [open, setOpen] = useState(false);

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

	function MobileMenu({ onClose }) {
		const [show, setShow] = useState(false);
		useEffect(() => {
			const t = requestAnimationFrame(() => setShow(true));
			return () => cancelAnimationFrame(t);
		}, []);
		function closeWithAnimation() {
			setShow(false);
			setTimeout(() => onClose(), 200);
		}
		return (
			<>
				<button
					className={["fixed inset-0 z-40 cursor-default bg-black/20 transition-opacity duration-200", show ? "opacity-100" : "opacity-0"].join(" ")}
					aria-hidden="true"
					onClick={closeWithAnimation}
				/>
				<div
					className={[
						"absolute right-0 top-11 z-50 w-72 overflow-hidden rounded-xl border bg-white shadow-xl ring-1 ring-gray-200 transition-all duration-200 ease-out dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800",
						show ? "translate-y-0 scale-100 opacity-100" : "-translate-y-2 scale-95 opacity-0",
					].join(" ")}
				>
					<div className="p-3">
						<div className="flex items-center justify-between">
							<div className="text-sm font-semibold text-gray-900 dark:text-white">Quick Menu</div>
							<button
								onClick={closeWithAnimation}
								aria-label="Close menu"
								className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10"
							>
								<X size={14} />
							</button>
						</div>
						<div className="mt-3 grid gap-1">
							{navItems.map((item) => (
								<NavLink
									key={`m-${item.to}`}
									to={item.to}
									onClick={closeWithAnimation}
									className={({ isActive }) =>
										[
											"rounded-lg px-3 py-2 text-sm transition",
											isActive
												? "bg-primary/10 text-primary"
												: "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5",
										].join(" ")
									}
								>
									{item.label}
								</NavLink>
							))}
						</div>
						<div className="mt-4 rounded-lg border p-3 dark:border-gray-800">
							<div className="flex items-center justify-between">
								<div className="text-sm font-medium text-gray-800 dark:text-gray-200">Appearance</div>
								<button
									type="button"
									onClick={toggleTheme}
									className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
									title={dark ? "Switch to light mode" : "Switch to dark mode"}
								>
									{dark ? <Moon size={14} /> : <Sun size={14} />}
									<span>{dark ? "Dark" : "Light"}</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}

	return (
		<header className="border-b bg-gradient-to-b from-white to-gray-50 dark:from-[#0B1220] dark:to-[#0A0F1A] dark:border-gray-800">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<Link to="/" className="flex items-center gap-2">
						<img src={brandLogo} alt="BizGrowth Africa" className="h-10 w-auto object-contain" />
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
										"px-2 py-1 text-sm font-medium transition relative group",
										isActive
											? "text-primary"
											: "text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary",
									].join(" ")
								}
							>
								{({ isActive }) => (
									<>
										{item.label}
										<span className={`absolute bottom-0 left-2 right-2 h-0.5 bg-primary transition-all duration-300 ${
											isActive ? "w-full" : "w-0 group-hover:w-full"
										}`}></span>
									</>
								)}
							</NavLink>
						))}
					</nav>
					{/* Desktop/Tablet theme toggle */}
					<div className="hidden md:block">
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
					{/* Mobile hamburger (theme toggle lives inside this menu) */}
					<div className="relative md:hidden">
						<button
							type="button"
							onClick={() => setOpen((v) => !v)}
							aria-label="Open menu"
							className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
						>
							{open ? <X size={16} /> : <Menu size={16} />}
						</button>
						{open ? <MobileMenu onClose={() => setOpen(false)} /> : null}
					</div>
				</div>
			</div>
		</header>
	);
}


