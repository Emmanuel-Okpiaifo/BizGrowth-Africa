import { useEffect, useRef, useState } from "react";
import { getApiBaseUrl } from "../utils/apiBaseUrl";
import { fetchCryptoQuotes, fetchCryptoHistory } from "../utils/coingeckoClient";

/**
 * Markets data: snapshot from PHP API (Finnhub), fallback to CoinGecko crypto only.
 */
const DEFAULT_IDS = ["AAPL", "MSFT", "IBM", "BTCUSD", "ETHUSD"];

const STATIC_CATALOG = [
  { id: "AAPL", label: "Apple Inc.", type: "stock" },
  { id: "MSFT", label: "Microsoft", type: "stock" },
  { id: "IBM", label: "IBM", type: "stock" },
  { id: "BTCUSD", label: "BTC/USD", type: "crypto" },
  { id: "ETHUSD", label: "ETH/USD", type: "crypto" },
];

const POLL_MS = 2 * 60 * 1000; // 2 min
const FETCH_TIMEOUT_MS = 8000;

function marketApiUrl(path, query = "") {
  const base = (getApiBaseUrl() || "").replace(/\/$/, "") || (typeof window !== "undefined" ? window.location.origin : "");
  const q = query ? `?${query}` : "";
  return `${base}/api/market/${path}${q}`;
}

function fetchWithTimeout(url) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { signal: c.signal }).finally(() => clearTimeout(t));
}

export default function useMarketData({ ids = DEFAULT_IDS, pollMs = POLL_MS } = {}) {
  const [quotes, setQuotes] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(false);
  const idsRef = useRef(ids);

  useEffect(() => {
    idsRef.current = Array.isArray(ids) ? [...new Set(ids)] : DEFAULT_IDS;
  }, [ids]);

  async function loadSnapshot() {
    setLoading(true);
    setError(null);
    const idList = idsRef.current.join(",");
    const url = marketApiUrl("snapshot.php", `ids=${encodeURIComponent(idList)}`);

    try {
      const res = await fetchWithTimeout(url);
      const text = await res.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (_) {}
      }
      const list = (data && data.quotes) || [];
      if (list.length > 0) {
        setQuotes(list);
        setLastUpdated(data.ts != null ? data.ts : Date.now());
        setApiAvailable(true);
        setLoading(false);
        return;
      }
    } catch (_) {}

    // Fallback: crypto-only endpoint
    try {
      const fallbackUrl = marketApiUrl("crypto-only.php", "");
      const res = await fetchWithTimeout(fallbackUrl);
      if (res.ok) {
        const data = await res.json();
        const list = (data && data.quotes) || [];
        if (list.length > 0) {
          setQuotes(list);
          setLastUpdated(data.ts != null ? data.ts : Date.now());
          setApiAvailable(false);
          setLoading(false);
          return;
        }
      }
    } catch (_) {}

    // Last resort: client-side CoinGecko (BTC, ETH only)
    try {
      const cryptoQuotes = await fetchCryptoQuotes();
      if (cryptoQuotes && cryptoQuotes.length > 0) {
        setQuotes(cryptoQuotes);
        setLastUpdated(Date.now());
        setApiAvailable(false);
        setLoading(false);
        return;
      }
    } catch (e) {
      setError(e && e.message ? e.message : "Failed to load markets");
    }

    setQuotes([]);
    setApiAvailable(false);
    setLoading(false);
  }

  useEffect(() => {
    loadSnapshot();
    const interval = setInterval(loadSnapshot, pollMs);
    return () => clearInterval(interval);
  }, [pollMs]);

  async function loadHistory(symbolId, range = "1D") {
    // Try server history first when API is available
    if (apiAvailable) {
      try {
        const url = marketApiUrl("history.php", `id=${encodeURIComponent(symbolId)}&range=${encodeURIComponent(range)}`);
        const res = await fetchWithTimeout(url);
        if (res.ok) {
          const data = await res.json();
          const points = Array.isArray(data?.points) ? data.points : [];
          // For crypto, if server returned too few points, fall back to client so chart shows ups/downs
          if ((symbolId === "BTCUSD" || symbolId === "ETHUSD") && points.length < 20) {
            try {
              const clientPoints = await fetchCryptoHistory(symbolId);
              if (clientPoints.length > points.length) {
                return { id: symbolId, points: clientPoints, ts: Date.now(), stale: false };
              }
            } catch (_) {}
          }
          return { id: data?.id ?? symbolId, points, ts: data?.ts ?? Date.now(), stale: data?.stale ?? false };
        }
      } catch (_) {}
    }
    // Client-side fallback for crypto when no server or server failed
    if (symbolId === "BTCUSD" || symbolId === "ETHUSD") {
      try {
        const points = await fetchCryptoHistory(symbolId);
        return { id: symbolId, points, ts: Date.now(), stale: false };
      } catch (_) {}
    }
    return { id: symbolId, points: [], ts: Date.now(), stale: false };
  }

  function search(q) {
    const lower = (q || "").toLowerCase();
    const results = lower
      ? STATIC_CATALOG.filter(
          (r) =>
            (r.id || "").toLowerCase().includes(lower) ||
            (r.label || "").toLowerCase().includes(lower)
        )
      : [...STATIC_CATALOG];
    return Promise.resolve({ results });
  }

  return {
    quotes,
    lastUpdated,
    loading,
    error,
    apiAvailable,
    reload: loadSnapshot,
    loadHistory,
    search,
  };
}
