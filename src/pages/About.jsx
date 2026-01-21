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
			<section className="relative overflow-hidden">
				{/* Left Side - Content */}
				<div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:py-24">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						{/* Text Content */}
						<div className="space-y-6 lg:pr-8">
							<h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight">
								Empowering{" "}
								<span className="text-gray-700 dark:text-gray-300">African</span>{" "}
								<span className="text-primary">MSMEs</span>
								<br />
								with{" "}
								<span className="text-gray-700 dark:text-gray-300">Intelligence</span>{" "}
								& <span className="text-primary">Opportunity</span>
							</h1>

							<div className="pt-4 space-y-3">
								<p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
									Your trusted source for business intelligence, funding opportunities, and growth resources across Africa.
								</p>
							</div>
						</div>

						{/* Right Side - Visual Elements */}
						<div className="relative lg:pl-8">
							<div className="relative">
								{/* Grid Pattern Background */}
								<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-50"></div>
								
								{/* Floating Cards */}
								<div className="relative space-y-6">
									<div className="relative bg-white dark:bg-[#0B1220] border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
										<div className="flex items-center gap-3 mb-3">
											<div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
												<Briefcase className="w-6 h-6 text-primary" />
											</div>
											<div>
												<div className="text-2xl font-bold text-gray-900 dark:text-white">1000+</div>
												<div className="text-sm text-gray-600 dark:text-gray-400">Opportunities</div>
											</div>
										</div>
									</div>

									<div className="relative bg-white dark:bg-[#0B1220] border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl transform -rotate-1 hover:rotate-0 transition-transform duration-300 ml-auto" style={{width: '90%'}}>
										<div className="flex items-center gap-3 mb-3">
											<div className="w-12 h-12 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
												<Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
											</div>
											<div>
												<div className="text-2xl font-bold text-gray-900 dark:text-white">50K+</div>
												<div className="text-sm text-gray-600 dark:text-gray-400">MSMEs Served</div>
											</div>
										</div>
									</div>

									<div className="relative bg-white dark:bg-[#0B1220] border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
										<div className="flex items-center gap-3 mb-3">
											<div className="w-12 h-12 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
												<Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
											</div>
											<div>
												<div className="text-2xl font-bold text-gray-900 dark:text-white">24/7</div>
												<div className="text-sm text-gray-600 dark:text-gray-400">Updated Content</div>
											</div>
										</div>
									</div>
								</div>

								{/* Decorative Elements */}
								<div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 dark:bg-primary/20 rounded-full blur-2xl"></div>
								<div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"></div>
							</div>
						</div>
					</div>
				</div>

			</section>

			{/* Dividing Line */}
			<div className="relative w-full py-8">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
				</div>
				<div className="relative flex justify-center">
					<div className="bg-white dark:bg-[#0B1220] px-6">
						<div className="flex items-center gap-2">
							<div className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-600"></div>
							<div className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-600"></div>
							<div className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-600"></div>
						</div>
					</div>
				</div>
			</div>

			{/* Our Services Section */}
			<section className="mx-auto max-w-7xl px-4 pt-12 pb-20 lg:pt-16">
				<div className="text-center mb-16">
					<h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">Our Services</h2>
					<div className="w-16 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full mb-6"></div>
					<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
						Comprehensive support for African entrepreneurs at every stage of their growth journey
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{services.map((service, idx) => {
						const Icon = service.icon;
						
						return (
							<div 
								key={idx} 
								className={`group relative bg-white dark:bg-[#0B1220] border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${service.gradient}`}
							>
								{/* Icon */}
								<div className={`mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl ${service.bgColor} ${service.bgColorDark} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
									<Icon className="w-7 h-7 text-white" />
								</div>

								{/* Content */}
								<h3 className={`text-xl font-bold ${service.iconColor} mb-3 group-hover:translate-x-1 transition-transform duration-300`}>
									{service.title}
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
									{service.description}
								</p>

								{/* Hover Effect Gradient */}
								<div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}></div>
							</div>
						);
					})}
				</div>
			</section>
		</div>
	);
}
