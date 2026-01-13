import { useCallback, useEffect, useState } from "react";

const KEY = "bg_saved_opportunities";

function readStorage() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return [];
		const arr = JSON.parse(raw);
		return Array.isArray(arr) ? arr : [];
	} catch {
		return [];
	}
}

function writeStorage(ids) {
	try {
		localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(ids))));
	} catch {
		// ignore
	}
}

export default function useSavedOpportunities() {
	const [ids, setIds] = useState(() => readStorage());

	useEffect(() => {
		writeStorage(ids);
	}, [ids]);

	const add = useCallback((id) => {
		setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
	}, []);

	const remove = useCallback((id) => {
		setIds((prev) => prev.filter((x) => x !== id));
	}, []);

	const toggle = useCallback((id) => {
		setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
	}, []);

	const has = useCallback((id) => ids.includes(id), [ids]);

	return { ids, add, remove, toggle, has };
}

