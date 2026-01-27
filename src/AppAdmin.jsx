import { Routes, Route, Navigate } from "react-router-dom";
import AdminAuthGuard from "./components/admin/AdminAuthGuard";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminArticlesEdit from "./pages/admin/AdminArticlesEdit";
import AdminArticlesList from "./pages/admin/AdminArticlesList";
import AdminOpportunities from "./pages/admin/AdminOpportunities";
import AdminTenders from "./pages/admin/AdminTenders";

/**
 * Admin-only App - for subdomain deployment
 * Only includes admin routes, root (/) shows dashboard directly
 * Wrapped with AdminAuthGuard to require login on every new tab
 */
export default function AppAdmin() {
	return (
		<AdminAuthGuard>
			<Routes>
				{/* Admin Routes - no /admin prefix since we're on admin subdomain */}
				<Route element={<AdminLayout />}>
					<Route path="/" element={<AdminDashboard />} />
					<Route path="articles" element={<AdminArticlesList />} />
					<Route path="articles/new" element={<AdminArticles />} />
					<Route path="articles/edit/:slug" element={<AdminArticlesEdit />} />
					<Route path="opportunities" element={<AdminOpportunities />} />
					<Route path="tenders" element={<AdminTenders />} />
				</Route>
				
				{/* Catch all - redirect to root */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</AdminAuthGuard>
	);
}
