import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "../components/SEO";
import { opportunities } from "../data/opportunities.sample";
import { getOpportunityImage, buildOpportunityImageCandidates } from "../data/opportunities.images";
import { Calendar, MapPin, BadgeDollarSign, Tag, ArrowRight, Building2 } from "lucide-react";

function formatAmount(min, max, currency = "USD") {
	if ((min ?? 0) === 0 && (max ?? 0) === 0) return "Non‑dilutive / In‑kind";
	const fmt = (v) => (typeof v === "number" ? v.toLocaleString() : "");
	if (min && max && min !== max) return `${currency} ${fmt(min)}–${fmt(max)}`;
	const val = max || min || 0;
	return `${currency} ${fmt(val)}`;
}

export default function OpportunityDetail() {
	const { id } = useParams();
	const opp = opportunities.find((o) => o.id === id);

	if (!opp) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-16">
				<div className="rounded-2xl border bg-white p-12 text-center shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Opportunity not found</h1>
					<p className="mt-2 text-base text-gray-600 dark:text-gray-300">This opportunity may have expired or been removed.</p>
					<Link to="/opportunities" className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition hover:opacity-90">
						Back to Opportunities
					</Link>
				</div>
			</div>
		);
	}

	const more = opportunities.filter((o) => o.id !== opp.id).slice(0, 6);

	// Images
	const candidates = useMemo(() => {
		const arr = [getOpportunityImage(opp), ...buildOpportunityImageCandidates(opp)];
		return Array.from(new Set(arr.filter(Boolean)));
	}, [opp]);
	const [heroSrc, setHeroSrc] = useState(candidates[0]);
	useEffect(() => {
		setHeroSrc(candidates[0]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900">
			<SEO
				title={`${opp.title} — Opportunity | BizGrowth Africa`}
				description={`${opp.title} by ${opp.org} in ${opp.region || opp.country || 'Africa'}. ${opp.category || 'Business opportunity'} for African MSMEs. ${opp.summary ? opp.summary.substring(0, 100) + '...' : 'Apply now for grants, accelerators, or funding programs.'}`}
				type="website"
				canonicalPath={`/opportunities/${encodeURIComponent(opp.id)}`}
			/>

			{/* Main Content Area */}
			<section className="bg-white dark:bg-gray-900">
				<div className="mx-auto max-w-6xl px-4 py-12">
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
						{/* Main Content */}
						<div className="lg:col-span-2">
							{/* Featured Image with Category Badge */}
							<div className="relative mb-8 overflow-hidden rounded-2xl">
								<img
									src={heroSrc}
									alt={opp.title}
									className="w-full h-auto object-cover"
									loading="eager"
									fetchpriority="high"
									decoding="async"
									onError={(e) => {
										const i = candidates.indexOf(e.currentTarget.src);
										const next = candidates[i + 1] || candidates[0];
										if (next && next !== e.currentTarget.src) setHeroSrc(next);
									}}
								/>
								{opp.category ? (
									<div className="absolute left-4 top-4 sm:left-6 sm:top-6">
										<span className="rounded-full bg-primary/90 backdrop-blur-sm text-white px-4 py-2 text-sm font-semibold hover:bg-primary transition">
											{opp.category}
										</span>
									</div>
								) : null}
							</div>

							{/* Title and Meta */}
							<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 dark:text-white mb-6">
								{opp.title}
							</h1>

							{/* Meta Info */}
							<div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-600 dark:text-gray-400 pb-6 border-b border-gray-200 dark:border-gray-700">
								<div className="flex items-center gap-2">
									<span>By</span>
									<span className="font-semibold text-gray-900 dark:text-white">{opp.org}</span>
								</div>
								<div className="flex items-center gap-2">
									<span>📍</span>
									<span>{opp.region}{opp.country ? ` • ${opp.country}` : ""}</span>
								</div>
								<div className="flex items-center gap-2">
									<span>💰</span>
									<span className="font-semibold text-primary">{formatAmount(opp.amountMin, opp.amountMax, opp.currency)}</span>
								</div>
							</div>

							<article className="space-y-6 text-base leading-relaxed text-gray-800 dark:text-gray-200">
								{/* Apply Button */}
								<div className="flex items-center gap-3 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl border border-primary/30 dark:border-primary/40 p-6 shadow-md hover:shadow-lg transition-all">
									<a
										href={opp.link || "#"}
										target={opp.link ? "_blank" : "_self"}
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
									>
										Apply Now <ArrowRight size={18} />
									</a>
									<p className="text-sm text-gray-700 dark:text-gray-300">
										<strong>Deadline:</strong> {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "TBA"}
									</p>
								</div>

								{/* Full Description */}
								<div className="space-y-4">
									<p>
										This opportunity offers comprehensive support tailored to strengthen African MSMEs. Successful applicants gain access to capital, expert mentorship, and valuable market connections. The program is designed to accelerate business growth while building resilience and sustainability.
									</p>
									<p>
										Participants benefit from structured guidance on compliance, go-to-market strategies, and fundraising readiness. Real impact is measured through revenue growth, job creation, and improved operational resilience.
									</p>
								</div>

								{/* Key Details as Blockquote */}
								<figure className="my-8 border-l-4 border-primary pl-6 py-4 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg shadow-sm">
									<blockquote className="text-lg font-semibold text-gray-900 dark:text-white">
										"Strong programs combine capital, mentorship, and market access. Success is measured by sustainable growth and resilience."
									</blockquote>
								</figure>

								<div className="space-y-4">
									<p>
										Eligibility spans early to growth-stage MSMEs with demonstrated traction. Priority is given to businesses showing innovation, inclusivity, climate-smart solutions, and participation in localized value chains.
									</p>
									<p>
										The application process is straightforward and transparent. We're committed to supporting ambitious entrepreneurs who want to scale their impact across Africa.
									</p>
								</div>

								{/* Tags */}
								{Array.isArray(opp.tags) && opp.tags.length ? (
									<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
										<div className="flex flex-wrap gap-2">
											<span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tags:</span>
											{opp.tags.map((tag) => (
												<a key={tag} href="#" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 rounded-full transition dark:bg-primary/20 dark:text-primary">
													#{tag.split(" ")[0]}
												</a>
											))}
										</div>
									</div>
								) : null}

								{/* Share & Navigation */}
								<div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800">
									{/* Share Section */}
									<div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 shadow-md hover:shadow-lg transition-all">
										<p className="mb-3 font-semibold text-gray-900 dark:text-white">Share this opportunity:</p>
										<div className="flex flex-wrap gap-2">
											<a
												className="inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
												href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`}
												target="_blank" rel="noreferrer"
												title="Share on Facebook"
											>
												<svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
											</a>
											<a
												className="inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
												href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(opp.title)}`}
												target="_blank" rel="noreferrer"
												title="Share on Twitter"
											>
												<svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 002.856-3.51 10.02 10.02 0 01-2.856.973 5.025 5.025 0 00-8.763-4.565c-2.487.37-4.805 2.366-5.25 4.823a10.05 10.05 0 01-7.26-3.62 5.023 5.023 0 001.556 6.7A4.97 4.97 0 01.96 6.29v.06a5.025 5.025 0 004.03 4.92 5.02 5.02 0 01-2.27.088 5.025 5.025 0 004.695 3.488 10.09 10.09 0 01-6.252 2.16c-.39 0-.779-.023-1.17-.067a14.005 14.005 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
											</a>
											<a
												className="inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
												href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(location.href)}`}
												target="_blank" rel="noreferrer"
												title="Share on LinkedIn"
											>
												<svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
											</a>
											<button
												type="button"
												onClick={() => navigator.clipboard?.writeText(location.href)}
												className="inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
												title="Copy link"
											>
												<svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
											</button>
										</div>
									</div>

									{/* Organization Info */}
									<div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 dark:border-primary/40 p-6 shadow-md hover:shadow-lg transition-all">
										<div className="flex gap-4">
											<div className="h-16 w-16 flex-none rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
												<Building2 className="text-white" size={24} />
											</div>
											<div>
												<h3 className="font-bold text-gray-900 dark:text-white">{opp.org}</h3>
												<p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Organization</p>
												<p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
													Dedicated to supporting and scaling businesses across Africa through capital, mentorship, and market access.
												</p>
											</div>
										</div>
									</div>
								</div>
							</article>
						</div>

						{/* Sidebar */}
						<aside className="lg:col-span-1 space-y-6">
							{/* Key Info Card */}
							<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 shadow-md hover:shadow-lg transition-all">
								<h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Key Information</h3>
								<div className="space-y-4">
									<div className="flex items-start gap-3">
										<BadgeDollarSign size={20} className="text-primary flex-none mt-0.5" />
										<div>
											<div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Funding Amount</div>
											<div className="mt-1 font-bold text-gray-900 dark:text-white">{formatAmount(opp.amountMin, opp.amountMax, opp.currency)}</div>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<Calendar size={20} className="text-primary flex-none mt-0.5" />
										<div>
											<div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Deadline</div>
											<div className="mt-1 font-bold text-gray-900 dark:text-white">{opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "TBA"}</div>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<MapPin size={20} className="text-primary flex-none mt-0.5" />
										<div>
											<div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Location</div>
											<div className="mt-1 font-bold text-gray-900 dark:text-white">{opp.region}{opp.country ? ` • ${opp.country}` : ""}</div>
										</div>
									</div>
									{opp.category && (
										<div className="flex items-start gap-3">
											<Tag size={20} className="text-primary flex-none mt-0.5" />
											<div>
												<div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Category</div>
												<div className="mt-1 font-bold text-gray-900 dark:text-white">{opp.category}</div>
											</div>
										</div>
									)}
								</div>
								<a
									href={opp.link || "#"}
									target={opp.link ? "_blank" : "_self"}
									rel="noopener noreferrer"
									className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
								>
									Apply Now <ArrowRight size={16} />
								</a>
							</div>

							{/* Similar Opportunities */}
							{more.length > 0 && (
								<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 shadow-md hover:shadow-lg transition-all">
									<h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Similar Opportunities</h3>
									<div className="space-y-3">
										{more.slice(0, 4).map((m) => {
											const img = getOpportunityImage(m);
											return (
												<Link key={m.id} to={`/opportunities/${encodeURIComponent(m.id)}`} className="group block">
													<div className="mb-2 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 aspect-video">
														<img 
															src={img}
															alt={m.title}
															className="h-full w-full object-cover group-hover:scale-105 transition"
															onError={(e) => {
																if (e.currentTarget.src !== `https://source.unsplash.com/1600x900/?africa,business&sig=${m.id}`) {
																	e.currentTarget.src = `https://source.unsplash.com/1600x900/?africa,business&sig=${m.id}`;
																}
															}}
														/>
													</div>
													<p className="text-xs font-semibold text-primary mb-1">{m.category}</p>
													<h4 className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-primary transition line-clamp-2">
														{m.title}
													</h4>
												</Link>
											);
										})}
									</div>
								</div>
							)}
						</aside>
					</div>
				</div>
			</section>
		</div>
	);
}
