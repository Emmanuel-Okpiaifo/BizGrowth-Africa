import SectionHeader from "./SectionHeader";
import { Link } from "react-router-dom";
import NewsInlineCard from "./NewsInlineCard";

export default function EditorsPicks({ items }) {
	return (
		<section className="relative">
			<SectionHeader
				title="Editor’s Picks"
				action={
					<Link to="/news-insights" className="text-sm font-semibold text-primary">See all</Link>
				}
			/>
			<div className="no-scrollbar -mx-4 overflow-x-auto px-4">
				<div className="flex gap-4">
					{items.map((a, i) => (
						<NewsInlineCard key={`${a.title}-${i}`} article={a} />
					))}
				</div>
			</div>
			<style>{`
				.no-scrollbar::-webkit-scrollbar { display: none; }
				.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
			`}</style>
		</section>
	);
}


