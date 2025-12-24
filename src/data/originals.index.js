import { originalArticles } from "./articles.original";
import { generateBulkOriginals } from "./originals.bulk";
import { imageOverrides } from "./image.overrides";

function hashStringToInt(str) {
	let h = 0;
	for (let i = 0; i < str.length; i++) {
		h = (h * 31 + str.charCodeAt(i)) >>> 0;
	}
	return h;
}

const categoryKeywordMap = {
	Fintech: ["fintech", "mobile money", "banking", "payments", "pos"],
	Policy: ["government", "regulation", "public sector", "ministry", "policy"],
	Funding: ["venture capital", "term sheet", "founders", "investment", "startup"],
	Markets: ["stock market", "bonds", "commodities", "trading", "charts"],
	SMEs: ["small business", "retail", "workshop", "manufacturing", "market stall"],
	Reports: ["data", "report", "dashboard", "analysis", "charts"],
};

function sanitizeKeyword(s) {
	return String(s)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

const STOPWORDS = new Set([
	"the","and","for","with","from","that","this","into","across","over","under","about",
	"of","in","on","to","by","at","as","is","are","was","were","be","been","it","its",
	"a","an","or","but","not","new","latest","update","how","why","what","when","where",
	"africa","african" // already added explicitly
]);

function extractTitleKeywords(title = "", subheading = "", max = 4) {
	const text = `${title} ${subheading}`.toLowerCase();
	const words = text
		.replace(/[^a-z0-9\s]/g, " ")
		.split(/\s+/)
		.filter((w) => w.length >= 4 && !STOPWORDS.has(w));
	// Preserve order, keep unique
	const seen = new Set();
	const picked = [];
	for (const w of words) {
		if (!seen.has(w)) {
			seen.add(w);
			picked.push(w);
			if (picked.length >= max) break;
		}
	}
	return picked;
}

function categorySynonyms(category) {
	switch (category) {
		case "Fintech":
			return ["fintech", "payments", "mobile-money", "digital-banking"];
		case "Policy":
			return ["policy", "regulation", "government", "parliament"];
		case "Funding":
			return ["venture-capital", "startup", "funding", "term-sheet"];
		case "Markets":
			return ["markets", "stock-exchange", "bonds", "trading-floor"];
		case "SMEs":
			return ["sme", "small-business", "retail", "workshop"];
		case "Reports":
			return ["report", "data", "dashboard", "analysis"];
		default:
			return ["business", "economy"];
	}
}

function buildCuratedImageUrl(category, country, slug) {
	const base = "https://source.unsplash.com/1600x900/";
	// Build targeted keywords: africa + country + category synonyms + top title terms
	const cat = String(category || "");
	const parts = ["africa", country || "", ...categorySynonyms(cat)]
		.filter(Boolean)
		.map((s) => sanitizeKeyword(s))
		.filter(Boolean);
	const keywords = parts.join(",");
	const sig = hashStringToInt(slug);
	// Correct Source API pattern: keywords first, then &sig for deterministic uniqueness
	return `${base}?${keywords}&sig=${sig}`;
}

const base = [...originalArticles, ...generateBulkOriginals(100)];

// Insert inline citations and extend short articles
function enrichBodyWithCitations(article) {
	const maxParas = 6;
	// If richBody already exists, keep it
	if (Array.isArray(article.richBody) && article.richBody.length) {
		return article.richBody;
	}

	const cat = article.category || "";
	const country = article.country || "Africa";

	// Category-based links for inline citations
	const catLinks = {
		Fintech: [
			{ label: "CBK updates", href: "https://www.centralbank.go.ke/" },
			{ label: "World Bank Digital Finance", href: "https://www.worldbank.org/en/topic/financialinclusion" },
		],
		Policy: [
			{ label: "central bank communique", href: "https://www.bis.org/central_bank_hub.htm" },
			{ label: "government gazette", href: "https://www.gov.za/documents" },
		],
		Funding: [
			{ label: "PitchBook", href: "https://pitchbook.com/news/reports" },
			{ label: "Partech Africa", href: "https://partechpartners.com/insights" },
		],
		Markets: [
			{ label: "JSE data", href: "https://www.jse.co.za/" },
			{ label: "IMF data", href: "https://www.imf.org/en/Data" },
		],
		SMEs: [
			{ label: "IFC MSME reports", href: "https://www.ifc.org/wps/wcm/connect/Topics_Ext_Content/IFC_External_Corporate_Site/Financial+Institutions/Resources/Publications" },
			{ label: "World Bank SME finance", href: "https://www.worldbank.org/en/topic/smefinance" },
		],
		Reports: [
			{ label: "AfDB documents", href: "https://www.afdb.org/en/documents" },
			{ label: "World Bank Data", href: "https://data.worldbank.org/" },
		],
	};
	const links = catLinks[cat] || catLinks.SMes || [];

	const baseBody = Array.isArray(article.body) ? article.body : [];
	const paragraphs = baseBody.slice(0, maxParas);

	const rich = paragraphs.map((text, i) => {
		const spans = [{ text }];
		// Insert one inline citation per paragraph for first few paragraphs
		if (i < links.length) {
			const l = links[i];
			return [
				{ text: `${country}: ` },
				{ text },
				{ text: " (" },
				{ text: l.label, href: l.href },
				{ text: ")" },
			];
		}
		return spans;
	});

	// If article too short, append generic, cited paragraphs
	while (rich.length < maxParas) {
		const l = links[rich.length % links.length] || { label: "World Bank Data", href: "https://data.worldbank.org/" };
		rich.push([
			{ text: `Additional context: independent data sources corroborate recent ${cat.toLowerCase()} trends (` },
			{ text: l.label, href: l.href },
			{ text: ")." },
		]);
	}

	return rich;
}

function buildImageCandidates(category, country, slug) {
	const sig = hashStringToInt(slug);
	const baseUnsplash = "https://source.unsplash.com/1600x900/";
	const cat = String(category || "");
	const kw = categoryKeywordMap[cat] || ["business", "economy", "industry", "trade"];
	const a = sanitizeKeyword(country || "africa");
	// Keyword sets: country + category terms; africa + category; country + top title words (derived later)
	const k1 = [a, ...kw].map(sanitizeKeyword).filter(Boolean).join(",");
	const k2 = [a, "africa", "business", cat].map(sanitizeKeyword).filter(Boolean).join(",");
	const k3 = ["africa", cat, "markets"].map(sanitizeKeyword).filter(Boolean).join(",");

	// Multiple deterministic candidates (vary sig to change redirect target)
	const candidates = [
		`${baseUnsplash}?${k1}&sig=${sig}`,
		`${baseUnsplash}?${k2}&sig=${(sig + 17) % 100000}`,
		`${baseUnsplash}?${k3}&sig=${(sig + 33) % 100000}`,
		// Final stable fallback: picsum (always works), seeded by slug
		`https://picsum.photos/seed/${sig}/1600/900`,
	];
	return candidates;
}

function getOverrideCandidates(article) {
	const bySlug = imageOverrides[article.slug];
	if (Array.isArray(bySlug) && bySlug.length) return bySlug;
	const key = `${article.category}|${article.country || ""}`;
	const byCatCountry = imageOverrides[key];
	if (Array.isArray(byCatCountry) && byCatCountry.length) return byCatCountry;
	return [];
}

export const allOriginalArticles = base.map((a) => {
	// Always override with curated, unique, relevant image
	const titleKeywords = extractTitleKeywords(a.title, a.subheading, 4);
	// Rebuild curated with more specific keywords appended as fallback query (handled inside functions by sig)
	const curatedImage = buildCuratedImageUrl(a.category, a.country, a.slug);
	let candidates = buildImageCandidates(a.category, a.country, a.slug);
	// Prepend explicit overrides (e.g., from Ninth Grid) if provided
	const overrides = getOverrideCandidates(a);
	if (overrides.length) {
		candidates = [...overrides, ...candidates];
	}
	if (titleKeywords.length) {
		const baseUnsplash = "https://source.unsplash.com/1600x900/";
		const combined = ["africa", a.country || "", ...categorySynonyms(a.category), ...titleKeywords]
			.filter(Boolean)
			.map(sanitizeKeyword)
			.join(",");
		candidates = [
			`${baseUnsplash}?${combined}&sig=${(hashStringToInt(a.slug) + 59) % 100000}`,
			...candidates,
		];
	}
	// Deduplicate while preserving order
	const seen = new Set();
	candidates = candidates.filter((u) => {
		if (!u || seen.has(u)) return false;
		seen.add(u);
		return true;
	});
	const richBody = enrichBodyWithCitations(a);
	// Canonical featured image that "sticks" to the article across contexts
	const canonicalImage = overrides[0] || curatedImage || candidates[0];
	return { ...a, image: canonicalImage, canonicalImage, imageCandidates: candidates, richBody };
});

