import { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
		const picks = [...sameCategory, ...others].slice(0, 3);
		// Map to shape expected by NewsCard while linking internally
		return picks.map((a) => ({
			title: a.title,
			source: "BizGrowth Africa",
			image: a.canonicalImage || a.image,
			imageCandidates: a.imageCandidates,
			url: `/news/${a.slug}`,
			publishedAt: a.publishedAt,
			summary: a.summary || a.subheading,
			category: a.category,
		}));
	}, [article]);

	if (!article) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-10">
				<div className="rounded-2xl border bg-white p-8 text-center shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Article not found</h1>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
						The story you’re looking for doesn’t exist or has moved.
					</p>
					<Link
						to="/news-insights"
						className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
					>
						Go to News & Insights
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
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
			{/* Meta breadcrumbs-lite */}
			<nav className="mb-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
				<Link to="/" className="hover:text-primary">Home</Link>
				<span>/</span>
				<Link to="/news-insights" className="hover:text-primary">News & Insights</Link>
				<span>/</span>
				<span className="text-gray-700 dark:text-gray-300">{article.category}</span>
			</nav>

			{/* Headline */}
			<h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl dark:text-white">
				{article.title}
			</h1>
			{article.subheading ? (
				<p className="mt-3 text-lg text-gray-700 dark:text-gray-300">{article.subheading}</p>
			) : null}

			{/* Metadata */}
			<div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
				<span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
					{article.category}
				</span>
				{article.country ? (
					<span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
						{article.country}{article.region ? ` • ${article.region}` : ""}
					</span>
				) : null}
				<span className="text-gray-500 dark:text-gray-400">{formatDate(article.publishedAt)}</span>
				<span className="ml-auto text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
					BizGrowth Africa Original
				</span>
			</div>

			{/* Hero image */}
			{article.image ? (
				<div className="mt-6 overflow-hidden rounded-2xl">
					<ArticleHeroImage key={article.slug} article={article} />
				</div>
			) : null}

			{/* Article body (rich with inline citations) */}
			<article className="mt-8 space-y-6 text-[17px] leading-relaxed text-gray-800 dark:text-gray-200">
				{Array.isArray(article.richBody) && article.richBody.length
					? article.richBody.map((para, idx) => (
							<p
								key={idx}
								className={[
									"transition",
									idx === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:text-5xl first-letter:font-extrabold first-letter:leading-none first-letter:text-gray-900 dark:first-letter:text-white" : "",
								].join(" ")}
							>
								{Array.isArray(para)
									? para.map((span, i) =>
											span.href ? (
												<a key={i} href={span.href} target="_blank" rel="noreferrer" className="text-primary hover:opacity-90">
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

				{/* Pull quote if provided */}
				{article.pullQuote ? (
					<figure className="my-6 border-l-4 border-primary pl-4">
						<blockquote className="text-xl font-semibold text-gray-900 dark:text-white">“{article.pullQuote}”</blockquote>
					</figure>
				) : null}
			</article>

			{/* Why it matters */}
			<section className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-primary/20 dark:border-gray-800 dark:bg-[#0B1220]">
				<div className="border-l-4 border-primary px-5 py-5 sm:px-6">
					<h3 className="text-base font-extrabold uppercase tracking-wide text-primary">
						Why it matters for African MSMEs
					</h3>
					<p className="mt-2 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
						{article.whyItMatters}
					</p>
				</div>
			</section>

			{/* Key takeaways */}
			<section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
				<h3 className="text-base font-extrabold uppercase tracking-wide text-gray-900 dark:text-white">
					Key takeaways
				</h3>
				<ul className="mt-3 list-inside list-disc space-y-2 text-[15px] text-gray-800 dark:text-gray-200">
					{(article.keyTakeaways || []).map((point, idx) => (
						<li key={idx}>{point}</li>
					))}
				</ul>
			</section>

			{/* By the numbers (optional) */}
			{Array.isArray(article.byTheNumbers) && article.byTheNumbers.length ? (
				<section className="mt-6">
					<h3 className="text-base font-extrabold uppercase tracking-wide text-gray-900 dark:text-white">
						By the numbers
					</h3>
					<div className="mt-3 grid gap-3 sm:grid-cols-2">
						{article.byTheNumbers.map((item, i) => (
							<div
								key={i}
								className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:ring-primary/30 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800"
							>
								<div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
									{item.label}
								</div>
								<div className="mt-1 flex items-baseline gap-1">
									<div className="text-2xl font-extrabold text-gray-900 dark:text-white">
										{item.value}
									</div>
									{item.unit ? (
										<span className="text-sm text-gray-500 dark:text-gray-400">{item.unit}</span>
									) : null}
								</div>
								{item.context ? (
									<div className="mt-1 text-xs text-gray-600 dark:text-gray-300">{item.context}</div>
								) : null}
							</div>
						))}
					</div>
				</section>
			) : null}

			{/* Case study (optional) */}
			{article.caseStudy ? (
				<section className="mt-6 overflow-hidden rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
					<h3 className="text-base font-extrabold uppercase tracking-wide text-gray-900 dark:text-white">
						On the ground: case study
					</h3>
					<div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
						<span className="font-semibold">{article.caseStudy.profile}</span>
						{article.caseStudy.location ? ` • ${article.caseStudy.location}` : ""}
					</div>
					<p className="mt-2 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
						{article.caseStudy.story}
					</p>
				</section>
			) : null}

			{/* Expert commentary (optional) */}
			{article.expertCommentary ? (
				<section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
					<h3 className="text-base font-extrabold uppercase tracking-wide text-gray-900 dark:text-white">
						Expert perspective
					</h3>
					<p className="mt-2 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
						{article.expertCommentary}
					</p>
				</section>
			) : null}

			{/* Source attribution (optional) */}
			{article.sourceAttribution ? (
				<p className="mt-4 text-xs italic text-gray-500 dark:text-gray-400">
					{article.sourceAttribution}
				</p>
			) : null}

			{/* Related articles */}
			{related.length ? (
				<section className="mt-10">
					<h3 className="text-lg font-bold text-gray-900 dark:text-white">Related articles</h3>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						{related.map((r) => (
							<NewsCard key={r.url} article={r} />
						))}
					</div>
				</section>
			) : null}

			{/* Newsletter CTA */}
			<div className="mt-10">
				<NewsletterCTA />
			</div>
		</div>
	);
}

function ArticleHeroImage({ article }) {
	const candidates = Array.isArray(article.imageCandidates) && article.imageCandidates.length
		? article.imageCandidates
		: [article.image];
	const [src, setSrc] = useState(candidates[0]);
	const [loaded, setLoaded] = useState(false);

	// Reset image and loader when navigating to a new article
	useEffect(() => {
		setLoaded(false);
		setSrc(candidates[0]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [article.slug]);

	return (
		<div className="relative aspect-[16/9]">
			{!loaded ? <div className="absolute inset-0 animate-pulse bg-gray-100 dark:bg-gray-800" /> : null}
			<img
				src={src}
				alt={article.title}
				className="absolute inset-0 h-full w-full object-cover transition duration-300 hover:scale-[1.01]"
				loading="eager"
				fetchpriority="high"
				decoding="async"
				onLoad={() => setLoaded(true)}
				onError={(e) => {
					const idx = candidates.findIndex((u) => u === e.currentTarget.src);
					const next = candidates[idx + 1];
					setSrc(next || candidates[0]);
				}}
			/>
		</div>
	);
}


