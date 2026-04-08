import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Save, FileText, ArrowLeft, Clock, Upload, X } from 'lucide-react';
import { appendSheetRow, getSheetData, updateSheetRow } from '../../utils/googleSheets';
import { ErrorBoundary } from '../../components/admin/ErrorBoundary';
import { toGMTPlus1ISO, getMinScheduleDateTime } from '../../utils/scheduling';
import { uploadImage } from '../../utils/imageUpload';
import { saveDraft, getDraft, deleteDraft } from '../../utils/draftStorage';
import { getCurrentUser } from '../../utils/adminAuth';

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function AdminTenders() {
	const { draftId, id } = useParams();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		title: '',
		quickSummary: '',
		category: '',
		subCategory: '',
		country: '',
		region: '',
		deadline: '',
		organisation: '',
		reference: '',
		overview: '',
		whoCanApply: '',
		scopeOfWork: '',
		requirements: '',
		applicationProcess: '',
		officialLink: '',
		heroImage: ''
	});
	const [isScheduled, setIsScheduled] = useState(false);
	const [scheduledDateTime, setScheduledDateTime] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [status, setStatus] = useState({ type: null, message: '' });
	const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
	const [currentDraftId, setCurrentDraftId] = useState(draftId || null);
	const [editingRowIndex, setEditingRowIndex] = useState(null);
	const isEditing = Boolean(id);
	const deadlineDateValue = DATE_ONLY_REGEX.test((formData.deadline || '').trim()) ? formData.deadline.trim() : '';

	// Load draft if editing
	useEffect(() => {
		if (isEditing) return;
		if (draftId) {
			const draft = getDraft('tenders', draftId);
			if (draft) {
				setFormData({
					title: draft.title || '',
					quickSummary: draft.quickSummary || '',
					category: draft.category || '',
					subCategory: draft.subCategory || '',
					country: draft.country || '',
					region: draft.region || '',
					deadline: draft.deadline || '',
					organisation: draft.organisation || '',
					reference: draft.reference || '',
					overview: draft.overview || '',
					whoCanApply: draft.whoCanApply || '',
					scopeOfWork: draft.scopeOfWork || '',
					requirements: draft.requirements || '',
					applicationProcess: draft.applicationProcess || '',
					officialLink: draft.officialLink || '',
					heroImage: draft.heroImage || ''
				});
				setCurrentDraftId(draftId);
				setStatus({ type: 'success', message: 'Draft loaded. Continue editing...' });
			}
		}
	}, [draftId, isEditing]);

	useEffect(() => {
		if (!isEditing) return;
		(async () => {
			try {
				const rows = await getSheetData('Tenders');
				const targetId = decodeURIComponent(id || '');
				const idx = rows.findIndex((row) => {
					const rowId = (row.id || `tender-${(row.title || '').toLowerCase().replace(/\s+/g, '-')}`).toString();
					return rowId === targetId;
				});
				if (idx === -1) {
					setStatus({ type: 'error', message: 'Tender not found.' });
					return;
				}
				const row = rows[idx];
				setEditingRowIndex(idx + 1);
				setFormData({
					title: row.title || '',
					quickSummary: row.quicksummary || row.quickSummary || '',
					category: row.category || '',
					subCategory: row.subcategory || row.subCategory || '',
					country: row.country || '',
					region: row.region || '',
					deadline: row.deadline || '',
					organisation: row.agency || '',
					reference: row.reference || '',
					overview: row.overview || '',
					whoCanApply: row.whocanapply || row.whoCanApply || '',
					scopeOfWork: row.scopeofwork || row.scopeOfWork || '',
					requirements: row.requirements || '',
					applicationProcess: row.applicationprocess || row.applicationProcess || '',
					officialLink: row.link || '',
					heroImage: row.heroimage ?? row.heroImage ?? ''
				});
				const rowStatus = (row.status || 'published').toString().toLowerCase();
				if (rowStatus === 'scheduled' && (row.scheduledat || row.scheduledAt)) {
					setIsScheduled(true);
					const raw = (row.scheduledat || row.scheduledAt).toString();
					const local = raw.includes('T') ? raw.slice(0, 16) : '';
					setScheduledDateTime(local);
				}
			} catch (error) {
				setStatus({ type: 'error', message: error.message || 'Failed to load tender.' });
			}
		})();
	}, [id, isEditing]);

	const buildDescription = () => {
		return [
			'<h3>Overview</h3>',
			formData.overview || '',
			'<h3>Who Can Apply</h3>',
			formData.whoCanApply || '',
			'<h3>Scope of Work</h3>',
			formData.scopeOfWork || '',
			'<h3>Requirements</h3>',
			formData.requirements || '',
			'<h3>Application Process</h3>',
			formData.applicationProcess || ''
		].join('\n');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setStatus({ type: null, message: '' });

		// Validation
		if (!formData.title || !formData.category || !formData.overview || !formData.officialLink) {
			setStatus({ type: 'error', message: 'Please fill title, category, overview, and official link.' });
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

			const payload = {
				type: 'tender',
				title: formData.title,
				agency: formData.organisation,
				category: formData.category,
				subCategory: formData.subCategory,
				country: formData.country,
				region: formData.region,
				deadline: formData.deadline,
				postedAt: new Date().toISOString().split('T')[0],
				link: formData.officialLink,
				reference: formData.reference,
				quickSummary: formData.quickSummary,
				overview: formData.overview,
				whoCanApply: formData.whoCanApply,
				scopeOfWork: formData.scopeOfWork,
				requirements: formData.requirements,
				applicationProcess: formData.applicationProcess,
				description: buildDescription(),
				eligibility: formData.whoCanApply,
				value: '',
				author: getCurrentUser() || '',
				heroImage: formData.heroImage || '',
				status: postStatus,
				scheduledAt: scheduledAt,
				createdAt: new Date().toISOString()
			};
			const success = isEditing && editingRowIndex
				? await updateSheetRow('Tenders', editingRowIndex, payload)
				: await appendSheetRow('Tenders', payload);

			if (success) {
				// Delete draft from localStorage if it was a draft
				if (currentDraftId) {
					deleteDraft('tenders', currentDraftId);
					setCurrentDraftId(null);
				}

				const message = isScheduled && scheduledDateTime
					? `Tender scheduled successfully! It will be published on ${new Date(scheduledDateTime).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })} (GMT+1).`
					: (isEditing ? 'Tender updated successfully!' : 'Tender published successfully!');
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
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Tender' : 'Create Tender'}</h1>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Tender Title <span className="text-primary">*</span>
					</label>
					<input
						type="text"
						value={formData.title}
						onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
						required
						className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						placeholder="Community Water Treatment Plant Development"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Summary</label>
					<textarea
						value={formData.quickSummary}
						onChange={(e) => setFormData(prev => ({ ...prev, quickSummary: e.target.value }))}
						rows={3}
						className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						placeholder="2-3 lines summary"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Category <span className="text-primary">*</span>
						</label>
						<input
							type="text"
							value={formData.category}
							onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
							required
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Sub-category (optional)
						</label>
						<input
							type="text"
							value={formData.subCategory}
							onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						/>
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
							placeholder="Nigeria"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							State/Region
						</label>
						<input
							type="text"
							value={formData.region}
							onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
							placeholder="Lagos State"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Deadline
						</label>
						<div className="space-y-2">
							<input
								type="date"
								value={deadlineDateValue}
								onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
								className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
							/>
							<input
								type="text"
								value={formData.deadline}
								onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
								className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
								placeholder="Or type custom deadline e.g. 02 April 2026 (09:59 GMT+1)"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Organisation
						</label>
						<input
							type="text"
							value={formData.organisation}
							onChange={(e) => setFormData(prev => ({ ...prev, organisation: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Reference (if any)
					</label>
					<input
						type="text"
						value={formData.reference}
						onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
						className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
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

				{[
					['overview', 'Overview', 'Write a short 2-3 line summary of the tender.'],
					['whoCanApply', 'Who Can Apply', 'Registered companies, vendors, contractors...'],
					['scopeOfWork', 'Scope of Work', 'Lot breakdown, deliverables, services to be provided...'],
					['requirements', 'Requirements', 'Documents, technical capacity, compliance, etc...'],
					['applicationProcess', 'Application Process', 'How to apply and submission steps...']
				].map(([key, label, placeholder]) => (
					<div key={key}>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							{label} {key === 'overview' ? <span className="text-primary">*</span> : null}
						</label>
						<textarea
							value={formData[key]}
							onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
							rows={4}
							required={key === 'overview'}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
							placeholder={placeholder}
						/>
					</div>
				))}

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Official Link <span className="text-primary">*</span>
					</label>
					<input
						type="url"
						value={formData.officialLink}
						onChange={(e) => setFormData(prev => ({ ...prev, officialLink: e.target.value }))}
						required
						className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						placeholder="https://..."
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
									quickSummary: formData.quickSummary || '',
									category: formData.category || '',
									subCategory: formData.subCategory || '',
									country: formData.country || '',
									region: formData.region || '',
									deadline: formData.deadline || '',
									organisation: formData.organisation || '',
									reference: formData.reference || '',
									overview: formData.overview || '',
									whoCanApply: formData.whoCanApply || '',
									scopeOfWork: formData.scopeOfWork || '',
									requirements: formData.requirements || '',
									applicationProcess: formData.applicationProcess || '',
									officialLink: formData.officialLink || '',
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
						{isSubmitting ? 'Saving...' : isScheduled ? 'Schedule Post' : (isEditing ? 'Update Tender' : 'Publish Tender')}
					</button>
				</div>
			</form>
			</div>
		</ErrorBoundary>
	);
}
