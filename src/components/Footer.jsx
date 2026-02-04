import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faXTwitter, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import brandLogo from "../assets/img/logos/bizgrowth3.png";

export default function Footer() {
	const [newsletterData, setNewsletterData] = useState({
		firstName: "",
		lastName: "",
		email: ""
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [newsletterStatus, setNewsletterStatus] = useState({ type: null, message: "" });

	// Google Sheets webhook URL from membership form
	const webhookUrl = 'https://script.google.com/macros/s/AKfycbw6IyBFIF0qLhH1qXctH58GBTPFj2wrqv9oZJqUGXGxJ7y5Ti0Gm8ubrXgNvh6I-LdiLA/exec';

	const handleNewsletterChange = (e) => {
		const { name, value } = e.target;
		setNewsletterData(prev => ({
			...prev,
			[name]: value
		}));
		if (newsletterStatus.type) {
			setNewsletterStatus({ type: null, message: "" });
		}
	};

	const getUserAgentString = () => {
		try {
			let ua = navigator.userAgent || '';
			if (!ua && navigator.userAgentData) {
				const brands = (navigator.userAgentData.brands || [])
					.map(b => `${b.brand}/${b.version}`)
					.join('; ');
				ua = `${brands}; mobile=${navigator.userAgentData.mobile}`;
			}
			const lang = navigator.language || '';
			let tz = '';
			try {
				tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
			} catch {}
			return [ua, lang, tz].filter(Boolean).join(' | ');
		} catch {
			return 'unknown';
		}
	};

	const postJSON = async (url, payload) => {
		try {
			const resp = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain;charset=utf-8',
					'Accept': 'application/json'
				},
				body: JSON.stringify(payload),
				keepalive: true,
				mode: 'cors'
			});
			const ok = (resp.status >= 200 && resp.status < 400) || resp.type === 'opaque';
			let data = null;
			try {
				data = await resp.clone().json();
			} catch {
				try {
					data = await resp.text();
				} catch {
					data = null;
				}
			}
			return { ok, status: resp.status, data };
		} catch (error) {
			return { ok: false, status: 0, data: null, error };
		}
	};

	const handleNewsletterSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setNewsletterStatus({ type: null, message: "" });

		// Validate
		if (!newsletterData.firstName || !newsletterData.lastName || !newsletterData.email) {
			setNewsletterStatus({
				type: "error",
				message: "Please fill in all fields."
			});
			setIsSubmitting(false);
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(newsletterData.email)) {
			setNewsletterStatus({
				type: "error",
				message: "Please enter a valid email address."
			});
			setIsSubmitting(false);
			return;
		}

		const payload = {
			form: 'newsletter',
			formType: 'newsletter',
			ts: new Date().toISOString(),
			firstName: newsletterData.firstName,
			lastName: newsletterData.lastName,
			email: newsletterData.email,
			userAgent: getUserAgentString(),
			page: window.location.href
		};

		// Optimistic UI: show success immediately
		setNewsletterStatus({
			type: "success",
			message: "Thanks for subscribing!"
		});

		// Reset form
		setNewsletterData({
			firstName: "",
			lastName: "",
			email: ""
		});

		// Fire-and-forget relay to Google Sheets
		if (webhookUrl && !webhookUrl.includes('YOUR_DEPLOYMENT_ID')) {
			postJSON(webhookUrl, payload).catch((err) =>
				console.warn('Newsletter submission failed:', err)
			);
		}

		setIsSubmitting(false);
	};

	return (
		<footer className="relative mt-16 bg-gradient-to-b from-white to-gray-50 dark:from-[#0B1220] dark:to-[#0A0F1A] text-gray-900 dark:text-white border-t border-gray-200 dark:border-white/10">
			{/* Decorative background elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
				<div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
			</div>

			<div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
					{/* Brand Section */}
					<div className="space-y-4">
						<div className="flex items-center gap-2.5">
							<img src={brandLogo} alt="BizGrowth Africa" className="h-11 w-auto object-contain" />
							<span className="text-xl font-bold text-gray-900 dark:text-white">BizGrowth Africa</span>
						</div>
						<p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 max-w-xs">
							Curated business news, opportunities, tenders, tools and community for African MSMEs.
						</p>
						<div className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300 pt-2">
							<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20">
								<FontAwesomeIcon icon={faEnvelope} className="text-primary" size="sm" />
							</div>
							<a 
								href="mailto:info@bizgrowthafrica.com" 
								className="hover:text-primary hover:underline transition-colors font-medium"
							>
								info@bizgrowthafrica.com
							</a>
						</div>
					</div>

					{/* Explore Links */}
					<div className="space-y-4">
						<h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-1">
							Explore
						</h4>
						<ul className="space-y-2.5">
							{[
								{ label: "News & Insights", href: "/news-insights" },
								{ label: "Opportunities", href: "/opportunities" },
								{ label: "Procurement & Tenders", href: "/procurement-tenders" },
								{ label: "Tools & Templates", href: "/tools-templates" }
							].map((link, idx) => (
								<li key={idx}>
									<a 
										href={link.href} 
										className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors relative group"
									>
										{link.label}
										<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Company Links */}
					<div className="space-y-4">
						<h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-1">
							Company
						</h4>
						<ul className="space-y-2.5">
							{[
								{ label: "About", href: "/about" },
								{ label: "Community", href: "/community" },
								{ label: "Contact", href: "/contact" },
								{ label: "Privacy Policy", href: "/privacy-policy" }
							].map((link, idx) => (
								<li key={idx}>
									<a 
										href={link.href} 
										className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors relative group"
									>
										{link.label}
										<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Newsletter Section — direct link: /community#newsletter */}
					<div id="newsletter" className="space-y-4 scroll-mt-20">
						<div>
							<h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-2">
								Newsletter
							</h4>
							<p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
								Subscribe to our newsletter to stay updated with the latest business news, opportunities, and insights.
							</p>
						</div>
						<form
							className="space-y-2.5"
							onSubmit={handleNewsletterSubmit}
						>
							<input
								type="text"
								name="firstName"
								value={newsletterData.firstName}
								onChange={handleNewsletterChange}
								required
								placeholder="First Name"
								className="w-full rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
							/>
							<input
								type="text"
								name="lastName"
								value={newsletterData.lastName}
								onChange={handleNewsletterChange}
								required
								placeholder="Last Name"
								className="w-full rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
							/>
							<div className="flex gap-2">
								<input
									type="email"
									name="email"
									value={newsletterData.email}
									onChange={handleNewsletterChange}
									required
									placeholder="Email address"
									className="w-full flex-1 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
								/>
								<button
									type="submit"
									disabled={isSubmitting}
									className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md"
								>
									{isSubmitting ? "..." : "Subscribe"}
								</button>
							</div>
							{newsletterStatus.type && (
								<p className={`text-xs font-medium ${
									newsletterStatus.type === "success" 
										? "text-green-600 dark:text-green-400" 
										: "text-red-600 dark:text-red-400"
								}`}>
									{newsletterStatus.message}
								</p>
							)}
						</form>
						{/* Social Media Links */}
						<div className="flex items-center gap-3 pt-2">
							<a
								href="https://x.com/BizGrowthAfrica"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="X (Twitter)"
								className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/10 transition-all hover:scale-110 hover:shadow-md hover:bg-black hover:text-white group"
								style={{ color: "#000000" }}
							>
								<FontAwesomeIcon icon={faXTwitter} size="sm" className="group-hover:text-white" />
							</a>
							<a
								href="https://www.instagram.com/bizgrowth_africa?igsh=d3d0OWJuMHU3dms5&utm_source=qr"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Instagram"
								className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/10 transition-all hover:scale-110 hover:shadow-md hover:bg-[#E4405F] hover:text-white group"
								style={{ color: "#E4405F" }}
							>
								<FontAwesomeIcon icon={faInstagram} size="sm" className="group-hover:text-white" />
							</a>
							<a
								href="https://www.facebook.com/share/1ARErnneyb/?mibextid=wwXIfr"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Facebook"
								className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/10 transition-all hover:scale-110 hover:shadow-md hover:bg-[#1877F2] hover:text-white group"
								style={{ color: "#1877F2" }}
							>
								<FontAwesomeIcon icon={faFacebook} size="sm" className="group-hover:text-white" />
							</a>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10">
					<div className="text-center">
						<p className="text-xs text-gray-500 dark:text-gray-400">
							© {new Date().getFullYear()} BizGrowth Africa. All rights reserved.
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}


