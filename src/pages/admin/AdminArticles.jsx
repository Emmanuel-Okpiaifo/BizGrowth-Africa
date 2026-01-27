import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Save, FileText, ArrowLeft } from 'lucide-react';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { appendSheetRow } from '../../utils/googleSheets';
import { ErrorBoundary } from '../../components/admin/ErrorBoundary';

const CATEGORIES = ['Fintech', 'Policy', 'Funding', 'Markets', 'SMEs', 'Reports'];

export default function AdminArticles() {
	const [formData, setFormData] = useState({
		title: '',
		slug: '',
		category: '',
		subheading: '',
		summary: '',
		content: '',
		image: '',
		publishedAt: new Date().toISOString().split('T')[0],
		author: 'BizGrowth Africa Editorial'
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [status, setStatus] = useState({ type: null, message: '' });

	// Auto-generate slug from title
	const handleTitleChange = (e) => {
		const title = e.target.value;
		const slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
		
		setFormData(prev => ({
			...prev,
			title,
			slug
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setStatus({ type: null, message: '' });

		// Validation
		if (!formData.title || !formData.content || !formData.category) {
			setStatus({ type: 'error', message: 'Please fill in all required fields.' });
			setIsSubmitting(false);
			return;
		}

		try {
			const articleData = {
				title: formData.title,
				slug: formData.slug,
				category: formData.category,
				subheading: formData.subheading,
				summary: formData.summary,
				content: formData.content,
				image: formData.image,
				publishedAt: formData.publishedAt,
				author: formData.author,
				createdAt: new Date().toISOString()
			};

			console.log('Saving article:', articleData);
			const success = await appendSheetRow('Articles', articleData);

			if (success) {
				setStatus({ type: 'success', message: 'Article created successfully! Check your Google Sheet to verify.' });
				// Reset form
				setFormData({
					title: '',
					slug: '',
					category: '',
					subheading: '',
					summary: '',
					content: '',
					image: '',
					publishedAt: new Date().toISOString().split('T')[0],
					author: 'BizGrowth Africa Editorial'
				});
			} else {
				setStatus({ type: 'error', message: 'Failed to save article. Please check: 1) Your Google Sheet has a tab named "Articles" (exact match), 2) Column headers match the expected format, 3) Check browser console for details.' });
			}
		} catch (error) {
			console.error('Error saving article:', error);
			setStatus({ type: 'error', message: error.message || 'An error occurred. Check the browser console for details.' });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<ErrorBoundary>
			<div className="max-w-5xl mx-auto space-y-6">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<Link
							to="/articles"
							className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
						>
							<ArrowLeft size={18} />
						</Link>
						<FileText className="w-6 h-6 text-primary" />
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Article</h1>
					</div>
				</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Title */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Title <span className="text-primary">*</span>
					</label>
					<input
						type="text"
						value={formData.title}
						onChange={handleTitleChange}
						required
						className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						placeholder="Enter article title"
					/>
				</div>

				{/* Slug */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Slug (auto-generated)
					</label>
					<input
						type="text"
						value={formData.slug}
						onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
						className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-gray-600 dark:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						placeholder="article-slug"
					/>
				</div>

				{/* Category & Image */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Category <span className="text-primary">*</span>
						</label>
						<select
							value={formData.category}
							onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
							required
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						>
							<option value="">Select category</option>
							{CATEGORIES.map(cat => (
								<option key={cat} value={cat}>{cat}</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Image URL
						</label>
						<input
							type="url"
							value={formData.image}
							onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
							placeholder="https://example.com/image.jpg"
						/>
					</div>
				</div>

				{/* Subheading & Summary */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Subheading
					</label>
					<input
						type="text"
						value={formData.subheading}
						onChange={(e) => setFormData(prev => ({ ...prev, subheading: e.target.value }))}
						className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						placeholder="Brief subheading"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Summary
					</label>
					<textarea
						value={formData.summary}
						onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
						rows={3}
						className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
						placeholder="Brief summary of the article"
					/>
				</div>

				{/* Content */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Content <span className="text-primary">*</span>
					</label>
					<RichTextEditor
						value={formData.content}
						onChange={(content) => setFormData(prev => ({ ...prev, content }))}
						type="articles"
					/>
				</div>

				{/* Published Date */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Published Date
					</label>
					<input
						type="date"
						value={formData.publishedAt}
						onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
						className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
					/>
				</div>

				{/* Status Message */}
				{status.type && (
					<div className={`rounded-lg p-4 ${
						status.type === 'success' 
							? 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
							: 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
					}`}>
						{status.message}
					</div>
				)}

				{/* Submit Button */}
				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full md:w-auto inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<Save size={18} />
					{isSubmitting ? 'Saving...' : 'Save Article'}
				</button>
			</form>
			</div>
		</ErrorBoundary>
	);
}
