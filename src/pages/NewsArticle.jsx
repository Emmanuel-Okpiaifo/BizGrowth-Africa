import { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";
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

			{/* Post Detail 2 style: overlay hero with title/meta on image */}
			{(article.image || (article.imageCandidates && article.imageCandidates.length)) ? (
				<Detail2Hero key={article.slug} article={article} />
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

			{/* Share bar */}
			<div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border bg-red-50 p-4 text-sm shadow-sm ring-1 ring-red-100 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
				<p className="mr-2 font-medium text-gray-700 dark:text-gray-200">Share this article:</p>
				<div className="flex items-center gap-2">
					<a
						className="inline-flex items-center justify-center rounded-md border px-2 py-1.5 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
						href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`}
						target="_blank" rel="noreferrer"
						title="Share on Facebook"
					>
						<Facebook size={16} />
					</a>
					<a
						className="inline-flex items-center justify-center rounded-md border px-2 py-1.5 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
						href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(article.title)}`}
						target="_blank" rel="noreferrer"
						title="Share on Twitter"
					>
						<Twitter size={16} />
					</a>
					<a
						className="inline-flex items-center justify-center rounded-md border px-2 py-1.5 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
						href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(location.href)}`}
						target="_blank" rel="noreferrer"
						title="Share on LinkedIn"
					>
						<Linkedin size={16} />
					</a>
					<button
						type="button"
						onClick={() => navigator.clipboard?.writeText(location.href)}
						className="inline-flex items-center justify-center rounded-md border px-2 py-1.5 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
						title="Copy link"
					>
						<LinkIcon size={16} />
					</button>
				</div>
			</div>

			{/* Author box */}
			<div className="mt-6 rounded-2xl border bg-red-50 p-5 shadow-sm ring-1 ring-red-100 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
				<div className="flex items-start gap-4">
					<div className="h-12 w-12 flex-none rounded-full bg-primary/20" />
					<div>
						<h3 className="text-base font-semibold text-gray-900 dark:text-white">BizGrowth Africa Editorial</h3>
						<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Independent analysis and reporting focused on African MSMEs and markets.</p>
					</div>
				</div>
			</div>

			{/* Comments (placeholder) */}
			<div className="mt-6 rounded-2xl border bg-red-50 p-5 shadow-sm ring-1 ring-red-100 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
				<h3 className="text-lg font-bold text-gray-900 dark:text-white">Comments</h3>
				<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Comments are moderated. Please be respectful.</p>
				<form className="mt-4 grid gap-3 sm:grid-cols-2">
					<input className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white sm:col-span-1" placeholder="Name*" />
					<input className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white sm:col-span-1" placeholder="Email*" type="email" />
					<textarea className="min-h-[120px] rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white sm:col-span-2" placeholder="Message*" />
					<div className="sm:col-span-2">
						<button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Post Comment</button>
					</div>
				</form>
			</div>
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

function Detail2Hero({ article }) {
	const candidates = Array.isArray(article.imageCandidates) && article.imageCandidates.length
		? article.imageCandidates
		: [article.image];
	const [src, setSrc] = useState(candidates[0]);
	useEffect(() => {
		setSrc(candidates[0]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [article.slug]);
	return (
		<div className="mt-4 overflow-hidden rounded-2xl">
			<div className="relative aspect-[16/9]">
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
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
				{article.category ? (
					<div className="absolute left-3 top-3">
						<span className="rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-gray-900 shadow dark:bg-black/60 dark:text-white">
							{article.category}
						</span>
					</div>
				) : null}
				<div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
					<ul className="mb-2 flex flex-wrap items-center gap-3 text-sm text-white/90">
						<li><span>By</span> <span className="font-semibold">BizGrowth Africa</span></li>
						<li className="before:mx-2 before:text-white/60 before:content-['•']">{formatDate(article.publishedAt)}</li>
					</ul>
					<h1 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
						{article.title}
					</h1>
				</div>
			</div>
		</div>
	);
}


