function hashStringToInt(str) {
	let h = 0;
	for (let i = 0; i < str.length; i++) {
		h = (h * 31 + str.charCodeAt(i)) >>> 0;
	}
	return h;
}

function sanitizeKeyword(s) {
	return String(s)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function categorySynonyms(category) {
	switch (String(category || "")) {
		case "Grant":
			return ["grant", "funding", "non-dilutive", "support"];
		case "Accelerator":
			return ["startup", "mentorship", "demo-day", "innovation"];
		case "Competition":
			return ["pitch", "award", "challenge", "showcase"];
		case "Fellowship":
			return ["research", "residency", "fellows", "learning"];
		case "Training":
			return ["workshop", "bootcamp", "skills", "classroom"];
		case "Impact Loan":
			return ["finance", "credit", "loan", "capital"];
		default:
			return ["business", "msme", "entrepreneurship"];
	}
}

export function buildOpportunityImageCandidates(opp) {
	const baseUnsplash = "https://source.unsplash.com/1600x900/";
	const sig = hashStringToInt(opp.id || opp.title || "");
	const country = sanitizeKeyword(opp.country || "africa");
	const region = sanitizeKeyword(opp.region || "");
	const catSyn = categorySynonyms(opp.category || "");
	const k1 = [country, ...catSyn].filter(Boolean).map(sanitizeKeyword).join(",");
	const k2 = ["africa", region, opp.category || ""].filter(Boolean).map(sanitizeKeyword).join(",");
	return [
		`${baseUnsplash}?${k1}&sig=${sig}`,
		`${baseUnsplash}?${k2}&sig=${(sig + 17) % 100000}`,
		`https://picsum.photos/seed/${sig}/1600/900`,
	];
}

export function getOpportunityImage(opp) {
	const cands = buildOpportunityImageCandidates(opp);
	return cands[0];
}

