export function generateBulkOriginals(count = 100) {
	const categories = ["Fintech", "Policy", "Funding", "Markets", "SMEs", "Reports"];
	const countries = [
		"Nigeria",
		"Kenya",
		"South Africa",
		"Ghana",
		"Egypt",
		"Morocco",
		"Tanzania",
		"Rwanda",
		"Uganda",
		"Côte d’Ivoire",
	];
	const regions = {
		Nigeria: "West Africa",
		Kenya: "East Africa",
		"South Africa": "Southern Africa",
		Ghana: "West Africa",
		Egypt: "North Africa",
		Morocco: "North Africa",
		Tanzania: "East Africa",
		Rwanda: "East Africa",
		Uganda: "East Africa",
		"Côte d’Ivoire": "West Africa",
	};
	const images = [
		"https://picsum.photos/seed/1/1600/900",
		"https://picsum.photos/seed/2/1600/900",
		"https://picsum.photos/seed/3/1600/900",
		"https://picsum.photos/seed/4/1600/900",
		"https://picsum.photos/seed/5/1600/900",
	];

	function pad(n) {
		return String(n).padStart(2, "0");
	}

	// Headline templates without numbering; realistic phrasing
	const headlines = [
		"{country} {topic} outlook improves as SMEs adapt to tighter liquidity",
		"{country} regulators signal new {topic} guardrails aimed at MSME resilience",
		"How {country} founders are navigating {topic.toLowerCase()} headwinds in 2025",
		"{country} pushes inclusive growth with targeted {topic.toLowerCase()} reforms",
		"Inside {country}’s evolving {topic.toLowerCase()} stack and what it means for MSMEs",
		"Why {country}’s {topic.toLowerCase()} trends matter for regional supply chains",
		"{country} SMEs find new momentum as {topic.toLowerCase()} conditions stabilize",
		"Investors eye {country}’s {topic.toLowerCase()} pipeline amid policy clarity",
	];

	const items = [];
	for (let i = 0; i < count; i++) {
		const cat = categories[i % categories.length];
		const country = countries[i % countries.length];
		const region = regions[country];
		const dayOffset = i % 60; // distribute dates across ~2 months
		const now = new Date();
		const date = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
		const publishedAt = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
			date.getDate()
		)}T0${(i % 9) + 1}:00:00Z`;
		const image = images[i % images.length];
		const template = headlines[i % headlines.length];
		const title = template
			.replace("{country}", country)
			.replace("{topic}", cat)
			.replace("{topic.toLowerCase()}", cat.toLowerCase())
			.replace("{topic.toLowerCase()}", cat.toLowerCase());
		const slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
		const subheading = `Original BizGrowth analysis on ${cat.toLowerCase()} shifts in ${country} and their MSME impact.`;
		const summary =
			"Original BizGrowth Africa snapshot with context, risks, and opportunities across the MSME landscape.";
		const body = [
			`${country} sees notable movement in ${cat.toLowerCase()} indicators this period. Operators report mixed conditions, with leaders prioritizing cash discipline and near-term growth initiatives.`,
			"Liquidity, unit economics, and customer retention are the core battlegrounds. Firms that tightened credit control and improved collections cycles are reporting healthier cash conversion.",
			"Policy clarity has helped planning for inventory and staffing, though FX volatility still complicates pricing decisions in import‑heavy segments.",
			"Distribution partnerships with marketplaces and payment providers are reducing customer acquisition costs while extending reach into second‑tier cities.",
			"Founders increasingly deploy data to tune working capital: smaller, faster inventory turns and automated replenishment are common threads among outperformers.",
			"BizGrowth Africa analysis highlights execution quality and risk controls as decisive factors for outcomes over the next two quarters.",
		];
		// Rich body with inline citations (paragraphs -> spans with optional href)
		const richBody = [
			[
				{ text: `${country} sees notable movement in ${cat.toLowerCase()} indicators this period. ` },
				{ text: "Central bank communications", href: "https://www.bis.org/central_bank_hub.htm" },
				{ text: " and market commentary point to cautious optimism amid tighter liquidity." },
			],
			[
				{ text: "Flow‑based credit models are scaling with payments data, a trend visible across East Africa per " },
				{ text: "CBK updates", href: "https://www.centralbank.go.ke/" },
				{ text: " and " },
				{ text: "industry research", href: "https://www.afdb.org/en/documents" },
				{ text: "." },
			],
			[
				{ text: "Funding conditions remain selective; venture activity concentrates in resilient categories according to " },
				{ text: "PitchBook", href: "https://pitchbook.com/news/reports" },
				{ text: " and " },
				{ text: "Partech Africa reports", href: "https://partechpartners.com/insights" },
				{ text: "." },
			],
			[
				{ text: "SME digitization continues via low‑cost tools (POS, inventory) with evidence of gains in margins, consistent with " },
				{ text: "World Bank SME studies", href: "https://www.worldbank.org/en/topic/smefinance" },
				{ text: "." },
			],
			[
				{ text: "Market volatility has moderated as liquidity management improved, based on " },
				{ text: "exchange bulletins", href: "https://www.jse.co.za/" },
				{ text: " and " },
				{ text: "statistical releases", href: "https://www.imf.org/en/Data" },
				{ text: "." },
			],
			[
				{ text: "Execution quality and risk controls remain decisive for outcomes; firms that tie working capital to real cash cycles outperform peers, per " },
				{ text: "IFC MSME reports", href: "https://www.ifc.org/wps/wcm/connect/Topics_Ext_Content/IFC_External_Corporate_Site/Financial+Institutions/Resources/Publications" },
				{ text: "." },
			],
		];
		const caseStudy = {
			title: "On the ground: a founder’s working capital reset",
			location: country,
			profile: "MSME wholesaler",
			story:
				"After switching to flow‑based limits against daily POS collections, a Nairobi‑based wholesaler reduced stockouts by 18% and cut average receivables days from 41 to 28. The firm now staggers purchases weekly and negotiated supplier terms aligned to cash cycles.",
		};
		const expertCommentary =
			"Short‑tenor, repeat lending anchored to real transaction flows is outperforming traditional collateralized models for small businesses. The next unlock is standardized data sharing across payment and logistics rails.";
		const whyItMatters =
			"MSMEs depend on affordable finance, stable demand, and predictable policy. Today’s shifts shape pricing power, access to capital, and hiring plans.";
		const keyTakeaways = [
			"Execution discipline outweighs top-line growth in the near term.",
			"Partnerships and embedded finance expand reach at lower CAC.",
			"Operational resilience remains the competitive edge in volatile markets.",
		];
		const byTheNumbers = [
			{ label: "Working capital tenor", value: 90, unit: "days", context: "Median facility tenor" },
			{ label: "YoY revenue trend", value: i % 2 === 0 ? "+6" : "-3", unit: "%", context: "Sector median" },
			{ label: "Digital payments share", value: 62 + (i % 7), unit: "%", context: "SME transactions" },
		];

		items.push({
			slug,
			title,
			subheading,
			category: cat,
			country,
			region,
			publishedAt,
			image,
			summary,
			body,
			richBody,
			caseStudy,
			expertCommentary,
			whyItMatters,
			keyTakeaways,
			byTheNumbers,
			sourceAttribution: "Source: BizGrowth Africa analysis",
		});
	}
	return items;
}


