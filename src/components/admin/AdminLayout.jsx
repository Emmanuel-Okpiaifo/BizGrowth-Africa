import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Briefcase, FolderOpen, LogOut, Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminLayout() {
	const location = useLocation();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [dark, setDark] = useState(false);

	// Initialize dark mode from localStorage
	useEffect(() => {
		const stored = localStorage.getItem("theme");
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

	const navItems = [
		{ path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
		{ path: '/admin/articles', label: 'Articles', icon: FileText },
		{ path: '/admin/opportunities', label: 'Opportunities', icon: Briefcase },
		{ path: '/admin/tenders', label: 'Tenders', icon: FolderOpen },
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#0A0F1A] dark:via-[#0B1220] dark:to-[#0A0F1A]">
			{/* Admin Navbar */}
			<nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0B1220]/80 backdrop-blur-lg transition-all duration-300 shadow-sm">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						{/* Logo & Title */}
						<Link 
							to="/admin" 
							className="flex items-center gap-3 group transition-transform duration-300 hover:scale-105"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-red-700 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
								<span className="text-lg font-bold text-white">BA</span>
							</div>
							<div>
								<h1 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">Admin Panel</h1>
								<p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">Content Management</p>
							</div>
						</Link>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center gap-1">
							{navItems.map((item) => {
								const Icon = item.icon;
								const isActive = location.pathname === item.path;
								return (
									<Link
										key={item.path}
										to={item.path}
										className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
											isActive
												? 'bg-primary text-white shadow-md scale-105'
												: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
										}`}
									>
										<Icon 
											size={18} 
											className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
										/>
										<span>{item.label}</span>
										{!isActive && (
											<span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4"></span>
										)}
									</Link>
								);
							})}
						</div>

						{/* Actions */}
						<div className="flex items-center gap-2 sm:gap-3">
							{/* Dark Mode Toggle - Hidden on mobile, visible on desktop */}
							<button
								type="button"
								onClick={toggleTheme}
								aria-label="Toggle dark mode"
								className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
								title={dark ? "Switch to light mode" : "Switch to dark mode"}
							>
								<div className="relative w-5 h-5">
									<Sun 
										size={18} 
										className={`absolute inset-0 transition-all duration-500 ${dark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
									/>
									<Moon 
										size={18} 
										className={`absolute inset-0 transition-all duration-500 ${dark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
									/>
								</div>
							</button>

							<Link
								to="/"
								className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 active:scale-95"
							>
								View Site
							</Link>
							<button className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300 hover:scale-105 active:scale-95">
								<LogOut size={18} />
								Logout
							</button>
							
							{/* Mobile Menu Button */}
							<button
								onClick={() => setSidebarOpen(!sidebarOpen)}
								aria-label="Toggle menu"
								className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 active:scale-95"
							>
								<div className="relative w-5 h-5">
									<X 
										size={20} 
										className={`absolute inset-0 transition-all duration-300 ${sidebarOpen ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`}
									/>
									<Menu 
										size={20} 
										className={`absolute inset-0 transition-all duration-300 ${sidebarOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
									/>
								</div>
							</button>
						</div>
					</div>
				</div>

				{/* Mobile Sidebar */}
				<div 
					className={`md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] overflow-hidden transition-all duration-300 ${
						sidebarOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
					}`}
				>
					<div className={`px-4 py-3 space-y-1 transition-transform duration-300 ${sidebarOpen ? 'translate-y-0' : '-translate-y-4'}`}>
						{navItems.map((item, idx) => {
							const Icon = item.icon;
							const isActive = location.pathname === item.path;
							return (
								<Link
									key={item.path}
									to={item.path}
									onClick={() => setSidebarOpen(false)}
									style={{ animationDelay: `${idx * 50}ms` }}
									className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
										isActive
											? 'bg-primary text-white shadow-md'
											: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
									} ${sidebarOpen ? 'animate-slide-in' : ''}`}
								>
									<Icon 
										size={20} 
										className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
									/>
									{item.label}
								</Link>
							);
						})}
						<div className="pt-2 border-t border-gray-200 dark:border-gray-800 mt-2">
							<Link
								to="/"
								onClick={() => setSidebarOpen(false)}
								className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 active:scale-95"
							>
								View Site
							</Link>
							<button
								onClick={() => {
									setSidebarOpen(false);
									toggleTheme();
								}}
								className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
							>
								<span>Appearance</span>
								<div className="inline-flex items-center gap-2">
									{dark ? <Moon size={16} /> : <Sun size={16} />}
									<span className="text-xs">{dark ? "Dark" : "Light"}</span>
								</div>
							</button>
							<button
								onClick={() => setSidebarOpen(false)}
								className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300"
							>
								<LogOut size={18} />
								Logout
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<Outlet />
			</main>

			{/* Admin Footer */}
			<footer className="mt-16 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#0B1220]/50 backdrop-blur-sm">
				<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<div className="text-sm text-gray-600 dark:text-gray-400">
							© {new Date().getFullYear()} BizGrowth Africa Admin Panel
						</div>
						<div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
							<Link to="/" className="hover:text-primary transition">View Website</Link>
							<span>•</span>
							<Link to="/contact" className="hover:text-primary transition">Support</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
