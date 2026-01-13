import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_IDS = ["USDZAR", "USDNGN", "BTCUSD", "ETHUSD", "DGS10", "CPIAUCSL", "UNRATE", "DTWEXBGS"];

function uniq(arr) {
  return Array.from(new Set(arr));
}

export default function useMarketData({ ids = DEFAULT_IDS, pollMs = 30000 } = {}) {
  const [quotes, setQuotes] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const idsRef = useRef(ids);

  async function loadSnapshot() {
    try {
      setLoading(true);
      const params = new URLSearchParams({ ids: idsRef.current.join(",") });
      const res = await fetch(`/api/market/snapshot.php?${params.toString()}`);
      if (!res.ok) throw new Error(`Snapshot ${res.status}`);
      const json = await res.json();
      setQuotes(json.quotes || []);
      setLastUpdated(json.ts || Date.now());
      setError(null);
    } catch (e) {
      setError(e.message || "Failed to load snapshot");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    idsRef.current = uniq(ids);
  }, [ids]);

  useEffect(() => {
    loadSnapshot();
    const h = setInterval(loadSnapshot, pollMs);
    return () => clearInterval(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollMs]);

  async function loadHistory(id, range = "1D") {
    const params = new URLSearchParams({ id, range });
    const res = await fetch(`/api/market/history.php?${params.toString()}`);
    if (!res.ok) throw new Error(`History ${res.status}`);
    return await res.json();
  }

  async function search(q) {
    const params = new URLSearchParams({ q });
    const res = await fetch(`/api/market/search.php?${params.toString()}`);
    if (!res.ok) throw new Error(`Search ${res.status}`);
    return await res.json();
  }

  return {
    quotes,
    lastUpdated,
    loading,
    error,
    reload: loadSnapshot,
    loadHistory,
    search,
  };
}

