import { useState } from 'react';
import { Save, Briefcase } from 'lucide-react';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { appendSheetRow } from '../../utils/googleSheets';
import { ErrorBoundary } from '../../components/admin/ErrorBoundary';

const CATEGORIES = ['Grant', 'Accelerator', 'Competition', 'Fellowship', 'Training', 'Impact Loan'];
const REGIONS = ['West Africa', 'East Africa', 'Southern Africa', 'Central Africa', 'North Africa', 'Pan-African'];

export default function AdminOpportunities() {
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
		description: ''
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [status, setStatus] = useState({ type: null, message: '' });

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
				createdAt: new Date().toISOString()
			});

			if (success) {
				setStatus({ type: 'success', message: 'Opportunity created successfully!' });
				// Reset form
				setFormData({
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
					description: ''
				});
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
			<div className="flex items-center gap-3 mb-6">
				<Briefcase className="w-6 h-6 text-primary" />
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Opportunity</h1>
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
							placeholder="Opportunity title"
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
							placeholder="Organization name"
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
							placeholder="Country"
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
							placeholder="0"
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
							placeholder="0"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Currency
						</label>
						<select
							value={formData.currency}
							onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
						>
							<option value="USD">USD</option>
							<option value="EUR">EUR</option>
							<option value="GBP">GBP</option>
							<option value="NGN">NGN</option>
							<option value="ZAR">ZAR</option>
							<option value="KES">KES</option>
							<option value="GHS">GHS</option>
						</select>
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
							placeholder="https://..."
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
							placeholder="Early-stage, Fintech, Climate"
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
					{isSubmitting ? 'Saving...' : 'Save Opportunity'}
				</button>
			</form>
			</div>
		</ErrorBoundary>
	);
}
