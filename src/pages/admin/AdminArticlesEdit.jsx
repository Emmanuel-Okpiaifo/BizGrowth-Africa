import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Save, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { updateSheetRow, getSheetData } from '../../utils/googleSheets';
import { ErrorBoundary } from '../../components/admin/ErrorBoundary';

const CATEGORIES = ['Fintech', 'Policy', 'Funding', 'Markets', 'SMEs', 'Reports'];

export default function AdminArticlesEdit() {
	const { slug } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [formData, setFormData] = useState({
		title: '',
		slug: '',
		category: '',
		subheading: '',
		summary: '',
		content: '',
		image: '',
		heroImage: '',
		whyItMatters: '',
		publishedAt: new Date().toISOString().split('T')[0],
		author: 'BizGrowth Africa Editorial'
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [status, setStatus] = useState({ type: null, message: '' });
	const [rowIndex, setRowIndex] = useState(null);

	// Load article data
	useEffect(() => {
		const loadArticle = async () => {
			try {
				setLoading(true);
				const data = await getSheetData('Articles');
				console.log('Loaded articles for editing:', data);
				
				// Find the article by slug
				const articleIndex = data.findIndex((a) => {
					const articleSlug = (a.slug || '').trim();
					return articleSlug === slug;
				});
				
				if (articleIndex === -1) {
					setStatus({ type: 'error', message: 'Article not found' });
					setLoading(false);
					return;
				}
				
				const article = data[articleIndex];
				console.log('Found article to edit:', article);
				
				// Calculate row index for Google Sheets
				// Apps Script expects: data.row where row 1 = first data row (row 2 in sheet)
				// So if article is at index 0 in data array, data.row should be 1
				// Formula: data.row = arrayIndex + 1
				const sheetRowIndex = articleIndex + 1;
				setRowIndex(sheetRowIndex);
				console.log('Article row index for Apps Script (data.row):', sheetRowIndex);
				
				// Populate form with article data
				setFormData({
					title: (article.title || '').trim(),
					slug: (article.slug || '').trim(),
					category: (article.category || '').trim(),
					subheading: (article.subheading || '').trim(),
					summary: (article.summary || '').trim(),
					content: (article.content || '').trim(),
					image: (article.image || '').trim(),
					heroImage: (article.heroImage || '').trim(),
					whyItMatters: (article.whyitmatters ?? article['why it matters'] ?? article.whyItMatters ?? '').toString().trim(),
					publishedAt: article.publishedAt ? article.publishedAt.split('T')[0] : (article.createdAt ? article.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
					author: (article.author || 'BizGrowth Africa Editorial').trim(),
					createdAt: article.createdAt || new Date().toISOString()
				});
			} catch (error) {
				console.error('Failed to load article:', error);
				setStatus({ type: 'error', message: 'Failed to load article. Please try again.' });
			} finally {
				setLoading(false);
			}
		};

		if (slug) {
			loadArticle();
		}
	}, [slug]);

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

		if (!rowIndex) {
			setStatus({ type: 'error', message: 'Unable to determine article row. Please try again.' });
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
				image: formData.image || '',
				heroImage: formData.heroImage || '',
				whyItMatters: formData.whyItMatters || '',
				publishedAt: formData.publishedAt,
				author: formData.author,
				createdAt: formData.createdAt || new Date().toISOString()
			};

			console.log('Updating article at row:', rowIndex);
			const success = await updateSheetRow('Articles', rowIndex, articleData);

			if (success) {
				setStatus({ type: 'success', message: 'Article updated successfully!' });
				// Redirect to articles list after a short delay
				setTimeout(() => {
					navigate('/articles');
				}, 1500);
			} else {
				setStatus({ type: 'error', message: 'Failed to update article. Please try again.' });
			}
		} catch (error) {
			console.error('Error updating article:', error);
			setStatus({ type: 'error', message: error.message || 'An error occurred. Check the browser console for details.' });
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
					<p className="text-gray-600 dark:text-gray-400">Loading article...</p>
				</div>
			</div>
		);
	}

	// No slug in URL (invalid route)
	if (!slug || !String(slug).trim()) {
		return (
			<div className="max-w-5xl mx-auto">
				<div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-8 text-center">
					<h2 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-2">Invalid URL</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-4">No article slug was provided. Please go to the articles list and choose an article to edit.</p>
					<Link to="/articles" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
						<ArrowLeft size={18} /> Back to Articles
					</Link>
				</div>
			</div>
		);
	}

	// Article not found in sheet
	if (status.type === 'error' && status.message === 'Article not found') {
		return (
			<div className="max-w-5xl mx-auto">
				<div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-8 text-center">
					<h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Article not found</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-4">No article with slug &quot;{slug}&quot; was found. It may have been deleted or the slug may be incorrect.</p>
					<Link to="/articles" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
						<ArrowLeft size={18} /> Back to Articles
					</Link>
				</div>
			</div>
		);
	}

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
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Article</h1>
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
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Hero image URL (featured)
							</label>
							<input
								type="url"
								value={formData.heroImage}
								onChange={(e) => setFormData(prev => ({ ...prev, heroImage: e.target.value }))}
								className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
								placeholder="https://example.com/hero.jpg"
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

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Why it matters for African MSMEs
						</label>
						<textarea
							value={formData.whyItMatters}
							onChange={(e) => setFormData(prev => ({ ...prev, whyItMatters: e.target.value }))}
							rows={3}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
							placeholder="1–2 sentences on why this story matters for African small businesses"
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
						{isSubmitting ? 'Updating...' : 'Update Article'}
					</button>
				</form>
			</div>
		</ErrorBoundary>
	);
}
