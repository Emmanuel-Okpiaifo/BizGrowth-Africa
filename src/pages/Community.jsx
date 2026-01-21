import { Facebook, X, Instagram, Send, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import SEO from "../components/SEO";
import MembershipForm from "../components/MembershipForm";

export default function Community() {
	const socialLinks = [
		{
			name: "Facebook",
			icon: Facebook,
			accentColor: "#1877F2",
			lightBg: "from-blue-500/5 to-blue-400/5",
			darkBg: "from-blue-950/20 to-blue-900/20",
			borderColor: "border-blue-200 dark:border-blue-800/40",
			url: "https://www.facebook.com/share/1ARErnneyb/?mibextid=wwXIfr",
			followers: "50.2K",
			description: "Stay connected with real-time updates and community announcements",
			benefits: ["Daily business insights", "Live event announcements", "Exclusive resource drops"]
		},
		{
			name: "Twitter/X",
			icon: X,
			accentColor: "#000000",
			lightBg: "from-gray-600/5 to-gray-500/5",
			darkBg: "from-gray-800/30 to-gray-900/30",
			borderColor: "border-gray-300 dark:border-gray-700",
			url: "https://x.com/BizGrowthAfrica",
			followers: "12.8K",
			description: "Fast-paced conversations on business trends and market insights",
			benefits: ["Real-time market updates", "Industry thought leadership", "Live Q&A sessions"]
		},
		{
			name: "Instagram",
			icon: Instagram,
			accentColor: "#E4405F",
			lightBg: "from-pink-500/5 to-rose-400/5",
			darkBg: "from-pink-950/20 to-rose-900/20",
			borderColor: "border-pink-200 dark:border-pink-800/40",
			url: "https://www.instagram.com/bizgrowth_africa?igsh=d3d0OWJuMHU3dms5&utm_source=qr",
			followers: "18.5K",
			description: "Inspiring success stories and behind-the-scenes community moments",
			benefits: ["Member success features", "Growth stories & case studies", "Community spotlights"]
		}
	];

	const communityLinks = [
		{
			name: "Telegram",
			icon: Send,
			accentColor: "#0088cc",
			lightBg: "from-sky-500/5 to-blue-400/5",
			darkBg: "from-sky-950/20 to-blue-900/20",
			borderColor: "border-sky-200 dark:border-sky-800/40",
			url: "https://t.me/+ZkVsvN0zrks2Y2I0",
			members: "8.3K+",
			description: "Instant messaging for real-time collaboration and direct networking",
			benefits: ["24/7 peer support channel", "Resource library access", "Direct member connections"]
		},
		{
			name: "WhatsApp Channel",
			icon: "whatsapp",
			accentColor: "#25D366",
			lightBg: "from-green-500/5 to-emerald-400/5",
			darkBg: "from-green-950/20 to-emerald-900/20",
			borderColor: "border-green-200 dark:border-green-800/40",
			url: "https://chat.whatsapp.com/DjFkc7i6xZiBa3Hm47Bssn",
			members: "5.1K+",
			description: "Intimate group conversations with exclusive partnerships and deals",
			benefits: ["Early opportunity alerts", "Group mentorship programs", "Exclusive partnerships"]
		},
		{
			name: "Facebook Community",
			icon: Facebook,
			accentColor: "#1877F2",
			lightBg: "from-blue-600/5 to-blue-500/5",
			darkBg: "from-blue-950/20 to-blue-900/20",
			borderColor: "border-blue-300 dark:border-blue-800/40",
			url: "https://web.facebook.com/share/g/19bzMiHKr6/",
			members: "3.2K+",
			description: "Structured community hub for discussions, events, and group initiatives",
			benefits: ["Organized group discussions", "Community-led initiatives", "Member spotlight events"]
		}
	];


	return (
		<div className="min-h-screen bg-white dark:bg-[#0B1220]">
			<SEO
				title="Join Our Community — BizGrowth Africa"
				description="Connect with thousands of entrepreneurs and business professionals. Join our growing community on social media and messaging platforms."
				canonicalPath="/community"
			/>

			{/* Hero Section */}
			<section className="relative overflow-hidden px-4 pt-8 pb-8 sm:pt-12 sm:pb-12 lg:pt-16 lg:pb-16">
				{/* Decorative Background */}
				<div className="absolute inset-0 -z-10 overflow-hidden">
					<div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl"></div>
					<div className="absolute bottom-20 left-10 w-72 h-72 bg-gradient-to-tr from-primary/8 to-transparent rounded-full blur-3xl"></div>
				</div>

				<div className="mx-auto max-w-5xl text-center">
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
						<Sparkles className="w-4 h-4 text-primary" />
						<span className="text-sm font-semibold text-primary">Join 100K+ Entrepreneurs</span>
					</div>

					<h1 className="pb-6 text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-0 leading-[1.18]">
						Where Entrepreneurs
						<span className="block pb-3 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
							Build & Thrive Together
						</span>
					</h1>

					<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
						Connect with Africa's most ambitious entrepreneurs. Access exclusive insights, find strategic partnerships, and accelerate your business growth in a community built for success.
					</p>

					<div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-12">
						<div className="rounded-xl bg-white dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700/50 px-6 py-4 shadow-sm">
							<div className="text-3xl sm:text-4xl font-bold text-primary mb-1">100K+</div>
							<div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active Members</div>
						</div>
						<div className="rounded-xl bg-white dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700/50 px-6 py-4 shadow-sm">
							<div className="text-3xl sm:text-4xl font-bold text-primary mb-1">7</div>
							<div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Connected Platforms</div>
						</div>
						<div className="rounded-xl bg-white dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700/50 px-6 py-4 shadow-sm">
							<div className="text-3xl sm:text-4xl font-bold text-primary mb-1">Daily</div>
							<div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active Discussions</div>
						</div>
					</div>

					<a
						href="#join-community"
						className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 font-semibold text-white transition hover:shadow-lg hover:scale-105 duration-300"
					>
						Explore Communities
						<ArrowRight className="w-5 h-5" />
					</a>
				</div>
			</section>

			{/* Membership Form Section */}
			<section className="mx-auto max-w-6xl px-4 py-8">
				<MembershipForm />
			</section>

			{/* Community Groups Section */}
			<section id="join-community" className="mx-auto max-w-6xl px-4 pt-8 pb-20">
				<div className="text-center mb-16">
					<h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">Join Community Groups</h2>
					<div className="w-16 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full mb-6"></div>
					<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
						Direct conversations, exclusive opportunities, and personalized support
					</p>
				</div>

				<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{communityLinks.map((link, idx) => {
						const Icon = link.icon;
						return (
							<a
								key={idx}
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								className="group relative rounded-2xl border transition-all duration-300 hover:shadow-2xl overflow-hidden"
								style={{
									borderColor: link.accentColor + "30"
								}}
							>
								{/* Background Gradient */}
								<div className={`absolute inset-0 bg-gradient-to-br ${link.lightBg} dark:${link.darkBg.split(" ")[0]} dark:${link.darkBg.split(" ")[1]}`}></div>

								{/* Accent Line */}
								<div
									className="absolute top-0 left-0 right-0 h-1 group-hover:h-1.5 transition-all"
									style={{ backgroundColor: link.accentColor }}
								></div>

								<div className="relative p-8">
									{/* Header */}
									<div className="flex items-start justify-between mb-6">
										<div className="flex items-center gap-3">
											<div
												className="p-3 rounded-lg transition-all"
												style={{ backgroundColor: link.accentColor + "15" }}
											>
												{Icon === "whatsapp" ? (
													<FontAwesomeIcon icon={faWhatsapp} className="h-6 w-6" style={{ color: link.accentColor }} />
												) : (
													<Icon className="w-6 h-6" style={{ color: link.accentColor }} />
												)}
											</div>
											<div>
												<h3 className="text-xl font-bold text-gray-900 dark:text-white">{link.name}</h3>
											</div>
										</div>
										<div className="text-right bg-white dark:bg-gray-800/50 backdrop-blur rounded-lg px-3 py-2">
											<div className="text-2xl font-bold" style={{ color: link.accentColor }}>
												{link.members}
											</div>
											<div className="text-xs text-gray-600 dark:text-gray-400">members</div>
										</div>
									</div>

									{/* Description */}
									<p className="text-gray-700 dark:text-gray-300 mb-5 font-medium">{link.description}</p>

									{/* Benefits */}
									<div className="space-y-2.5 mb-6">
										{link.benefits.map((benefit, i) => (
											<div key={i} className="flex items-center gap-2.5">
												<CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: link.accentColor }} />
												<span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
											</div>
										))}
									</div>

									{/* CTA */}
									<button className="w-full rounded-lg px-4 py-3 font-semibold transition-all duration-300" style={{
										backgroundColor: link.accentColor + "20",
										color: link.accentColor,
										border: `2px solid ${link.accentColor}30`
									}}>
										Join Group
									</button>
								</div>
							</a>
						);
					})}
				</div>
			</section>
		</div>
	);
}


