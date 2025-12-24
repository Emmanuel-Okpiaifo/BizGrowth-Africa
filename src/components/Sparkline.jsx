export default function Sparkline({ points = [], color = "#16a34a" }) {
	const width = 120;
	const height = 36;
	if (!points.length) return null;
	const min = Math.min(...points);
	const max = Math.max(...points);
	const norm = points.map((v) =>
		height - ((v - min) / Math.max(1, max - min)) * (height - 6) - 3
	);
	const step = width / (points.length - 1);
	const d = norm.map((y, i) => `${i === 0 ? "M" : "L"} ${i * step} ${y}`).join(" ");
	return (
		<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
			<path d={d} fill="none" stroke={color} strokeWidth="2" />
		</svg>
	);
}


