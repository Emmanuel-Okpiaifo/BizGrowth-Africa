import { useEffect } from "react";
import { SITE_URL } from "../config/site";

function upsertMeta(attr, key, value) {
	let el = document.head.querySelector(`${attr}[${key}="${value?.key}"]`);
	if (!el) {
		el = document.createElement("meta");
		el.setAttribute(attr, value.key);
		document.head.appendChild(el);
	}
	el.setAttribute("content", value.content);
	return () => {
		// leave meta tags in place to benefit subsequent navigations
	};
}

function upsertLink(rel, href) {
	let el = document.head.querySelector(`link[rel="${rel}"]`);
	if (!el) {
		el = document.createElement("link");
		el.setAttribute("rel", rel);
		document.head.appendChild(el);
	}
	el.setAttribute("href", href);
	return () => {};
}

function absoluteUrl(pathOrUrl) {
	try {
		// already absolute
		new URL(pathOrUrl);
		return pathOrUrl;
	} catch {
		const origin = SITE_URL;
		if (!pathOrUrl) return origin;
		return origin + (pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`);
	}
}

export default function SEO({
	title,
	description,
	image,
	type = "website",
	canonicalPath,
	publishedTime,
	modifiedTime,
	jsonLd,
}) {
	useEffect(() => {
		const prevTitle = document.title;
		if (title) document.title = title;

		const cleanups = [];
		if (description) {
			cleanups.push(
				upsertMeta("meta[name]", "name", { key: "description", content: description })
			);
		}
		const absCanonical = absoluteUrl(canonicalPath || "/");
		cleanups.push(upsertLink("canonical", absCanonical));

		// Open Graph
		if (title) cleanups.push(upsertMeta("meta[property]", "property", { key: "og:title", content: title }));
		if (description) cleanups.push(upsertMeta("meta[property]", "property", { key: "og:description", content: description }));
		cleanups.push(upsertMeta("meta[property]", "property", { key: "og:type", content: type }));
		cleanups.push(upsertMeta("meta[property]", "property", { key: "og:url", content: absCanonical }));
		if (image) cleanups.push(upsertMeta("meta[property]", "property", { key: "og:image", content: absoluteUrl(image) }));

		// Twitter
		cleanups.push(upsertMeta("meta[name]", "name", { key: "twitter:card", content: image ? "summary_large_image" : "summary" }));
		if (title) cleanups.push(upsertMeta("meta[name]", "name", { key: "twitter:title", content: title }));
		if (description) cleanups.push(upsertMeta("meta[name]", "name", { key: "twitter:description", content: description }));
		if (image) cleanups.push(upsertMeta("meta[name]", "name", { key: "twitter:image", content: absoluteUrl(image) }));

		// Article specific
		if (type === "article") {
			if (publishedTime) cleanups.push(upsertMeta("meta[property]", "property", { key: "article:published_time", content: publishedTime }));
			if (modifiedTime) cleanups.push(upsertMeta("meta[property]", "property", { key: "article:modified_time", content: modifiedTime || publishedTime }));
		}

		// JSON-LD
		let scriptEl;
		if (jsonLd) {
			scriptEl = document.createElement("script");
			scriptEl.type = "application/ld+json";
			scriptEl.text = JSON.stringify(jsonLd);
			document.head.appendChild(scriptEl);
		}

		return () => {
			document.title = prevTitle;
			if (scriptEl && scriptEl.parentNode) {
				scriptEl.parentNode.removeChild(scriptEl);
			}
			cleanups.forEach((fn) => fn && fn());
		};
	}, [title, description, image, type, canonicalPath, publishedTime, modifiedTime, jsonLd]);

	return null;
}


