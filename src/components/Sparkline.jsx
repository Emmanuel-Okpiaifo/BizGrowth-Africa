export default function Sparkline({ points = [], color = "#16a34a" }) {
	const width = 120;
	const height = 36;
	const safePoints = Array.isArray(points) && points.length > 0 ? points : [];
	if (safePoints.length === 0) return null;
	// Need at least 2 points for a line; duplicate single point to avoid division by zero
	const pts = safePoints.length === 1 ? [safePoints[0], safePoints[0]] : safePoints;
	const min = Math.min(...pts);
	const max = Math.max(...pts);
	const norm = pts.map((v) =>
		height - ((v - min) / Math.max(1, max - min)) * (height - 6) - 3
	);
	const step = width / Math.max(1, pts.length - 1);
	const d = norm.map((y, i) => `${i === 0 ? "M" : "L"} ${i * step} ${y}`).join(" ");
	return (
		<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
			<path d={d} fill="none" stroke={color} strokeWidth="2" />
		</svg>
	);
}


