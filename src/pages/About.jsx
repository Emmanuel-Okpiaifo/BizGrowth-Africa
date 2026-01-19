import { FileText, DollarSign, Newspaper, Briefcase, Users, GraduationCap, Sparkles } from "lucide-react";
import SEO from "../components/SEO";

export default function About() {
	const services = [
		{
			title: "Procurement & Tender Insights",
			icon: FileText,
			description: "We deliver structured, verified procurement information to help MSMEs access contracts across public and private sectors. Our tender data enables businesses to identify relevant opportunities, strengthen compliance, and maximise outcomes in contract bids.",
			gradient: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
			iconColor: "text-blue-600 dark:text-blue-400",
			bgColor: "bg-blue-600",
			bgColorDark: "dark:bg-blue-500",
			connectorColor: "from-blue-600/40"
		},
		{
			title: "Grants & Funding Opportunity Insights",
			icon: DollarSign,
			description: "We provide a curated stream of grants, fellowships, accelerators, and funding programs, presented in a clear and actionable format. This supports entrepreneurs in identifying suitable financing avenues and improving their likelihood of securing support.",
			gradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
			iconColor: "text-emerald-600 dark:text-emerald-400",
			bgColor: "bg-emerald-600",
			bgColorDark: "dark:bg-emerald-500",
			connectorColor: "from-emerald-600/40"
		},
		{
			title: "Business News & Market Intelligence",
			icon: Newspaper,
			description: "We offer timely updates on policies, regulatory changes, economic trends, and sector developments. Our insights equip MSMEs with the context required to make informed strategic decisions and effectively respond to evolving market conditions.",
			gradient: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
			iconColor: "text-amber-600 dark:text-amber-400",
			bgColor: "bg-amber-600",
			bgColorDark: "dark:bg-amber-500",
			connectorColor: "from-amber-600/40"
		},
		{
			title: "Tools, Templates & Business Resources",
			icon: Briefcase,
			description: "We supply practical tools, templates, and guides designed to improve operational efficiency, strengthen internal systems, and support daily business management processes.",
			gradient: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
			iconColor: "text-purple-600 dark:text-purple-400",
			bgColor: "bg-purple-600",
			bgColorDark: "dark:bg-purple-500",
			connectorColor: "from-purple-600/40"
		},
		{
			title: "Entrepreneur Community & Knowledge Exchange",
			icon: Users,
			description: "We facilitate an active community of entrepreneurs who engage in discussions, peer learning, and shared problem-solving. Our platforms promote continuous learning, collaboration, and access to relevant expertise.",
			gradient: "from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30",
			iconColor: "text-indigo-600 dark:text-indigo-400",
			bgColor: "bg-indigo-600",
			bgColorDark: "dark:bg-indigo-500",
			connectorColor: "from-indigo-600/40"
		},
		{
			title: "Training & Capacity Support",
			icon: GraduationCap,
			description: "We provide targeted capacity-building content and practical learning resources that help MSMEs improve their procurement readiness, strengthen operations, and achieve sustainable business growth.",
			gradient: "from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30",
			iconColor: "text-rose-600 dark:text-rose-400",
			bgColor: "bg-rose-600",
			bgColorDark: "dark:bg-rose-500",
			connectorColor: "from-rose-600/40"
		}
	];

	return (
		<div className="min-h-screen bg-white dark:bg-[#0B1220]">
			<SEO
				title="About Us — BizGrowth Africa"
				description="BizGrowth Africa is a business intelligence platform designed to give African MSMEs access to timely, verified, and actionable information."
				canonicalPath="/about"
			/>

			{/* Hero Section */}
			<section className="relative overflow-hidden px-4 pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
				{/* Decorative Background */}
				<div className="absolute inset-0 -z-10 overflow-hidden">
					<div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl"></div>
					<div className="absolute bottom-20 left-10 w-72 h-72 bg-gradient-to-tr from-primary/8 to-transparent rounded-full blur-3xl"></div>
				</div>

				<div className="mx-auto max-w-4xl">
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
						<Sparkles className="w-4 h-4 text-primary" />
						<span className="text-sm font-semibold text-primary">About BizGrowth Africa</span>
					</div>

					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
						Empowering African MSMEs with{" "}
						<span className="inline text-red-600 dark:text-red-400">
							Intelligence
						</span>
						<span className="block lg:inline lg:ml-1 text-red-600 dark:text-red-400">
							& Opportunity
						</span>
					</h1>

					<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
						BizGrowth Africa is a business intelligence platform designed to give African MSMEs access to timely, verified, and actionable information. We provide entrepreneurs with curated business news & insights, tenders, grants, market updates, and practical business resources that support informed decision-making and sustainable growth.
					</p>
				</div>
			</section>

			{/* Dividing Line */}
			<div className="w-full border-t border-black dark:border-white"></div>

			{/* Our Services Section */}
			<section className="mx-auto max-w-4xl px-4 pt-12 pb-20 lg:pt-16">
				<div className="text-center mb-16">
					<h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">Our Services</h2>
					<div className="w-16 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full mb-6"></div>
					<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
						Comprehensive support for African entrepreneurs at every stage of their growth journey
					</p>
				</div>

				<div className="relative">
					{/* Vertical Timeline Line */}
					<div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/60 to-primary/30"></div>

					<div className="space-y-12">
						{services.map((service, idx) => {
							const Icon = service.icon;
							
							return (
								<div key={idx} className="relative flex gap-8 items-start">
									{/* Milestone Marker */}
									<div className="relative z-10 flex-shrink-0">
										<div className={`w-16 h-16 rounded-full ${service.bgColor} ${service.bgColorDark} flex items-center justify-center shadow-lg border-4 border-white dark:border-[#0B1220]`}>
											<Icon className="w-7 h-7 text-white" />
										</div>
										{idx < services.length - 1 && (
											<div className={`absolute left-1/2 top-16 -translate-x-1/2 w-0.5 h-12 bg-gradient-to-b ${service.connectorColor} to-transparent`}></div>
										)}
									</div>

									{/* Content */}
									<div className="flex-1 pt-2">
										<h3 className={`text-2xl sm:text-3xl font-bold ${service.iconColor} mb-4`}>
											{service.title}
										</h3>
										<p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
											{service.description}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>
		</div>
	);
}
