import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Save, FileText, ArrowLeft, Clock, Image as ImageIcon, Upload, X } from 'lucide-react';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { appendSheetRow } from '../../utils/googleSheets';
import { ErrorBoundary } from '../../components/admin/ErrorBoundary';
import { toGMTPlus1ISO, getMinScheduleDateTime } from '../../utils/scheduling';
import { uploadImage } from '../../utils/imageUpload';
import { saveDraft, getDraft, deleteDraft } from '../../utils/draftStorage';

const CATEGORIES = ['Fintech', 'Policy', 'Funding', 'Markets', 'SMEs', 'Reports'];

export default function AdminArticles() {
	const { draftId } = useParams();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		title: '',
		slug: '',
		category: '',
		subheading: '',
		summary: '',
		content: '',
		image: '',
		heroImage: '',
		publishedAt: new Date().toISOString().split('T')[0],
		author: 'BizGrowth Africa Editorial'
	});
	const [isScheduled, setIsScheduled] = useState(false);
	const [scheduledDateTime, setScheduledDateTime] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [status, setStatus] = useState({ type: null, message: '' });
	const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
	const [currentDraftId, setCurrentDraftId] = useState(draftId || null);

	// Load draft if editing
	useEffect(() => {
		if (draftId) {
			const draft = getDraft('articles', draftId);
			if (draft) {
				setFormData({
					title: draft.title || '',
					slug: draft.slug || '',
					category: draft.category || '',
					subheading: draft.subheading || '',
					summary: draft.summary || '',
					content: draft.content || '',
					image: draft.image || '',
					heroImage: draft.heroImage || '',
					publishedAt: draft.publishedAt || new Date().toISOString().split('T')[0],
					author: draft.author || 'BizGrowth Africa Editorial'
				});
				setCurrentDraftId(draftId);
				setStatus({ type: 'success', message: 'Draft loaded. Continue editing...' });
			}
		}
	}, [draftId]);

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
			// Determine status and scheduledAt
			let postStatus = 'published';
			let scheduledAt = '';
			
			if (isScheduled && scheduledDateTime) {
				postStatus = 'scheduled';
				scheduledAt = toGMTPlus1ISO(scheduledDateTime);
				console.log('Scheduling article:', {
					selectedTime: scheduledDateTime,
					convertedToUTC: scheduledAt,
					status: postStatus
				});
			}
			
			const articleData = {
				title: formData.title,
				slug: formData.slug,
				category: formData.category,
				subheading: formData.subheading,
				summary: formData.summary,
				content: formData.content,
				image: formData.image,
				heroImage: formData.heroImage,
				publishedAt: formData.publishedAt,
				author: formData.author,
				status: postStatus,
				scheduledAt: scheduledAt || '', // Always include, even if empty
				createdAt: new Date().toISOString()
			};

			console.log('Saving article with data:', articleData);
			const success = await appendSheetRow('Articles', articleData);

			if (success) {
				// Delete draft from localStorage if it was a draft
				if (currentDraftId) {
					deleteDraft('articles', currentDraftId);
					setCurrentDraftId(null);
				}

				const message = isScheduled && scheduledDateTime
					? `Article scheduled successfully! It will be published on ${new Date(scheduledDateTime).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })} (GMT+1).`
					: 'Article published successfully! Check your Google Sheet to verify.';
				setStatus({ type: 'success', message });
				
				// Reset form and redirect after a delay
				setTimeout(() => {
					setFormData({
						title: '',
						slug: '',
						category: '',
						subheading: '',
						summary: '',
						content: '',
						image: '',
						heroImage: '',
						publishedAt: new Date().toISOString().split('T')[0],
						author: 'BizGrowth Africa Editorial'
					});
					setIsScheduled(false);
					setScheduledDateTime('');
					navigate('/articles');
				}, 2000);
				setIsScheduled(false);
				setScheduledDateTime('');
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

				{/* Category */}
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

				{/* Hero Image (Banner) */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Hero Image (Banner) <span className="text-xs text-gray-500 dark:text-gray-400">- Displays in hero section</span>
					</label>
					<div className="space-y-3">
						{formData.heroImage ? (
							<div className="relative rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
								<img 
									src={formData.heroImage} 
									alt="Hero preview" 
									className="w-full h-48 object-cover"
									onLoad={() => console.log('Hero image preview loaded:', formData.heroImage)}
									onError={(e) => {
										console.warn('Hero image preview failed to load (may work on website):', formData.heroImage);
										// Don't hide or alert - just log it
									}}
								/>
								<button
									type="button"
									onClick={() => setFormData(prev => ({ ...prev, heroImage: '' }))}
									className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
								>
									<X size={16} />
								</button>
								<div className="p-3 bg-gray-50 dark:bg-gray-800">
									<p className="text-xs text-gray-600 dark:text-gray-400 break-all">{formData.heroImage}</p>
								</div>
							</div>
						) : (
							<div className="flex gap-3">
								<button
									type="button"
									onClick={async () => {
										const input = document.createElement('input');
										input.type = 'file';
										input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
										input.onchange = async (e) => {
											const file = e.target.files?.[0];
											if (!file) return;
											
											setUploadingHeroImage(true);
											try {
												const url = await uploadImage(file, 'articles');
												console.log('Hero image uploaded, URL:', url);
												
												// Wait a moment for the file to be fully written
												await new Promise(resolve => setTimeout(resolve, 500));
												
												// Set the URL immediately - preview will handle loading
												setFormData(prev => ({ ...prev, heroImage: url }));
												
												// Test if image loads (silently, no alert)
												const img = new Image();
												img.crossOrigin = 'anonymous';
												img.onload = () => {
													console.log('Hero image preview loaded successfully');
												};
												img.onerror = () => {
													console.warn('Hero image preview failed to load (may work on website):', url);
													// Don't show alert - just log it
												};
												img.src = url;
											} catch (error) {
												console.error('Hero image upload error:', error);
												alert(`Upload failed: ${error.message}`);
											} finally {
												setUploadingHeroImage(false);
											}
										};
										input.click();
									}}
									disabled={uploadingHeroImage}
									className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{uploadingHeroImage ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
											<span>Uploading...</span>
										</>
									) : (
										<>
											<Upload size={16} />
											<span>Upload Hero Image</span>
										</>
									)}
								</button>
								<input
									type="url"
									value={formData.heroImage}
									onChange={(e) => setFormData(prev => ({ ...prev, heroImage: e.target.value }))}
									className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
									placeholder="Or enter image URL"
								/>
							</div>
						)}
					</div>
				</div>

				{/* Content Image URL (for article content) */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Content Image URL <span className="text-xs text-gray-500 dark:text-gray-400">- Optional, for article content</span>
					</label>
					<input
						type="url"
						value={formData.image}
						onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
						className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						placeholder="https://example.com/image.jpg"
					/>
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

				{/* Schedule Post */}
				<div className="border-t border-gray-200 dark:border-gray-700 pt-6">
					<label className="flex items-center gap-3 cursor-pointer mb-4">
						<input
							type="checkbox"
							checked={isScheduled}
							onChange={(e) => {
								setIsScheduled(e.target.checked);
								if (!e.target.checked) {
									setScheduledDateTime('');
								}
							}}
							className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
						/>
						<div className="flex items-center gap-2">
							<Clock size={18} className="text-primary" />
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Schedule this post for later (GMT+1)
							</span>
						</div>
					</label>
					
					{isScheduled && (
						<div className="ml-8">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Schedule Date & Time (GMT+1)
							</label>
							<input
								type="datetime-local"
								value={scheduledDateTime}
								onChange={(e) => setScheduledDateTime(e.target.value)}
								min={getMinScheduleDateTime()}
								required={isScheduled}
								className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
							/>
							<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
								The post will be published automatically at the selected time (GMT+1).
							</p>
						</div>
					)}
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

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
					<button
						type="button"
						onClick={async (e) => {
							e.preventDefault();
							setIsSubmitting(true);
							setStatus({ type: null, message: '' });

							// Validation - only require title for draft
							if (!formData.title) {
								setStatus({ type: 'error', message: 'Title is required to save as draft.' });
								setIsSubmitting(false);
								return;
							}

							try {
								const articleData = {
									title: formData.title,
									slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
									category: formData.category || '',
									subheading: formData.subheading || '',
									summary: formData.summary || '',
									content: formData.content || '',
									image: formData.image || '',
									heroImage: formData.heroImage || '',
									publishedAt: formData.publishedAt,
									author: formData.author
								};

								// Save to localStorage (NOT Google Sheets)
								const savedDraftId = saveDraft('articles', articleData, currentDraftId);
								setCurrentDraftId(savedDraftId);

								setStatus({ 
									type: 'success', 
									message: currentDraftId 
										? 'Draft updated! Continue editing or publish when ready.' 
										: 'Article saved as draft! You can continue editing later.' 
								});
							} catch (error) {
								console.error('Error saving draft:', error);
								setStatus({ type: 'error', message: error.message || 'An error occurred.' });
							} finally {
								setIsSubmitting(false);
							}
						}}
						disabled={isSubmitting}
						className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<FileText size={18} />
						{isSubmitting ? 'Saving...' : 'Save as Draft'}
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Save size={18} />
						{isSubmitting ? 'Saving...' : isScheduled ? 'Schedule Post' : 'Publish Article'}
					</button>
				</div>
			</form>
			</div>
		</ErrorBoundary>
	);
}
