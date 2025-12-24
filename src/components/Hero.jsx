export default function Hero() {
	return (
		<section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-white to-primary/5 dark:via-[#0B1220]">
			<div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
			<div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
			<div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
				<div className="max-w-3xl">
					<h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
						Intelligence for African MSMEs
					</h1>
					<p className="mt-3 max-w-2xl text-base text-gray-700 dark:text-gray-300 sm:text-lg">
						Stay ahead with curated business news, funding opportunities, tenders, tools, and insights to grow across Africa.
					</p>
					<div className="mt-6 flex flex-wrap gap-3">
						<a
							href="/opportunities"
							className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
						>
							Explore Opportunities
						</a>
						<a
							href="/news-insights"
							className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-white dark:hover:bg-gray-800"
						>
							Read News & Insights
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}


