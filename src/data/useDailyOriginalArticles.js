import { useEffect, useMemo, useState } from "react";
import { allOriginalArticles } from "./originals.index";

function getTodayKey() {
	const d = new Date();
	return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

// Deterministic rotation by date: rotates array by an offset derived from today's key
function rotateByDate(items, key) {
	if (!items.length) return items;
	let hash = 0;
	for (let i = 0; i < key.length; i++) {
		hash = (hash * 31 + key.charCodeAt(i)) % items.length;
	}
	const offset = hash % items.length;
	return [...items.slice(offset), ...items.slice(0, offset)];
}

export function useDailyOriginalArticles() {
	const [todayKey, setTodayKey] = useState(getTodayKey());

	// Refresh at midnight: check hourly, update key if date changes
	useEffect(() => {
		const interval = setInterval(() => {
			const k = getTodayKey();
			setTodayKey((prev) => (prev === k ? prev : k));
		}, 60 * 60 * 1000); // hourly
		return () => clearInterval(interval);
	}, []);

	const articles = useMemo(() => {
		const rotated = rotateByDate(allOriginalArticles, todayKey);
		// Map to homepage/article-card shape and stamp today's date to simulate daily freshness
		const todayIso = new Date().toISOString();
		return rotated.map((a) => ({
			title: a.title,
			source: "BizGrowth Africa",
			image: a.image,
			imageCandidates: a.imageCandidates,
			url: `/news/${a.slug}`,
			publishedAt: todayIso,
			summary: a.summary || a.subheading,
			category: a.category,
		}));
	}, [todayKey]);

	return { articles, todayKey };
}


