import { Shield, Database, Lock, Eye, FileText, Mail, Globe, Users, Cookie, AlertTriangle, CheckCircle, Info } from "lucide-react";
import SEO from "../components/SEO";

export default function PrivacyPolicy() {
	const sections = [
		{
			id: "introduction",
			title: "Introduction",
			icon: Info,
			content: (
				<div className="space-y-4">
					<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
						Welcome to BizGrowth Africa. We are committed to protecting your privacy and ensuring transparency about how we collect, use, and safeguard your personal information. This Privacy Policy explains our practices regarding data collection, processing, and your rights concerning your personal data.
					</p>
					<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
						<strong className="text-gray-900 dark:text-white">BizGrowth Africa</strong> is a business intelligence platform designed specifically for African MSMEs (Micro, Small, and Medium Enterprises). We provide curated news, funding opportunities, procurement tenders, market updates, and practical resources to help businesses make informed decisions.
					</p>
					<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
						In compliance with the <strong className="text-gray-900 dark:text-white">Nigeria Data Protection Act, 2023 (NDPA)</strong>, the <strong className="text-gray-900 dark:text-white">General Data Protection Regulation (GDPR)</strong>, and other applicable data protection laws across Africa and globally, we primarily qualify as a <strong className="text-gray-900 dark:text-white">data controller</strong>. This means we determine the purpose and manner in which we collect and process your personal data.
					</p>
					<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
						If you are a visitor, subscriber, newsletter recipient, or user of our website services, this privacy policy applies to you.
					</p>
				</div>
			)
		},
		{
			id: "data-collection",
			title: "Data We Collect",
			icon: Database,
			content: (
				<div className="space-y-6">
					<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
						We may collect and process the following categories of personal data:
					</p>
					<div className="grid gap-4 sm:grid-cols-2">
						{[
							{ title: "Identity & Contact", items: ["Name (First & Last)", "Email address", "Phone number", "Country/Region"] },
							{ title: "Newsletter Data", items: ["Email address", "First & Last Name", "Subscription preferences", "Subscription date"] },
							{ title: "Contact Form Data", items: ["Name", "Email", "Company", "Subject", "Message content"] },
							{ title: "Membership Data", items: ["Name & Email", "Phone number", "Country", "Areas of interest", "User ID"] },
							{ title: "Technical Data", items: ["IP address", "Browser type", "Device information", "Pages visited", "Referral source"] },
							{ title: "Cookie Data", items: ["Google Analytics cookies", "LocalStorage data", "Session data", "Theme preferences"] }
						].map((category, idx) => (
							<div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
								<h4 className="font-semibold text-gray-900 dark:text-white mb-2">{category.title}</h4>
								<ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
									{category.items.map((item, i) => (
										<li key={i} className="flex items-start gap-2">
											<span className="text-primary mt-0.5">•</span>
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			)
		},
		{
			id: "data-usage",
			title: "How We Use Your Data",
			icon: Eye,
			content: (
				<div className="space-y-4">
					<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
						We use your personal data for the following purposes:
					</p>
					<div className="space-y-3">
						{[
							{ title: "Service Delivery", desc: "Provide access to our website, deliver newsletters, respond to inquiries, and process memberships." },
							{ title: "Website Improvement", desc: "Analyze usage patterns, understand user behavior, and optimize functionality and content." },
							{ title: "Personalization", desc: "Remember your preferences, customize content, and save your watchlist and reading preferences." },
							{ title: "Communication", desc: "Send newsletters, updates, relevant business information, and respond to your inquiries." },
							{ title: "Legal Compliance", desc: "Comply with applicable laws, respond to legal requests, and prevent fraud and security threats." },
							{ title: "Business Operations", desc: "Maintain and improve services, conduct research, and generate aggregated statistics." }
						].map((use, idx) => (
							<div key={idx} className="flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
								<div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
									<CheckCircle className="w-5 h-5 text-primary" />
								</div>
								<div className="flex-1">
									<h4 className="font-semibold text-gray-900 dark:text-white mb-1">{use.title}</h4>
									<p className="text-sm text-gray-600 dark:text-gray-400">{use.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)
		},
		{
			id: "data-storage",
			title: "Where We Store Your Data",
			icon: Database,
			content: (
				<div className="space-y-4">
					<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
						We use the following platforms and storage solutions for data collection and storage:
					</p>
					<div className="space-y-3">
						{[
							{ 
								title: "Google Sheets", 
								desc: "Newsletter subscriptions, membership forms, community registrations",
								location: "Google's secure servers (may be stored outside your country)",
								security: "Protected by Google's security infrastructure"
							},
							{ 
								title: "Email Services", 
								desc: "Contact form submissions sent to info@bizgrowthafrica.com",
								location: "Email server (hosted by cPanel/Syskay)",
								security: "Encrypted email transmission (TLS/SSL)"
							},
							{ 
								title: "Google Analytics", 
								desc: "Website usage data and analytics",
								location: "Google's servers",
								security: "Subject to Google's privacy policy"
							},
							{ 
								title: "Local Storage", 
								desc: "Theme preferences, user ID, watchlist, cookie consent",
								location: "Your browser (not transmitted to our servers)",
								security: "Stored locally in your browser"
							},
							{ 
								title: "Server Storage", 
								desc: "Website logs, technical data, encrypted backups",
								location: "Secure server infrastructure",
								security: "Encrypted in transit and at rest"
							}
						].map((storage, idx) => (
							<div key={idx} className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-white/5 dark:to-white/10 border border-gray-200 dark:border-white/10">
								<h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
									<Shield className="w-5 h-5 text-primary" />
									{storage.title}
								</h4>
								<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{storage.desc}</p>
								<div className="space-y-1 text-xs text-gray-500 dark:text-gray-500">
									<p><strong className="text-gray-700 dark:text-gray-300">Location:</strong> {storage.location}</p>
									<p><strong className="text-gray-700 dark:text-gray-300">Security:</strong> {storage.security}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)
		},
		{
			id: "cookies",
			title: "Cookies and Tracking Technologies",
			icon: Cookie,
			content: (
				<div className="space-y-4">
					<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
						We use cookies and similar tracking technologies to enhance your browsing experience and analyze website usage.
					</p>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
							<h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
								<Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
								Necessary Cookies
							</h4>
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Essential for website functionality</p>
							<ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
								<li>• Store theme preferences</li>
								<li>• Store form data</li>
								<li>• Store user ID</li>
								<li>• Cannot be disabled</li>
							</ul>
						</div>
						<div className="p-5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30">
							<h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
								<Cookie className="w-5 h-5 text-purple-600 dark:text-purple-400" />
								Analytics Cookies
							</h4>
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Requires your consent</p>
							<ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
								<li>• Google Analytics (_ga, _ga_*)</li>
								<li>• Duration: 1 year 1 month 4 days</li>
								<li>• Track usage and page views</li>
								<li>• Can be disabled via Cookie Banner</li>
							</ul>
						</div>
					</div>
					<div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
						<p className="text-sm text-gray-700 dark:text-gray-300">
							<strong className="text-gray-900 dark:text-white">Cookie Management:</strong> You can manage your cookie preferences through our Cookie Consent Banner (appears on homepage). Your preferences are saved and remembered for future visits.
						</p>
					</div>
				</div>
			)
		},
		{
			id: "your-rights",
			title: "Your Rights",
			icon: Shield,
			content: (
				<div className="space-y-4">
					<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
						Under the <strong className="text-gray-900 dark:text-white">Nigeria Data Protection Act, 2023 (NDPA)</strong>, the <strong className="text-gray-900 dark:text-white">General Data Protection Regulation (GDPR)</strong>, and other applicable data protection laws, you have the following rights:
					</p>
					<div className="grid gap-3 sm:grid-cols-2">
						{[
							"Right to Access",
							"Right to Rectification",
							"Right to Erasure",
							"Right to Restrict Processing",
							"Right to Data Portability",
							"Right to Object",
							"Right to Withdraw Consent",
							"Right to Lodge a Complaint"
						].map((right, idx) => (
							<div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
								<CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
								<span className="text-sm font-medium text-gray-900 dark:text-white">{right}</span>
							</div>
						))}
					</div>
					<div className="p-5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
						<h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
							<Mail className="w-5 h-5 text-primary" />
							How to Exercise Your Rights
						</h4>
						<p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
							To exercise any of these rights, please contact us at:
						</p>
						<p className="text-sm text-gray-700 dark:text-gray-300">
							<strong>Email:</strong> <a href="mailto:privacy@bizgrowthafrica.com" className="text-primary hover:underline">privacy@bizgrowthafrica.com</a>
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
							<strong>Subject Line:</strong> "Data Protection Request - [Your Request Type]"
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							We will respond to your request within <strong>30 days</strong> (or as required by applicable law).
						</p>
					</div>
				</div>
			)
		},
		{
			id: "security",
			title: "Security Measures",
			icon: Lock,
			content: (
				<div className="space-y-4">
					<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
						We take the security of your personal information seriously and have implemented comprehensive security measures to protect your data:
					</p>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="p-5 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30">
							<h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
								<Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
								Technical Safeguards
							</h4>
							<ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
									<span>Encryption in transit (HTTPS/SSL) and at rest</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
									<span>Limited access on a need-to-know basis</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
									<span>Multi-factor authentication</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
									<span>Secure, encrypted servers</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
									<span>Regular security updates</span>
								</li>
							</ul>
						</div>
						<div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
							<h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
								<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
								Organizational Safeguards
							</h4>
							<ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
									<span>Regular staff training on data protection</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
									<span>Data minimization practices</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
									<span>Privacy by design principles</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
									<span>Incident response procedures</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			)
		},
		{
			id: "contact",
			title: "Contact Us",
			icon: Mail,
			content: (
				<div className="space-y-4">
					<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
						If you have any questions, concerns, or requests regarding this Privacy Policy, your personal data, or our data practices, please contact us:
					</p>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="p-5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
							<h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
								<Mail className="w-5 h-5 text-primary" />
								Data Protection Officer
							</h4>
							<div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
								<p><strong>Email:</strong> <a href="mailto:privacy@bizgrowthafrica.com" className="text-primary hover:underline">privacy@bizgrowthafrica.com</a></p>
								<p><strong>Website:</strong> <a href="/contact" className="text-primary hover:underline">bizgrowthafrica.com/contact</a></p>
							</div>
						</div>
						<div className="p-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
							<h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
								<Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
								General Inquiries
							</h4>
							<div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
								<p><strong>Email:</strong> <a href="mailto:info@bizgrowthafrica.com" className="text-primary hover:underline">info@bizgrowthafrica.com</a></p>
								<p><strong>Website:</strong> <a href="/" className="text-primary hover:underline">bizgrowthafrica.com</a></p>
							</div>
						</div>
					</div>
					<div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
						<p className="text-sm text-gray-700 dark:text-gray-300">
							<strong className="text-gray-900 dark:text-white">Response Time:</strong> We aim to respond to all inquiries within <strong>5-7 business days</strong>.
						</p>
					</div>
				</div>
			)
		}
	];

	return (
		<div className="min-h-screen bg-white dark:bg-[#0B1220]">
			<SEO
				title="Privacy Policy — BizGrowth Africa"
				description="BizGrowth Africa Privacy Policy - Learn how we collect, use, and protect your personal information in compliance with NDPA, GDPR, and other data protection laws."
				canonicalPath="/privacy-policy"
			/>

			{/* Hero Section */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:via-transparent dark:to-primary/10"></div>
				<div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:py-24">
					<div className="text-center space-y-6">
						<div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 dark:bg-primary/20 mb-4">
							<Shield className="w-10 h-10 text-primary" />
						</div>
						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight">
							Privacy Policy
						</h1>
						<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
							Your privacy matters to us. Learn how we collect, use, and protect your personal information.
						</p>
						<div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
							<span className="flex items-center gap-2">
								<FileText className="w-4 h-4" />
								Last Updated: January 2026
							</span>
							<span className="flex items-center gap-2">
								<Globe className="w-4 h-4" />
								Compliant with NDPA, GDPR & Global Standards
							</span>
						</div>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<section className="relative">
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-white/5"></div>
				<div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
					{/* Table of Contents */}
					<div className="mb-12 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-white/5 dark:to-white/10 border border-gray-200 dark:border-white/10">
						<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
							<FileText className="w-5 h-5 text-primary" />
							Quick Navigation
						</h2>
						<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
							{sections.map((section) => {
								const Icon = section.icon;
								return (
									<a
										key={section.id}
										href={`#${section.id}`}
										className="flex items-center gap-2 p-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 hover:text-primary transition-all group"
									>
										<Icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
										<span className="group-hover:underline">{section.title}</span>
									</a>
								);
							})}
						</div>
					</div>

					{/* Policy Sections */}
					<div className="space-y-12">
						{sections.map((section) => {
							const Icon = section.icon;
							return (
								<div
									key={section.id}
									id={section.id}
									className="scroll-mt-24"
								>
									<div className="p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
										<div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
											<div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
												<Icon className="w-6 h-6 text-primary" />
											</div>
											<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
												{section.title}
											</h2>
										</div>
										<div className="prose prose-gray dark:prose-invert max-w-none">
											{section.content}
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{/* Additional Information */}
					<div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/20">
						<div className="flex items-start gap-4">
							<AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
							<div className="space-y-3">
								<h3 className="text-lg font-bold text-gray-900 dark:text-white">
									Consent and Agreement
								</h3>
								<p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
									By using our website, subscribing to our newsletter, joining our community, or providing us with your personal information, you acknowledge that you have read, understood, and agree to this Privacy Policy.
								</p>
								<p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
									If you do not agree with this policy, please do not use our website or provide us with your personal information.
								</p>
							</div>
						</div>
					</div>

					{/* Footer Note */}
					<div className="mt-8 text-center">
						<p className="text-xs text-gray-500 dark:text-gray-400">
							This Privacy Policy is effective as of January 2026 and was last updated on January 2026.
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
							This Privacy Policy complies with the Nigeria Data Protection Act, 2023 (NDPA), the General Data Protection Regulation (GDPR), and other applicable data protection laws across Africa and globally.
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}
