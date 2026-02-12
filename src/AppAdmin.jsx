import { Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "./components/admin/ErrorBoundary";
import AdminAuthGuard from "./components/admin/AdminAuthGuard";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminArticlesEdit from "./pages/admin/AdminArticlesEdit";
import AdminArticlesList from "./pages/admin/AdminArticlesList";
import AdminOpportunities from "./pages/admin/AdminOpportunities";
import AdminOpportunitiesEdit from "./pages/admin/AdminOpportunitiesEdit";
import AdminOpportunitiesList from "./pages/admin/AdminOpportunitiesList";
import AdminTenders from "./pages/admin/AdminTenders";
import AdminTendersList from "./pages/admin/AdminTendersList";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminActivity from "./pages/admin/AdminActivity";

/**
 * Admin-only App - for subdomain deployment
 * Only includes admin routes, root (/) shows dashboard directly
 * Wrapped with AdminAuthGuard to require login on every new tab
 */
export default function AppAdmin() {
	return (
		<ErrorBoundary>
		<AdminAuthGuard>
			<Routes>
				{/* Admin Routes - no /admin prefix since we're on admin subdomain */}
				<Route element={<AdminLayout />}>
					<Route path="/" element={<AdminDashboard />} />
					<Route path="articles" element={<AdminArticlesList />} />
					<Route path="articles/new" element={<AdminArticles />} />
					<Route path="articles/new/:draftId" element={<AdminArticles />} />
					<Route path="articles/edit/:slug" element={<AdminArticlesEdit />} />
					<Route path="opportunities" element={<AdminOpportunitiesList />} />
					<Route path="opportunities/new" element={<AdminOpportunities />} />
					<Route path="opportunities/new/:draftId" element={<AdminOpportunities />} />
					<Route path="opportunities/edit/:id" element={<AdminOpportunitiesEdit />} />
					<Route path="tenders" element={<AdminTendersList />} />
					<Route path="tenders/new" element={<AdminTenders />} />
					<Route path="tenders/new/:draftId" element={<AdminTenders />} />
					<Route path="profile" element={<AdminProfile />} />
					<Route path="activity" element={<AdminActivity />} />
				</Route>
				
				{/* Catch all - redirect to root */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</AdminAuthGuard>
		</ErrorBoundary>
	);
}
