import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import placeholderUrl from "../assets/placeholder.svg";

export default function NewsCard({ article, variant = "default", index = 0 }) {
	const { title, source, image, imageCandidates, url, publishedAt, summary, category } = article;

	const candidates = useMemo(() => {
		const list = Array.isArray(imageCandidates) && imageCandidates.length ? imageCandidates : [];
		const first = image || placeholderUrl;
		// Ensure first is at the front and unique
		const unique = [first, ...list].filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i);
		return unique;
	}, [image, imageCandidates]);

	const [imgSrc, setImgSrc] = useState(candidates[0] || placeholderUrl);
	const [loaded, setLoaded] = useState(false);

	const wrapperBase =
		"group relative overflow-hidden bg-white rounded-xl transition shadow-sm hover:shadow-lg hover:-translate-y-0.5 ring-1 ring-gray-200 hover:ring-primary/30";
	const wrapper = variant === "featured" ? wrapperBase.replace("rounded-xl", "rounded-2xl") : wrapperBase;

	const aspect =
		variant === "featured" ? "aspect-[16/9]" : variant === "tall" ? "aspect-[4/5]" : "aspect-[16/9]";

	const isInternal = typeof url === "string" && url.startsWith("/news/");
	const Anchor = ({ children }) =>
		isInternal ? (
			<Link to={url} className={wrapper} aria-label={title}>
				{children}
			</Link>
		) : (
			<a href={url} target="_blank" rel="noreferrer" className={wrapper} aria-label={title}>
				{children}
			</a>
		);

	return (
		<Anchor>
			<div className={["relative", aspect].join(" ")}>
				{/* Skeleton shimmer while loading */}
				{!loaded ? (
					<div className="absolute inset-0 animate-pulse bg-gray-100 dark:bg-gray-800" />
				) : null}
				<img
					src={imgSrc || placeholderUrl}
					alt={title}
					className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
					loading={index < 3 || variant === "featured" ? "eager" : "lazy"}
					fetchpriority={index < 3 || variant === "featured" ? "high" : "auto"}
					decoding="async"
					onLoad={() => setLoaded(true)}
					onError={(e) => {
						const current = e.currentTarget.src;
						const idx = candidates.findIndex((u) => u === current);
						const next = candidates[idx + 1];
						setImgSrc(next || placeholderUrl);
					}}
				/>
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
				{category ? (
					<span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-900 shadow">
						{category}
					</span>
				) : null}
			</div>
			<div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
				<h3 className="line-clamp-2 text-sm font-semibold text-white sm:text-base">
					{title}
				</h3>
				<div className="mt-2 flex items-center justify-between">
					<p className="text-[11px] font-medium text-white/85">
						{source} • {new Date(publishedAt).toLocaleDateString()}
					</p>
				</div>
				{variant === "featured" && summary ? (
					<p className="mt-2 line-clamp-2 text-xs text-white/90">
						{summary}
					</p>
				) : null}
			</div>
		</Anchor>
	);
}


