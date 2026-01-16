import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone } from "lucide-react";
import brandLogo from "../assets/img/logos/bizgrowth2.png";

export default function Footer() {
	return (
			<footer className="mt-10 bg-white dark:bg-[#0B1220] text-gray-900 dark:text-white border-t border-gray-200 dark:border-white/10">
			<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
				<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
					<div>
						<div className="flex items-center gap-2">
							<img src={brandLogo} alt="BizGrowth Africa" className="h-8 w-auto object-contain" />
							<span className="text-lg font-bold">BizGrowth Africa</span>
						</div>
							<p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
							Curated business news, opportunities, tenders, tools and community for African MSMEs.
						</p>
							<div className="mt-4 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
								<Mail size={16} className="text-gray-400 dark:text-gray-400" />
								<span>info@bizgrowthafrica.com</span>
						</div>
							<div className="mt-1 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
								<Phone size={16} className="text-gray-400 dark:text-gray-400" />
							<span>+234 (0) 800 000 0000</span>
						</div>
					</div>
					<div>
						<h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
							Explore
						</h4>
						<ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
							<li><a className="hover:underline" href="/news-insights">News & Insights</a></li>
							<li><a className="hover:underline" href="/opportunities">Opportunities</a></li>
							<li><a className="hover:underline" href="/procurement-tenders">Procurement & Tenders</a></li>
							<li><a className="hover:underline" href="/tools-templates">Tools & Templates</a></li>
						</ul>
					</div>
					<div>
						<h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
							Company
						</h4>
						<ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
							<li><a className="hover:underline" href="/about">About</a></li>
							<li><a className="hover:underline" href="/community">Community</a></li>
							<li><a className="hover:underline" href="/contact">Contact</a></li>
						</ul>
					</div>
					<div>
						<h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
							Stay updated
						</h4>
						<form
							className="mt-3 flex max-w-sm gap-2"
							onSubmit={(e) => {
								e.preventDefault();
								alert("Thanks for subscribing!");
							}}
						>
							<input
								type="email"
								required
								placeholder="Email address"
								className="w-full flex-1 rounded-lg border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 focus:border-primary"
							/>
							<button
								type="submit"
								className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"
							>
								Subscribe
							</button>
						</form>
							<div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
								<a href="#" aria-label="Twitter" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-white transition hover:bg-gray-300 dark:hover:bg-white/10">
									<Twitter size={18} />
								</a>
								<a href="#" aria-label="LinkedIn" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-white transition hover:bg-gray-300 dark:hover:bg-white/10">
									<Linkedin size={18} />
								</a>
								<a href="#" aria-label="Instagram" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-white transition hover:bg-gray-300 dark:hover:bg-white/10">
									<Instagram size={18} />
								</a>
								<a href="#" aria-label="Facebook" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-white transition hover:bg-gray-300 dark:hover:bg-white/10">
								<Facebook size={18} />
							</a>
						</div>
					</div>
				</div>
				<div className="mt-8 border-t border-gray-200 dark:border-white/10 pt-6 text-center text-xs text-gray-500 dark:text-gray-400">
					© {new Date().getFullYear()} BizGrowth Africa. All rights reserved.
				</div>
			</div>
		</footer>
	);
}


