import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Save, Briefcase, ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { updateSheetRow, getSheetData } from '../../utils/googleSheets';
import { ErrorBoundary } from '../../components/admin/ErrorBoundary';
import { toGMTPlus1ISO, getMinScheduleDateTime } from '../../utils/scheduling';
import { uploadImage } from '../../utils/imageUpload';
import CurrencySelect from '../../components/admin/CurrencySelect';

const CATEGORIES = ['Grant', 'Accelerator', 'Competition', 'Fellowship', 'Training', 'Impact Loan', 'Scholarship'];
const REGIONS = ['West Africa', 'East Africa', 'Southern Africa', 'Central Africa', 'North Africa', 'Sub-Saharan Africa', 'Pan-African'];

function buildOppId(row) {
	const title = (row.title || '').trim();
	return (row.id || `opp-${title.toLowerCase().replace(/\s+/g, '-')}`).trim();
}

export default function AdminOpportunitiesEdit() {
	const { id: idParam } = useParams();
	const id = idParam ? decodeURIComponent(idParam) : '';
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
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
		heroImage: '',
		status: 'published',
		scheduledAt: '',
		createdAt: ''
	});
	const [isScheduled, setIsScheduled] = useState(false);
	const [scheduledDateTime, setScheduledDateTime] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [status, setStatus] = useState({ type: null, message: '' });
	const [rowIndex, setRowIndex] = useState(null);
	const [uploadingHeroImage, setUploadingHeroImage] = useState(false);

	useEffect(() => {
		const loadOpportunity = async () => {
			try {
				setLoading(true);
				const data = await getSheetData('Opportunities');
				const oppIndex = data.findIndex((o) => buildOppId(o) === id);
				if (oppIndex === -1) {
					setStatus({ type: 'error', message: 'Opportunity not found' });
					setLoading(false);
					return;
				}
				const row = data[oppIndex];
				let tagsStr = '';
				if (row.tags) {
					try {
						const arr = JSON.parse(row.tags);
						tagsStr = Array.isArray(arr) ? arr.join(', ') : (row.tags || '');
					} catch {
						tagsStr = typeof row.tags === 'string' ? row.tags : '';
					}
				}
				setRowIndex(oppIndex + 1);
				const rawStatus = (row.status || 'published').toString().trim().toLowerCase();
				const scheduledAt = (row.scheduledat ?? row.scheduledAt ?? '').toString().trim();
				setFormData({
					title: (row.title || '').trim(),
					org: (row.org || '').trim(),
					country: (row.country || '').trim(),
					region: (row.region || '').trim(),
					category: (row.category || '').trim(),
					amountMin: row.amountMin != null && row.amountMin !== '' ? String(row.amountMin) : '',
					amountMax: row.amountMax != null && row.amountMax !== '' ? String(row.amountMax) : '',
					currency: (row.currency || 'USD').trim(),
					deadline: (row.deadline || '').trim(),
					postedAt: (row.postedAt || row.createdAt || new Date().toISOString().split('T')[0]).toString().split('T')[0],
					link: (row.link || '').trim(),
					tags: tagsStr,
					featured: row.featured === 'true' || row.featured === true,
					description: (row.description || '').trim(),
					heroImage: (row.heroimage ?? row['hero image'] ?? row.heroImage ?? '').toString().trim(),
					status: rawStatus || 'published',
					scheduledAt,
					createdAt: (row.createdAt || new Date().toISOString()).toString()
				});
				setIsScheduled(rawStatus === 'scheduled' && !!scheduledAt);
				if (scheduledAt) {
					try {
						const d = new Date(scheduledAt);
						if (!isNaN(d.getTime())) {
							const local = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
							const y = local.getFullYear();
							const m = String(local.getMonth() + 1).padStart(2, '0');
							const day = String(local.getDate()).padStart(2, '0');
							const h = String(local.getHours()).padStart(2, '0');
							const min = String(local.getMinutes()).padStart(2, '0');
							setScheduledDateTime(`${y}-${m}-${day}T${h}:${min}`);
						}
					} catch (_) {}
				}
			} catch (error) {
				console.error('Failed to load opportunity:', error);
				setStatus({ type: 'error', message: 'Failed to load opportunity. Please try again.' });
			} finally {
				setLoading(false);
			}
		};
		if (id) loadOpportunity();
	}, [id]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setStatus({ type: null, message: '' });
		if (!formData.title || !formData.description || !formData.category) {
			setStatus({ type: 'error', message: 'Please fill in all required fields.' });
			setIsSubmitting(false);
			return;
		}
		if (!rowIndex) {
			setStatus({ type: 'error', message: 'Unable to determine row. Please try again.' });
			setIsSubmitting(false);
			return;
		}
		try {
			const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
			let postStatus = formData.status;
			let scheduledAt = formData.scheduledAt || '';
			if (isScheduled && scheduledDateTime) {
				postStatus = 'scheduled';
				scheduledAt = toGMTPlus1ISO(scheduledDateTime);
			}
			const payload = {
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
				createdAt: formData.createdAt || new Date().toISOString(),
				status: postStatus,
				scheduledAt,
				heroImage: formData.heroImage || ''
			};
			const success = await updateSheetRow('Opportunities', rowIndex, payload);
			if (success) {
				setStatus({ type: 'success', message: 'Opportunity updated successfully!' });
				setTimeout(() => navigate('/opportunities'), 1500);
			} else {
				setStatus({ type: 'error', message: 'Failed to update opportunity. Please try again.' });
			}
		} catch (error) {
			console.error('Error updating opportunity:', error);
			setStatus({ type: 'error', message: error.message || 'An error occurred.' });
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
					<p className="text-gray-600 dark:text-gray-400">Loading opportunity...</p>
				</div>
			</div>
		);
	}

	if (!id || !id.trim()) {
		return (
			<div className="max-w-5xl mx-auto">
				<div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-8 text-center">
					<h2 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-2">Invalid URL</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-4">No opportunity ID was provided. Please go to the opportunities list and choose an opportunity to edit.</p>
					<Link to="/opportunities" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
						<ArrowLeft size={18} /> Back to Opportunities
					</Link>
				</div>
			</div>
		);
	}

	if (status.type === 'error' && status.message === 'Opportunity not found') {
		return (
			<div className="max-w-5xl mx-auto">
				<div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-8 text-center">
					<h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Opportunity not found</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-4">The opportunity may have been deleted or the link may be incorrect.</p>
					<Link to="/opportunities" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
						<ArrowLeft size={18} /> Back to Opportunities
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
						<Link to="/opportunities" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
							<ArrowLeft size={18} />
						</Link>
						<Briefcase className="w-6 h-6 text-primary" />
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Opportunity</h1>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title <span className="text-primary">*</span></label>
							<input type="text" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} required className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Organization</label>
							<input type="text" value={formData.org} onChange={(e) => setFormData((p) => ({ ...p, org: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category <span className="text-primary">*</span></label>
							<select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} required className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
								<option value="">Select category</option>
								{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Region</label>
							<select value={formData.region} onChange={(e) => setFormData((p) => ({ ...p, region: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
								<option value="">Select region</option>
								{REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
							<input type="text" value={formData.country} onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Amount</label>
							<input type="number" value={formData.amountMin} onChange={(e) => setFormData((p) => ({ ...p, amountMin: e.target.value }))} min="0" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Amount</label>
							<input type="number" value={formData.amountMax} onChange={(e) => setFormData((p) => ({ ...p, amountMax: e.target.value }))} min="0" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
						</div>
						<div>
							<CurrencySelect
								value={formData.currency}
								onChange={(code) => setFormData((p) => ({ ...p, currency: code }))}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deadline</label>
							<input type="date" value={formData.deadline} onChange={(e) => setFormData((p) => ({ ...p, deadline: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Posted Date</label>
							<input type="date" value={formData.postedAt} onChange={(e) => setFormData((p) => ({ ...p, postedAt: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Application Link</label>
							<input type="url" value={formData.link} onChange={(e) => setFormData((p) => ({ ...p, link: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (comma-separated)</label>
							<input type="text" value={formData.tags} onChange={(e) => setFormData((p) => ({ ...p, tags: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
						</div>
						<div className="flex items-end">
							<label className="flex items-center gap-2 cursor-pointer">
								<input type="checkbox" checked={formData.featured} onChange={(e) => setFormData((p) => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured</span>
							</label>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
						<select value={formData.status} onChange={(e) => { setFormData((p) => ({ ...p, status: e.target.value })); if (e.target.value !== 'scheduled') setScheduledDateTime(''); setIsScheduled(e.target.value === 'scheduled'); }} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
							<option value="draft">Draft</option>
							<option value="scheduled">Scheduled</option>
							<option value="published">Published</option>
						</select>
					</div>
					{formData.status === 'scheduled' && (
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule Date & Time (GMT+1)</label>
							<input type="datetime-local" value={scheduledDateTime} onChange={(e) => setScheduledDateTime(e.target.value)} min={getMinScheduleDateTime()} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
						</div>
					)}

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hero Image</label>
						{formData.heroImage ? (
							<div className="relative rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
								<img src={formData.heroImage} alt="Hero" className="w-full h-48 object-cover" />
								<button type="button" onClick={() => setFormData((p) => ({ ...p, heroImage: '' }))} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><X size={16} /></button>
							</div>
						) : (
							<div className="flex gap-3">
								<button type="button" onClick={async () => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/jpeg,image/jpg,image/png,image/webp'; input.onchange = async (ev) => { const file = ev.target.files?.[0]; if (!file) return; setUploadingHeroImage(true); try { const url = await uploadImage(file, 'opportunities'); setFormData((p) => ({ ...p, heroImage: url })); } catch (err) { alert(err.message); } finally { setUploadingHeroImage(false); }; }; input.click(); }} disabled={uploadingHeroImage} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">{uploadingHeroImage ? 'Uploading...' : <><Upload size={16} /> Upload</>}</button>
								<input type="url" value={formData.heroImage} onChange={(e) => setFormData((p) => ({ ...p, heroImage: e.target.value }))} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
							</div>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description <span className="text-primary">*</span></label>
						<RichTextEditor value={formData.description} onChange={(content) => setFormData((p) => ({ ...p, description: content }))} type="opportunities" />
					</div>

					{status.type && (
						<div className={`rounded-lg p-4 ${status.type === 'success' ? 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>
							{status.message}
						</div>
					)}

					<button type="submit" disabled={isSubmitting} className="w-full md:w-auto inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50">
						<Save size={18} />
						{isSubmitting ? 'Updating...' : 'Update Opportunity'}
					</button>
				</form>
			</div>
		</ErrorBoundary>
	);
}
