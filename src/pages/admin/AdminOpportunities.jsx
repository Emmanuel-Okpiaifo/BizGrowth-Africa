import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Save, Briefcase, ArrowLeft, Clock, Upload, X, FileText } from 'lucide-react';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { appendSheetRow } from '../../utils/googleSheets';
import { ErrorBoundary } from '../../components/admin/ErrorBoundary';
import { toGMTPlus1ISO, getMinScheduleDateTime } from '../../utils/scheduling';
import { uploadImage } from '../../utils/imageUpload';
import { saveDraft, getDraft, deleteDraft } from '../../utils/draftStorage';
import { getCurrentUser } from '../../utils/adminAuth';
import CurrencySelect from '../../components/admin/CurrencySelect';

const CATEGORIES = ['Grant', 'Accelerator', 'Competition', 'Fellowship', 'Training', 'Impact Loan', 'Scholarship'];
const REGIONS = ['West Africa', 'East Africa', 'Southern Africa', 'Central Africa', 'North Africa', 'Sub-Saharan Africa', 'Pan-African'];

export default function AdminOpportunities() {
	const { draftId } = useParams();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		title: '',
		org: '',
		country: '',
		region: '',
		category: '',
		amountMin: '',
		amountMax: '',
		currency: 'USD',
		deadline: '',
		postedAt: new Date().toISOString().split('T')[0],
		link: '',
		tags: '',
		featured: false,
		description: '',
		heroImage: ''
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
			const draft = getDraft('opportunities', draftId);
			if (draft) {
				setFormData({
					title: draft.title || '',
					org: draft.org || '',
					country: draft.country || '',
					region: draft.region || '',
					category: draft.category || '',
					amountMin: draft.amountMin || '',
					amountMax: draft.amountMax || '',
					currency: draft.currency || 'USD',
					deadline: draft.deadline || '',
					postedAt: draft.postedAt || new Date().toISOString().split('T')[0],
					link: draft.link || '',
					tags: Array.isArray(draft.tags) ? draft.tags.join(', ') : (draft.tags || ''),
					featured: draft.featured === true || draft.featured === 'true',
					description: draft.description || '',
					heroImage: draft.heroImage || ''
				});
				setCurrentDraftId(draftId);
				setStatus({ type: 'success', message: 'Draft loaded. Continue editing...' });
			}
		}
	}, [draftId]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setStatus({ type: null, message: '' });

		// Validation
		if (!formData.title || !formData.description || !formData.category) {
			setStatus({ type: 'error', message: 'Please fill in all required fields.' });
			setIsSubmitting(false);
			return;
		}

		try {
			// Process tags
			const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

			// Determine status and scheduledAt
			let postStatus = 'published';
			let scheduledAt = '';
			
			if (isScheduled && scheduledDateTime) {
				postStatus = 'scheduled';
				scheduledAt = toGMTPlus1ISO(scheduledDateTime);
			}

			const success = await appendSheetRow('Opportunities', {
				title: formData.title,
				org: formData.org,
				country: formData.country,
				region: formData.region,
				category: formData.category,
				amountMin: formData.amountMin || 0,
				amountMax: formData.amountMax || 0,
				currency: formData.currency,
				deadline: formData.deadline,
				postedAt: formData.postedAt,
				link: formData.link,
				tags: JSON.stringify(tagsArray),
				featured: formData.featured ? 'true' : 'false',
				description: formData.description,
				heroImage: formData.heroImage || '',
				author: getCurrentUser() || '',
				status: postStatus,
				scheduledAt: scheduledAt,
				createdAt: new Date().toISOString()
			});

			if (success) {
				// Delete draft from localStorage if it was a draft
				if (currentDraftId) {
					deleteDraft('opportunities', currentDraftId);
					setCurrentDraftId(null);
				}

				const message = isScheduled && scheduledDateTime
					? `Opportunity scheduled successfully! It will be published on ${new Date(scheduledDateTime).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })} (GMT+1).`
					: 'Opportunity published successfully!';
				setStatus({ type: 'success', message });
				// Redirect to opportunities list after a short delay
				setTimeout(() => {
					navigate('/opportunities');
				}, 1500);
			} else {
				setStatus({ type: 'error', message: 'Failed to save opportunity. Please try again.' });
			}
		} catch (error) {
			setStatus({ type: 'error', message: error.message || 'An error occurred.' });
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
						to="/opportunities"
						className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
					>
						<ArrowLeft size={18} />
					</Link>
					<Briefcase className="w-6 h-6 text-primary" />
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Opportunity</h1>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Title & Organization */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Title <span className="text-primary">*</span>
						</label>
						<input
							type="text"
							value={formData.title}
							onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
							required
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Organization
						</label>
						<input
							type="text"
							value={formData.org}
							onChange={(e) => setFormData(prev => ({ ...prev, org: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						/>
					</div>
				</div>

				{/* Category, Region, Country */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
							Region
						</label>
						<select
							value={formData.region}
							onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						>
							<option value="">Select region</option>
							{REGIONS.map(reg => (
								<option key={reg} value={reg}>{reg}</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Country
						</label>
						<input
							type="text"
							value={formData.country}
							onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						/>
					</div>
				</div>

				{/* Amount */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Min Amount
						</label>
						<input
							type="number"
							value={formData.amountMin}
							onChange={(e) => setFormData(prev => ({ ...prev, amountMin: e.target.value }))}
							min="0"
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Max Amount
						</label>
						<input
							type="number"
							value={formData.amountMax}
							onChange={(e) => setFormData(prev => ({ ...prev, amountMax: e.target.value }))}
							min="0"
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						/>
					</div>

					<div>
						<CurrencySelect
							value={formData.currency}
							onChange={(code) => setFormData(prev => ({ ...prev, currency: code }))}
						/>
					</div>
				</div>

				{/* Dates & Link */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Deadline
						</label>
						<input
							type="date"
							value={formData.deadline}
							onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Posted Date
						</label>
						<input
							type="date"
							value={formData.postedAt}
							onChange={(e) => setFormData(prev => ({ ...prev, postedAt: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Application Link
						</label>
						<input
							type="url"
							value={formData.link}
							onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						/>
					</div>
				</div>

				{/* Tags & Featured */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Tags (comma-separated)
						</label>
						<input
							type="text"
							value={formData.tags}
							onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						/>
					</div>

					<div className="flex items-end">
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={formData.featured}
								onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
								className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
							/>
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Opportunity</span>
						</label>
					</div>
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
												const url = await uploadImage(file, 'opportunities');
												setFormData(prev => ({ ...prev, heroImage: url }));
											} catch (error) {
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
								/>
							</div>
						)}
					</div>
				</div>

				{/* Description */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Description <span className="text-primary">*</span>
					</label>
					<RichTextEditor
						value={formData.description}
						onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
						type="opportunities"
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

							if (!formData.title) {
								setStatus({ type: 'error', message: 'Title is required to save as draft.' });
								setIsSubmitting(false);
								return;
							}

							try {
								const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
								const opportunityData = {
									title: formData.title,
									org: formData.org || '',
									country: formData.country || '',
									region: formData.region || '',
									category: formData.category || '',
									amountMin: formData.amountMin || 0,
									amountMax: formData.amountMax || 0,
									currency: formData.currency || 'USD',
									deadline: formData.deadline || '',
									postedAt: formData.postedAt,
									link: formData.link || '',
									tags: tagsArray,
									featured: formData.featured || false,
									description: formData.description || '',
									heroImage: formData.heroImage || ''
								};

								// Save to localStorage (NOT Google Sheets)
								const savedDraftId = saveDraft('opportunities', opportunityData, currentDraftId);
								setCurrentDraftId(savedDraftId);

								setStatus({ 
									type: 'success', 
									message: currentDraftId 
										? 'Draft updated! Continue editing or publish when ready.' 
										: 'Opportunity saved as draft! You can continue editing later.' 
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
						<Briefcase size={18} />
						{isSubmitting ? 'Saving...' : 'Save as Draft'}
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Save size={18} />
						{isSubmitting ? 'Saving...' : isScheduled ? 'Schedule Post' : 'Publish Opportunity'}
					</button>
				</div>
			</form>
			</div>
		</ErrorBoundary>
	);
}
