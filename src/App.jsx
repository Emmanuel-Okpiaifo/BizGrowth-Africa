import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLayout from "./components/admin/AdminLayout";
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
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminArticlesEdit from "./pages/admin/AdminArticlesEdit";
import AdminArticlesList from "./pages/admin/AdminArticlesList";
import AdminOpportunities from "./pages/admin/AdminOpportunities";
import AdminTenders from "./pages/admin/AdminTenders";

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
			
			{/* Admin Routes */}
			<Route element={<AdminLayout />}>
				<Route path="admin" element={<AdminDashboard />} />
				<Route path="admin/articles" element={<AdminArticlesList />} />
				<Route path="admin/articles/new" element={<AdminArticles />} />
				<Route path="admin/articles/edit/:slug" element={<AdminArticlesEdit />} />
				<Route path="admin/opportunities" element={<AdminOpportunities />} />
				<Route path="admin/tenders" element={<AdminTenders />} />
			</Route>
		</Routes>
	);
}
