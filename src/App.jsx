import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/admin/ErrorBoundary";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Opportunities from "./pages/Opportunities";
import ProcurementTenders from "./pages/ProcurementTenders";
import NewsInsights from "./pages/NewsInsights";
import ToolsTemplates from "./pages/ToolsTemplates";
import Community from "./pages/Community";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NewsArticle from "./pages/NewsArticle";
import OpportunityDetail from "./pages/OpportunityDetail";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

export default function App() {
	return (
		<ErrorBoundary>
		<Routes>
			<Route element={<Layout />}>
				<Route index element={<Home />} />
				<Route path="opportunities" element={<Opportunities />} />
				<Route path="opportunities/:id" element={<OpportunityDetail />} />
				<Route path="procurement-tenders" element={<ProcurementTenders />} />
				<Route path="news-insights" element={<NewsInsights />} />
				<Route path="news/:slug" element={<NewsArticle />} />
				<Route path="tools-templates" element={<ToolsTemplates />} />
				<Route path="community" element={<Community />} />
				<Route path="about" element={<About />} />
				<Route path="contact" element={<Contact />} />
				<Route path="privacy-policy" element={<PrivacyPolicy />} />
				<Route path="*" element={<NotFound />} />
			</Route>
		</Routes>
		</ErrorBoundary>
	);
}
