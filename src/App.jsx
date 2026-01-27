import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Opportunities from "./pages/Opportunities";
import ProcurementTenders from "./pages/ProcurementTenders";
import NewsInsights from "./pages/NewsInsights";
import ToolsTemplates from "./pages/ToolsTemplates";
import Community from "./pages/Community";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Markets from "./pages/Markets";
import MarketDetail from "./pages/MarketDetail";
import NewsArticle from "./pages/NewsArticle";
import OpportunityDetail from "./pages/OpportunityDetail";

export default function App() {
	return (
		<Routes>
			<Route element={<Layout />}>
				<Route index element={<Home />} />
				<Route path="markets" element={<Markets />} />
				<Route path="markets/:symbol" element={<MarketDetail />} />
				<Route path="opportunities" element={<Opportunities />} />
				<Route path="opportunities/:id" element={<OpportunityDetail />} />
				<Route path="procurement-tenders" element={<ProcurementTenders />} />
				<Route path="news-insights" element={<NewsInsights />} />
				<Route path="news/:slug" element={<NewsArticle />} />
				<Route path="tools-templates" element={<ToolsTemplates />} />
				<Route path="community" element={<Community />} />
				<Route path="about" element={<About />} />
				<Route path="contact" element={<Contact />} />
			</Route>
		</Routes>
	);
}
