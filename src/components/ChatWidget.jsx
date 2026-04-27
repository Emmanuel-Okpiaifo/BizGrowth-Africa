import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, ExternalLink, RotateCcw, Send, Sparkles, User, X, Zap } from "lucide-react";
import { getApiBaseUrl } from "../utils/apiBaseUrl";

const INITIAL_MESSAGE = {
	role: "assistant",
	text: "Hi! Ask me about BizGrowth Africa articles, opportunities, procurements, and tenders.",
	sources: [],
	referencedItem: null,
	listedItems: []
};

export default function ChatWidget() {
	const [open, setOpen] = useState(false);
	const [question, setQuestion] = useState("");
	const [loading, setLoading] = useState(false);
	const [guardrailNotice, setGuardrailNotice] = useState(null);
	const messagesEndRef = useRef(null);
	const [messages, setMessages] = useState([INITIAL_MESSAGE]);

	const apiUrl = useMemo(() => {
		const base = getApiBaseUrl();
		return `${base}/api/chatbot-query.php`;
	}, []);

	useEffect(() => {
		if (!open) return;
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
	}, [messages, loading, open]);

	const sendQuestion = async () => {
		const q = question.trim();
		if (!q || loading) return;
		const history = messages
			.slice(-8)
			.map((m) => ({
				role: m.role,
				text: String(m.text || "").trim(),
				sources: Array.isArray(m.sources) ? m.sources.slice(0, 3) : [],
				referencedItem:
					m.referencedItem && typeof m.referencedItem === "object"
						? {
								title: String(m.referencedItem.title || "").trim(),
								url: String(m.referencedItem.url || "").trim(),
								type: String(m.referencedItem.type || "").trim()
						  }
						: null,
				listedItems: Array.isArray(m.listedItems)
					? m.listedItems.slice(0, 8).map((item) => ({
							title: String(item?.title || "").trim(),
							url: String(item?.url || "").trim(),
							type: String(item?.type || "").trim()
					  }))
					: []
			}))
			.filter((m) => m.text !== "");
		setQuestion("");
		setMessages((prev) => [...prev, { role: "user", text: q, sources: [] }]);
		setLoading(true);
		try {
			const res = await fetch(apiUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ question: q, history })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(data.error || "Failed to get response.");
			}
			const isGuardrail = Boolean(data.guardrail);
			if (isGuardrail) {
				const reason = String(data.guardrailReason || "").trim();
				const bannerText =
					reason === "rate_limit"
						? "Assistant is busy right now. Please wait a moment before sending another message."
						: reason === "daily_limit"
						? "Daily chatbot capacity has been reached. Please try again later."
						: reason === "provider_quota"
						? "Chat provider limit reached temporarily. Service will resume soon."
						: reason === "provider_unavailable"
						? "Assistant is temporarily unavailable. Please try again shortly."
						: "Chat is temporarily limited. Please try again shortly.";
				setGuardrailNotice({ reason, text: bannerText });
			} else {
				setGuardrailNotice(null);
			}
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					text: data.answer || "I can only answer from BizGrowth Africa content, and I couldn't find that yet.",
					sources: Array.isArray(data.sources) ? data.sources.slice(0, 3) : [],
					referencedItem:
						data.referencedItem && typeof data.referencedItem === "object"
							? {
									title: String(data.referencedItem.title || "").trim(),
									url: String(data.referencedItem.url || "").trim(),
									type: String(data.referencedItem.type || "").trim()
							  }
							: null,
					listedItems: Array.isArray(data.listedItems) ? data.listedItems.slice(0, 8) : []
				}
			]);
		} catch (err) {
			const raw = String(err?.message || "").trim();
			const lower = raw.toLowerCase();
			const friendly =
				raw.includes("GROQ_API_KEY")
					? "Chatbot is not configured yet on the server (missing Groq API key)."
					: raw.includes("OPENAI_API_KEY")
					? "Chatbot is not configured yet on the server (missing API key)."
					: lower.includes("quota") || lower.includes("billing")
					? "Your AI provider account has no available quota right now. Please enable billing or add credits, then try again."
					: lower.includes("rate limit")
					? "Chatbot is temporarily rate-limited by the AI provider. Please try again in a moment."
					: raw.includes("model")
					? "Chatbot model configuration failed. Please check server model settings."
					: raw || "I couldn't process that just now. Please try again.";
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					text: friendly,
					sources: [],
					referencedItem: null,
					listedItems: []
				}
			]);
			setGuardrailNotice({ reason: "request_error", text: "Connection issue. Please try again in a moment." });
		} finally {
			setLoading(false);
		}
	};

	const renderMessageText = (text) => {
		const renderInlineMarkdown = (rawText, keyPrefix) => {
			const input = String(rawText || "");
			const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|_[^_]+_)/g;
			const chunks = input.split(tokenRegex);
			return chunks.map((chunk, idx) => {
				if (!chunk) return null;
				const codeMatch = chunk.match(/^`([^`]+)`$/);
				if (codeMatch) {
					return (
						<code key={`${keyPrefix}-c-${idx}`} className="rounded bg-black/10 px-1 py-0.5 font-mono text-[0.92em] dark:bg-white/10">
							{codeMatch[1]}
						</code>
					);
				}
				const boldMatch = chunk.match(/^\*\*([^*]+)\*\*$/);
				if (boldMatch) {
					return (
						<strong key={`${keyPrefix}-b-${idx}`} className="font-semibold">
							{boldMatch[1]}
						</strong>
					);
				}
				const italicMatch = chunk.match(/^_([^_]+)_$/);
				if (italicMatch) {
					return (
						<em key={`${keyPrefix}-i-${idx}`} className="italic">
							{italicMatch[1]}
						</em>
					);
				}
				return <span key={`${keyPrefix}-n-${idx}`}>{chunk}</span>;
			});
		};

		const renderInlineWithLinks = (value, keyPrefix) => {
			const raw = String(value || "");
			const tokenRegex = /(https?:\/\/[^\s]+|\/[a-zA-Z0-9\-_/%.?=&]+)/g;
			const parts = raw.split(tokenRegex);
			return parts.map((part, idx) => {
				if (!part) return null;
				const isUrl = /^https?:\/\//i.test(part);
				const isPath = /^\/[a-zA-Z0-9\-_/%.?=&]+$/.test(part);
				if (!isUrl && !isPath) {
					return <span key={`${keyPrefix}-t-${idx}`}>{renderInlineMarkdown(part, `${keyPrefix}-md-${idx}`)}</span>;
				}
				return (
					<a
						key={`${keyPrefix}-a-${idx}`}
						href={part}
						target={isUrl ? "_blank" : undefined}
						rel={isUrl ? "noopener noreferrer" : undefined}
						className="break-all underline decoration-primary/60 underline-offset-2 hover:text-primary"
					>
						{part}
					</a>
				);
			});
		};

		const normalized = String(text || "").replace(/\r\n/g, "\n").trim();
		if (!normalized) return null;

		const blocks = normalized.split(/\n{2,}/).filter(Boolean);

		return blocks.map((block, idx) => {
			const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
			if (!lines.length) return null;

			const isOrderedList = lines.every((line) => /^\d+[\).\s-]+/.test(line));
			if (isOrderedList) {
				return (
					<ol key={`block-${idx}`} className="ml-4 list-decimal space-y-1">
						{lines.map((line, i) => (
							<li key={`li-${idx}-${i}`}>
								{renderInlineWithLinks(line.replace(/^\d+[\).\s-]+/, "").trim(), `ol-${idx}-${i}`)}
							</li>
						))}
					</ol>
				);
			}

			const isUnorderedList = lines.every((line) => /^[-*•]\s+/.test(line));
			if (isUnorderedList) {
				return (
					<ul key={`block-${idx}`} className="ml-4 list-disc space-y-1">
						{lines.map((line, i) => (
							<li key={`li-${idx}-${i}`}>
								{renderInlineWithLinks(line.replace(/^[-*•]\s+/, "").trim(), `ul-${idx}-${i}`)}
							</li>
						))}
					</ul>
				);
			}

			if (lines.length > 1) {
				return (
					<div key={`block-${idx}`} className="space-y-1">
						{lines.map((line, i) => (
							<p key={`line-${idx}-${i}`} className="leading-relaxed">
								{renderInlineWithLinks(line, `p-${idx}-${i}`)}
							</p>
						))}
					</div>
				);
			}

			return (
				<p key={`block-${idx}`} className="leading-relaxed">
					{renderInlineWithLinks(lines[0], `single-${idx}`)}
				</p>
			);
		});
	};

	const TypingDots = () => (
		<div
			className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 dark:bg-gray-800"
			style={{ animation: "chatPop 220ms ease-out" }}
		>
			<span className="h-1.5 w-1.5 rounded-full bg-gray-500" style={{ animation: "dotPulse 1s infinite 0ms" }} />
			<span className="h-1.5 w-1.5 rounded-full bg-gray-500" style={{ animation: "dotPulse 1s infinite 150ms" }} />
			<span className="h-1.5 w-1.5 rounded-full bg-gray-500" style={{ animation: "dotPulse 1s infinite 300ms" }} />
		</div>
	);

	const startNewChat = () => {
		if (loading) return;
		setQuestion("");
		setMessages([INITIAL_MESSAGE]);
		setGuardrailNotice(null);
	};

	return (
		<div className="fixed bottom-5 right-5 z-50">
			<style>{`
				@keyframes chatPop {
					0% { opacity: 0; transform: translateY(8px) scale(0.98); }
					100% { opacity: 1; transform: translateY(0) scale(1); }
				}
				@keyframes dotPulse {
					0%, 80%, 100% { opacity: 0.35; transform: translateY(0); }
					40% { opacity: 1; transform: translateY(-3px); }
				}
				@keyframes chatFloat {
					0%, 100% { transform: translateY(0px); }
					50% { transform: translateY(-2px); }
				}
				@keyframes iconPulse {
					0%, 100% { transform: scale(1); opacity: 0.8; }
					50% { transform: scale(1.08); opacity: 1; }
				}
				@keyframes iconSpinSlow {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}
			`}</style>
			{open ? (
				<div className="w-[min(94vw,410px)] overflow-hidden rounded-3xl border border-blue-200/80 bg-white/95 shadow-[0_20px_60px_-20px_rgba(30,64,175,0.45)] backdrop-blur-sm dark:border-blue-900/40 dark:bg-[#0B1220]/95">
					<div className="flex items-center justify-between border-b border-blue-100/80 bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 px-4 py-3 dark:border-blue-900/40 dark:from-[#0F1A33] dark:via-[#0E1830] dark:to-[#0B1835]">
						<div className="flex items-center gap-2.5">
							<div className="relative" style={{ animation: "chatFloat 2.2s ease-in-out infinite" }}>
								<span
									className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400/40 via-indigo-400/40 to-cyan-400/40 blur-[2px]"
									style={{ animation: "iconPulse 2s ease-in-out infinite" }}
								/>
								<span
									className="absolute -inset-1.5 rounded-full border border-blue-400/40"
									style={{ animation: "iconSpinSlow 10s linear infinite" }}
								/>
								<div className="relative rounded-full bg-gradient-to-br from-primary to-indigo-600 p-2 text-white shadow-lg shadow-blue-500/30">
									<Bot size={14} />
								</div>
								<span className="absolute -right-1 -top-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400 text-[8px] text-emerald-950 ring-2 ring-white dark:ring-[#0B1220]">
									<Zap size={8} />
								</span>
							</div>
							<div>
								<div className="text-sm font-semibold text-gray-900 dark:text-white">BizGrowth Assistant</div>
								<div className="text-[11px] text-gray-500 dark:text-gray-400">Grounded in BizGrowth content</div>
							</div>
						</div>
						<div className="flex items-center gap-1.5">
							<button
								onClick={startNewChat}
								disabled={loading}
								className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-gray-600 transition hover:bg-white/80 disabled:opacity-60 dark:text-gray-300 dark:hover:bg-white/10"
								title="Start new chat"
							>
								<RotateCcw size={12} />
								New chat
							</button>
							<button
								onClick={() => setOpen(false)}
								className="rounded-full p-1.5 text-gray-500 transition hover:bg-white/80 dark:hover:bg-white/10"
								title="Close chat"
							>
								<X size={16} />
							</button>
						</div>
					</div>
					{guardrailNotice ? (
						<div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-[12px] text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
							{guardrailNotice.text}
						</div>
					) : null}
					<div className="max-h-[440px] space-y-3 overflow-y-auto bg-gradient-to-b from-white to-blue-50/30 p-4 dark:from-[#0B1220] dark:to-[#0F172A]">
						{messages.map((m, idx) => (
							<div
								key={`${m.role}-${idx}`}
								className={m.role === "user" ? "text-right" : "text-left"}
								style={{ animation: "chatPop 220ms ease-out" }}
							>
								<div className={`mb-4 inline-flex items-center ${m.role === "user" ? "justify-end" : "justify-start"}`}>
									<div
										className={`rounded-full p-1 ${
											m.role === "user"
												? "bg-primary/15 text-primary"
												: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-200"
										}`}
									>
										{m.role === "user" ? <User size={11} /> : <Bot size={11} />}
									</div>
								</div>
								<div
									className={`inline-block max-w-[90%] overflow-hidden break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed [overflow-wrap:anywhere] ${
										m.role === "user"
											? "bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-blue-500/20"
											: "border border-gray-200 bg-white text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
									}`}
								>
									<div className="space-y-2">{renderMessageText(m.text)}</div>
								</div>
								{m.role === "assistant" && m.sources?.length > 0 ? (
									<div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
										{m.sources.map((s, i) => (
											<a
												key={`${s.url}-${i}`}
												href={s.url}
												className="inline-flex max-w-full items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-primary no-underline transition hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
											>
												<ExternalLink size={11} className="shrink-0" />
												<span className="break-words whitespace-normal [overflow-wrap:anywhere]">{s.title}</span>
											</a>
										))}
									</div>
								) : null}
							</div>
						))}
						{loading ? (
							<div className="text-left">
								<div className="mb-4 inline-flex items-center">
									<div className="rounded-full bg-gray-200 p-1 text-gray-600 dark:bg-gray-700 dark:text-gray-200">
										<Bot size={11} />
									</div>
								</div>
								<TypingDots />
							</div>
						) : null}
						<div ref={messagesEndRef} />
					</div>
					<div className="flex items-center gap-2 border-t border-blue-100/80 bg-white/90 p-3 dark:border-blue-900/40 dark:bg-[#0B1220]/90">
						<input
							type="text"
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") sendQuestion();
							}}
							placeholder="Ask me anything about news, opportunities, tenders, or procurements..."
							className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-[#0B1220] dark:text-white"
						/>
						<button
							onClick={sendQuestion}
							disabled={loading}
							className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-95 disabled:opacity-60"
						>
							<Send size={14} /> Send
						</button>
					</div>
				</div>
			) : (
				<button
					onClick={() => setOpen(true)}
					className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:scale-[1.02] hover:opacity-95"
					aria-label="Open BizGrowth chatbot"
				>
					<span
						className="absolute -inset-1 -z-10 rounded-full bg-gradient-to-r from-blue-500/40 via-indigo-500/35 to-cyan-500/40 blur-md"
						style={{ animation: "iconPulse 2.2s ease-in-out infinite" }}
					/>
					<span className="absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#0B1220]" />
					<span
						className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30"
						style={{ animation: "chatFloat 2.2s ease-in-out infinite" }}
					>
						<Bot size={16} />
						<span className="absolute -right-1 -top-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-300 text-amber-900">
							<Sparkles size={8} />
						</span>
					</span>
					Ask BizGrowth
					<Sparkles size={14} className="opacity-80 transition group-hover:opacity-100" />
				</button>
			)}
		</div>
	);
}

