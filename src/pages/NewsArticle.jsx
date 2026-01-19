import { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Link as LinkIcon, Send } from "lucide-react";
import NewsCard from "../components/NewsCard";
import NewsletterCTA from "../components/NewsletterCTA";
import { allOriginalArticles } from "../data/originals.index";
import SEO from "../components/SEO";
import { SITE_URL } from "../config/site";

function formatDate(iso) {
	try {
		return new Date(iso).toLocaleDateString(undefined, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	} catch {
		return "";
	}
}

export default function NewsArticle() {
	const { slug } = useParams();

	// Always scroll to top when opening or switching articles
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [slug]);

	const article = useMemo(
		() => allOriginalArticles.find((a) => a.slug === slug),
		[slug]
	);

	const related = useMemo(() => {
		if (!article) return [];
		const sameCategory = allOriginalArticles.filter(
			(a) => a.slug !== article.slug && a.category === article.category
		);
		const others = allOriginalArticles.filter(
			(a) => a.slug !== article.slug && a.category !== article.category
		);
		const picks = [...sameCategory, ...others].slice(0, 6);
		// Map to shape expected by NewsCard while linking internally
		return picks.map((a) => ({
			title: a.title,
			source: "BizGrowth Africa",
			image: a.canonicalImage || a.image,
			imageCandidates: a.imageCandidates,
			category: a.category,
			publishedAt: a.publishedAt,
			url: `/news/${a.slug}`,
		}));
	}, [article]);

	if (!article) {
		return (
			<div className="mx-auto max-w-5xl px-4 py-16">
				<div className="rounded-2xl border bg-white p-12 text-center shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Article not found</h1>
					<p className="mt-2 text-base text-gray-600 dark:text-gray-300">
						The story you're looking for doesn't exist or has moved.
					</p>
					<Link
						to="/news-insights"
						className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
					>
						Go to News & Insights
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900">
			<SEO
				title={`${article.title} — BizGrowth Africa`}
				description={article.subheading || article.summary || ""}
				type="article"
				image={(article.imageCandidates && article.imageCandidates[0]) || article.image}
				canonicalPath={`/news/${article.slug}`}
				publishedTime={article.publishedAt}
				jsonLd={{
					"@context": "https://schema.org",
					"@type": "NewsArticle",
					headline: article.title,
					description: article.subheading || article.summary || "",
					datePublished: article.publishedAt,
					dateModified: article.publishedAt,
					author: {
						"@type": "Organization",
						name: "BizGrowth Africa"
					},
					publisher: {
						"@type": "Organization",
						name: "BizGrowth Africa",
						logo: {
							"@type": "ImageObject",
							url: `${SITE_URL}/vite.svg`
						}
					},
					image: [(article.imageCandidates && article.imageCandidates[0]) || article.image],
					mainEntityOfPage: {
						"@type": "WebPage",
						"@id": `${SITE_URL}/news/${article.slug}`
					}
				}}
			/>

{/* Hero Banner with Overlay */}
		<Detail3Hero article={article} />

			{/* Main Content Area */}
			<section className="bg-white dark:bg-gray-900">
				<div className="mx-auto max-w-6xl px-4 py-12">
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
						{/* Main Article */}
						<div className="lg:col-span-2">
							<article className="space-y-6 text-base leading-relaxed text-gray-800 dark:text-gray-200">
								{/* Article Body */}
								{Array.isArray(article.richBody) && article.richBody.length
									? article.richBody.map((para, idx) => (
											<p key={idx} className="transition">
												{Array.isArray(para)
													? para.map((span, i) =>
															span.href ? (
																<a key={i} href={span.href} target="_blank" rel="noreferrer" className="text-primary hover:opacity-90 font-medium">
																	{span.text}
																</a>
															) : (
																<span key={i}>{span.text}</span>
															)
													  )
													: typeof para === "string"
													? para
													: null}
											</p>
									  ))
									: (article.body || []).map((para, idx) => (
											<p key={idx} className="transition">
												{para}
											</p>
									  ))}

								{/* Pull Quote */}
								{article.pullQuote ? (
								<figure className="my-8 border-l-4 border-primary pl-6 py-4 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg shadow-sm">
										<blockquote className="text-lg font-semibold text-gray-900 dark:text-white">"{article.pullQuote}"</blockquote>
									</figure>
								) : null}
							</article>

							{/* Tags */}
							<div className="mt-8 flex flex-wrap gap-2">
								<span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tags:</span>
								{(article.keyTakeaways || []).slice(0, 5).map((tag, idx) => (
									<a key={idx} href="#" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 rounded-full transition">
										#{tag.split(" ")[0]}
									</a>
								))}
							</div>

							{/* Share & Post Navigation */}
							<div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800">
								{/* Share Section */}
							<div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 shadow-md hover:shadow-lg transition-all">
									<p className="mb-3 font-semibold text-gray-900 dark:text-white">Share this article:</p>
									<div className="flex flex-wrap gap-2">
										<a
											className="inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
											href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`}
											target="_blank" rel="noreferrer"
											title="Share on Facebook"
										>
											<Facebook size={18} className="text-blue-600" />
										</a>
										<a
											className="inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
											href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(article.title)}`}
											target="_blank" rel="noreferrer"
											title="Share on Twitter"
										>
											<Twitter size={18} className="text-blue-400" />
										</a>
										<a
											className="inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
											href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(location.href)}`}
											target="_blank" rel="noreferrer"
											title="Share on LinkedIn"
										>
											<Linkedin size={18} className="text-blue-700" />
										</a>
										<button
											type="button"
											onClick={() => navigator.clipboard?.writeText(location.href)}
											className="inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
											title="Copy link"
										>
											<LinkIcon size={18} className="text-gray-600 dark:text-gray-400" />
										</button>
									</div>
								</div>

								{/* Previous/Next Article Navigation */}
								<div className="grid grid-cols-2 gap-4">
									{related[0] && (
										<Link to={related[0].url} className="group">
											<div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">← Previous article</div>
											<h4 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-primary transition line-clamp-2">
												{related[0].title}
											</h4>
										</Link>
									)}
									{related[1] && (
										<Link to={related[1].url} className="group text-right">
											<div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Next article →</div>
											<h4 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-primary transition line-clamp-2">
												{related[1].title}
											</h4>
										</Link>
									)}
								</div>
							</div>

							{/* Author Info */}
						<div className="mt-10 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 dark:border-primary/40 p-6 shadow-md hover:shadow-lg transition-all">
							<div className="flex gap-4">
								<div className="h-16 w-16 flex-none rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
									<span className="text-2xl font-bold text-white">BA</span>
									</div>
									<div>
										<h3 className="font-bold text-gray-900 dark:text-white">BizGrowth Africa Editorial</h3>
										<p className="text-xs text-gray-600 dark:text-gray-400 mt-1">By Admin</p>
										<p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
											Independent analysis and reporting focused on African MSMEs, markets, and business growth opportunities.
										</p>
									</div>
								</div>
							</div>

							{/* Why it Matters Section */}
							<div className="mt-10 rounded-lg border-l-4 border-primary bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
								<h3 className="text-lg font-bold text-primary uppercase tracking-wide">Why it matters for African MSMEs</h3>
								<p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">
									{article.whyItMatters || "Understanding these market dynamics helps African businesses make informed decisions about growth, expansion, and adaptation to changing economic conditions."}
								</p>
							</div>

							{/* Key Takeaways */}
							<div className="mt-10">
								<h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-6">Key Takeaways</h3>
								<div className="grid gap-4 sm:grid-cols-2">
									{(article.keyTakeaways || []).map((point, idx) => (
										<div key={idx} className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 p-4">
											<div className="flex gap-3">
												<div className="flex-none text-primary font-bold text-lg">✓</div>
												<p className="text-sm text-gray-700 dark:text-gray-300">{point}</p>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Tags */}
							<div className="mt-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 shadow-md hover:shadow-lg transition-all">
								<h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Tags</h3>
								<div className="flex flex-wrap gap-2">
									{["Business", "Markets", "Growth", "Africa", "MSME", "Trade", "Innovation", "Strategy"].map((tag) => (
										<a key={tag} href="#" className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white dark:hover:bg-primary text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full transition">
											{tag}
										</a>
									))}
								</div>
							</div>
						</div>

						{/* Sidebar */}
					<aside className="lg:col-span-1 space-y-6">
							{/* Newsletter CTA */}
					<div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary to-primary/80 p-5 text-white shadow-lg hover:shadow-xl transition-all">
							<h3 className="font-bold mb-2 text-lg">Subscribe to Newsletter</h3>
							<p className="text-sm mb-4 text-white/90 leading-relaxed">Get the latest insights on African business growth and opportunities</p>
								<form className="flex gap-2">
									<input
										type="email"
										placeholder="Your email"
										className="flex-1 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-500"
									/>
									<button type="submit" className="rounded-lg bg-white/20 hover:bg-white/30 px-2 py-2 transition">
										<Send size={16} />
									</button>
								</form>
							</div>

							{/* Recent News */}
					<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 shadow-md hover:shadow-lg transition-all">
						<h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Recent News</h3>
							<div className="space-y-4">
								{related.slice(0, 4).map((article, idx) => {
									// Get the best available image with fallbacks
									const imageUrl = article.image || 
										(Array.isArray(article.imageCandidates) && article.imageCandidates[0]) ||
										`https://source.unsplash.com/1600x900/?africa,business&sig=${idx}`;
									
									return (
										<Link key={idx} to={article.url} className="group block">
											<div className="mb-2 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 aspect-video">
												<img 
													src={imageUrl}
													alt={article.title}
													className="h-full w-full object-cover group-hover:scale-105 transition"
													onError={(e) => {
														// If image fails, use unsplash fallback
														if (e.currentTarget.src !== `https://source.unsplash.com/1600x900/?africa,business&sig=${idx}`) {
															e.currentTarget.src = `https://source.unsplash.com/1600x900/?africa,business&sig=${idx}`;
														}
													}}
												/>
											</div>
											<p className="text-xs font-semibold text-primary mb-1">{article.category}</p>
											<h4 className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-primary transition line-clamp-2">
												{article.title}
											</h4>
										</Link>
									);
								})}
							</div>
						</div>

						</aside>
					</div>
				</div>
			</section>

			{/* Related Articles */}
			{related.length > 0 && (
				<section className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
					<div className="mx-auto max-w-6xl px-4 py-12">
						<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">More from News & Insights</h3>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{related.slice(2).map((article) => (
								<NewsCard key={article.url} article={article} />
							))}
						</div>
					</div>
				</section>
			)}

			{/* Newsletter CTA */}
			<section className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
				<NewsletterCTA />
			</section>
		</div>
	);
}

function Detail3Hero({ article }) {
	const candidates = Array.isArray(article.imageCandidates) && article.imageCandidates.length
		? article.imageCandidates
		: [article.image];
	const [src, setSrc] = useState(candidates[0]);
	useEffect(() => {
		setSrc(candidates[0]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [article.slug]);
	return (
			<section className="relative overflow-hidden bg-black w-screen -ml-[calc((100vw-100%)/2)] -mt-[39px]">
				<div className="relative aspect-[4/5] sm:aspect-[3/2] lg:aspect-[2.5/1] w-full">
				<img
					src={src}
					alt={article.title}
					className="absolute inset-0 h-full w-full object-cover"
					loading="eager"
					fetchpriority="high"
					decoding="async"
					onError={(e) => {
						const idx = candidates.findIndex((u) => u === e.currentTarget.src);
						const next = candidates[idx + 1];
						setSrc(next || candidates[0]);
					}}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
				
				{/* Content */}
				<div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
					{/* Breadcrumbs at top */}
					<nav className="flex items-center gap-2 text-xs sm:text-sm">
						<Link to="/" className="text-white hover:opacity-75 drop-shadow">Home</Link>
						<span className="text-white/60">/</span>
						<Link to="/news-insights" className="text-white hover:opacity-75 drop-shadow">News & Insights</Link>
						<span className="text-white/60">/</span>
						<span className="text-white/80 drop-shadow">{article.category}</span>
					</nav>

					{/* Content at bottom */}
					<div className="mx-auto max-w-6xl w-full px-4 lg:px-8">
						{article.category ? (
							<div className="mb-4">
								<span className="rounded-full bg-primary/90 backdrop-blur-sm text-white px-4 py-1.5 text-sm font-semibold hover:bg-primary transition">
									{article.category}
								</span>
							</div>
						) : null}
						<h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white max-w-4xl drop-shadow-lg">
							{article.title}
						</h1>
						<div className="mt-6 flex flex-wrap items-center gap-4 text-white/95 text-sm sm:text-base">
							<div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
								<div className="h-8 w-8 rounded-full bg-primary" />
								<div>
									<p className="font-semibold">BizGrowth Africa</p>
									<p className="text-xs text-white/70">{formatDate(article.publishedAt)}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}


