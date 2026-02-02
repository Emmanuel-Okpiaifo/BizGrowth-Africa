import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Save, FileText, ArrowLeft, Clock, Upload, X } from 'lucide-react';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { appendSheetRow } from '../../utils/googleSheets';
import { ErrorBoundary } from '../../components/admin/ErrorBoundary';
import { toGMTPlus1ISO, getMinScheduleDateTime } from '../../utils/scheduling';
import { uploadImage } from '../../utils/imageUpload';
import { saveDraft, getDraft, deleteDraft } from '../../utils/draftStorage';

const CATEGORIES = ['IT & Telecoms', 'Construction', 'Healthcare', 'Energy', 'Logistics', 'Education', 'Agriculture'];

export default function AdminTenders() {
	const { draftId } = useParams();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		title: '',
		agency: '',
		category: '',
		country: '',
		region: '',
		deadline: '',
		postedAt: new Date().toISOString().split('T')[0],
		link: '',
		description: '',
		eligibility: '',
		value: '',
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
			const draft = getDraft('tenders', draftId);
			if (draft) {
				setFormData({
					title: draft.title || '',
					agency: draft.agency || '',
					category: draft.category || '',
					country: draft.country || '',
					region: draft.region || '',
					deadline: draft.deadline || '',
					postedAt: draft.postedAt || new Date().toISOString().split('T')[0],
					link: draft.link || '',
					description: draft.description || '',
					eligibility: draft.eligibility || '',
					value: draft.value || '',
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
			// Determine status and scheduledAt
			let postStatus = 'published';
			let scheduledAt = '';
			
			if (isScheduled && scheduledDateTime) {
				postStatus = 'scheduled';
				scheduledAt = toGMTPlus1ISO(scheduledDateTime);
			}

			const success = await appendSheetRow('Tenders', {
				title: formData.title,
				agency: formData.agency,
				category: formData.category,
				country: formData.country,
				region: formData.region,
				deadline: formData.deadline,
				postedAt: formData.postedAt,
				link: formData.link,
				description: formData.description,
				eligibility: formData.eligibility,
				value: formData.value,
				heroImage: formData.heroImage || '',
				status: postStatus,
				scheduledAt: scheduledAt,
				createdAt: new Date().toISOString()
			});

			if (success) {
				// Delete draft from localStorage if it was a draft
				if (currentDraftId) {
					deleteDraft('tenders', currentDraftId);
					setCurrentDraftId(null);
				}

				const message = isScheduled && scheduledDateTime
					? `Tender scheduled successfully! It will be published on ${new Date(scheduledDateTime).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })} (GMT+1).`
					: 'Tender published successfully!';
				setStatus({ type: 'success', message });
				// Redirect to tenders list after a short delay
				setTimeout(() => {
					navigate('/tenders');
				}, 1500);
			} else {
				setStatus({ type: 'error', message: 'Failed to save tender. Please try again.' });
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
						to="/tenders"
						className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
					>
						<ArrowLeft size={18} />
					</Link>
					<FileText className="w-6 h-6 text-primary" />
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Tender</h1>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Title & Agency */}
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
							placeholder="Tender title"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Agency/Organization
						</label>
						<input
							type="text"
							value={formData.agency}
							onChange={(e) => setFormData(prev => ({ ...prev, agency: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
							placeholder="Agency name"
						/>
					</div>
				</div>

				{/* Category, Country, Region */}
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
							Country
						</label>
						<input
							type="text"
							value={formData.country}
							onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
							placeholder="Country"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Region
						</label>
						<input
							type="text"
							value={formData.region}
							onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
							placeholder="Region"
						/>
					</div>
				</div>

				{/* Dates, Link, Value */}
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
							Tender Value
						</label>
						<input
							type="text"
							value={formData.value}
							onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
							placeholder="Tender value"
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Tender Link
					</label>
					<input
						type="url"
						value={formData.link}
						onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
						className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						placeholder="https://..."
					/>
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
												const url = await uploadImage(file, 'tenders');
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
									placeholder="Or enter image URL"
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
						type="tenders"
					/>
				</div>

				{/* Eligibility */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Eligibility Requirements
					</label>
					<textarea
						value={formData.eligibility}
						onChange={(e) => setFormData(prev => ({ ...prev, eligibility: e.target.value }))}
						rows={4}
						className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
						placeholder="Eligibility requirements..."
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
								const tenderData = {
									title: formData.title,
									agency: formData.agency || '',
									category: formData.category || '',
									country: formData.country || '',
									region: formData.region || '',
									deadline: formData.deadline || '',
									postedAt: formData.postedAt,
									link: formData.link || '',
									description: formData.description || '',
									eligibility: formData.eligibility || '',
									value: formData.value || '',
									heroImage: formData.heroImage || ''
								};

								// Save to localStorage (NOT Google Sheets)
								const savedDraftId = saveDraft('tenders', tenderData, currentDraftId);
								setCurrentDraftId(savedDraftId);

								setStatus({ 
									type: 'success', 
									message: currentDraftId 
										? 'Draft updated! Continue editing or publish when ready.' 
										: 'Tender saved as draft! You can continue editing later.' 
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
						{isSubmitting ? 'Saving...' : isScheduled ? 'Schedule Post' : 'Publish Tender'}
					</button>
				</div>
			</form>
			</div>
		</ErrorBoundary>
	);
}
