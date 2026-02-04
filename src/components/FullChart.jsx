import { useEffect, useMemo, useRef, useState } from "react";

export default function FullChart({
	points = [],
	labels = [],
	color = "#0067FF",
	height = 320,
	showArea = true,
	showMA = true,
	volumePoints = [],
	yFormatter = (v) => (typeof v === "number" ? v.toLocaleString() : v),
}) {
	const [hover, setHover] = useState(null);
	const svgRef = useRef(null);

	const width = 960; // viewBox width (responsive via preserveAspectRatio)
	const padding = { top: 16, right: 16, bottom: 28, left: 56 };
	const innerW = width - padding.left - padding.right;
	const innerH = height - padding.top - padding.bottom;

	const { min, max, path, yTicks, xTickIndices, mapped, stepX } = useMemo(() => {
		if (!points.length) {
			return { min: 0, max: 0, path: "", yTicks: [], xTickIndices: [], mapped: [], stepX: 0 };
		}
		// Need at least 2 points to draw a line; duplicate single point so chart is never blank
		const pts = points.length === 1 ? [points[0], points[0]] : points;
		let minVal = Math.min(...pts);
		let maxVal = Math.max(...pts);
		// When all values equal (flat line), add padding so the line is visible and not at the edge
		if (maxVal - minVal < 1e-9) {
			const pad = Math.abs(minVal) * 0.01 || 1;
			minVal = minVal - pad;
			maxVal = maxVal + pad;
		}
		const spread = Math.max(1e-9, maxVal - minVal);
		const mapX = (i) => (i / Math.max(1, pts.length - 1)) * innerW + padding.left;
		const mapY = (v) => padding.top + innerH - ((v - minVal) / spread) * innerH;

		const mappedPts = pts.map((v, i) => [mapX(i), mapY(v)]);
		const d = mappedPts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

		const yTicks = Array.from({ length: 5 }, (_, i) => minVal + (spread * i) / 4);
		// 5 x-axis tick indices spread across the chart (so labels show start, 1/4, 1/2, 3/4, end)
		const n = pts.length;
		const xTickIndices = n <= 5
			? Array.from({ length: n }, (_, i) => i)
			: [0, Math.floor(n * 0.25), Math.floor(n * 0.5), Math.floor(n * 0.75), n - 1];
		const stepX = innerW / Math.max(1, pts.length - 1);
		return { min: minVal, max: maxVal, path: d, yTicks, xTickIndices, mapped: mappedPts, stepX };
	}, [points, height]);

	const onMouseMove = (e) => {
		if (!svgRef.current || !mapped.length) return;
		const rect = svgRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		// find nearest point by x
		let idx = 0, best = Infinity;
		for (let i = 0; i < mapped.length; i++) {
			const dx = Math.abs(mapped[i][0] - x);
			if (dx < best) {
				best = dx;
				idx = i;
			}
		}
		setHover({ idx, x: mapped[idx][0], y: mapped[idx][1], value: points[idx], label: labels[idx] });
	};

	// Moving average (window 7)
	const maPath = useMemo(() => {
		if (!showMA || points.length < 2) return "";
		const w = Math.min(7, points.length);
		const ma = points.map((_, i) => {
			const s = Math.max(0, i - w + 1);
			const slice = points.slice(s, i + 1);
			return slice.reduce((a, b) => a + b, 0) / slice.length;
		});
		const minVal = min;
		const maxVal = max;
		const spread = Math.max(1e-6, maxVal - minVal);
		const mapX = (i) => (i / Math.max(1, points.length - 1)) * innerW + padding.left;
		const mapY = (v) => padding.top + innerH - ((v - minVal) / spread) * innerH;
		return ma.map((v, i) => `${i === 0 ? "M" : "L"} ${mapX(i)} ${mapY(v)}`).join(" ");
	}, [points, min, max, innerW, innerH, padding.left, padding.top, showMA]);

	// Volume scaling (optional)
	const volumeRects = useMemo(() => {
		if (!volumePoints?.length) return [];
		const volPad = 0.28; // proportion of innerH for volume bars
		const volH = innerH * volPad;
		const baseY = padding.top + innerH; // bottom baseline
		const maxVol = Math.max(...volumePoints);
		const bars = volumePoints.map((v, i) => {
			const x = padding.left + i * stepX - Math.max(1, stepX * 0.35) / 2;
			const h = maxVol > 0 ? (v / maxVol) * volH : 0;
			return { x, y: baseY - h, w: Math.max(1, stepX * 0.35), h };
		});
		return bars;
	}, [volumePoints, innerH, padding.top, padding.left, stepX]);

	const effectivePointsLen = points.length === 1 ? 2 : points.length;
	return (
		<div className="relative w-full overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
			<svg
				ref={svgRef}
				viewBox={`0 0 ${width} ${height}`}
				className="block h-full w-full"
				preserveAspectRatio="none"
				onMouseMove={onMouseMove}
				onMouseLeave={() => setHover(null)}
			>
				<defs>
					<linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stopColor={color} stopOpacity="0.18" />
						<stop offset="100%" stopColor={color} stopOpacity="0" />
					</linearGradient>
				</defs>

				{/* Grid Y */}
				{yTicks.map((v, i) => {
					const y = padding.top + innerH - ((v - min) / Math.max(1e-6, max - min)) * innerH;
					return (
						<g key={i}>
							<line x1={padding.left} x2={padding.left + innerW} y1={y} y2={y} stroke="currentColor" className="text-gray-200 dark:text-gray-800" strokeWidth="1" />
							<text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-gray-400 dark:fill-gray-500" fontSize="10">
								{yFormatter(v)}
							</text>
						</g>
					);
				})}
				{/* Grid X — use spread indices so labels show different times (start, 1/4, 1/2, 3/4, end) */}
				{xTickIndices.map((idx, k) => {
					const x = padding.left + (idx / Math.max(1, effectivePointsLen - 1)) * innerW;
					const label = labels[idx];
					const displayLabel = textLabel(label) ? label : (effectivePointsLen <= 2 && idx === effectivePointsLen - 1 ? "Now" : effectivePointsLen <= 2 && idx === 0 ? "Earlier" : `#${idx + 1}`);
					return (
						<g key={k}>
							<line x1={x} x2={x} y1={padding.top} y2={padding.top + innerH} stroke="currentColor" className="text-gray-200 dark:text-gray-800" strokeWidth="1" />
							<text x={x} y={padding.top + innerH + 14} textAnchor="middle" className="fill-gray-400 dark:fill-gray-500" fontSize="10">
								{displayLabel}
							</text>
						</g>
					);
				})}

				{/* Volume bars (optional) */}
				{volumeRects.map((b, i) => (
					<rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="currentColor" className="text-gray-300 dark:text-gray-700" />
				))}

				{/* Area fill */}
				{showArea ? <path d={`${path} L ${padding.left + innerW} ${padding.top + innerH} L ${padding.left} ${padding.top + innerH} Z`} fill="url(#areaFill)" /> : null}
				{/* Line */}
				<path d={path} fill="none" stroke={color} strokeWidth="2.5" />
				{/* Moving average */}
				{showMA && maPath ? <path d={maPath} fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeDasharray="4 2" /> : null}

				{/* Hover marker */}
				{hover ? (
					<>
						<line x1={hover.x} x2={hover.x} y1={padding.top} y2={padding.top + innerH} stroke={color} strokeDasharray="4 4" />
						<circle cx={hover.x} cy={hover.y} r="3.5" fill={color} />
					</>
				) : null}
			</svg>

			{/* Tooltip */}
			{hover ? (
				<div
					className="pointer-events-none absolute -translate-x-1/2 rounded-md border bg-white px-2 py-1 text-xs text-gray-900 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:text-white dark:ring-gray-800"
					style={{ left: `${(hover.x / width) * 100}%`, top: 8 }}
				>
					<div className="font-semibold">{hover.value?.toLocaleString?.() ?? hover.value}</div>
					<div className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">{hover.label || `#${hover.idx + 1}`}</div>
				</div>
			) : null}
		</div>
	);
}

function textLabel(s) {
	return typeof s === "string" && s.length > 0;
}


