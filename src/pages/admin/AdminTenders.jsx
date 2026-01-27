import { useState } from 'react';
import { Save, FileText } from 'lucide-react';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { appendSheetRow } from '../../utils/googleSheets';
import { ErrorBoundary } from '../../components/admin/ErrorBoundary';

const CATEGORIES = ['IT & Telecoms', 'Construction', 'Healthcare', 'Energy', 'Logistics', 'Education', 'Agriculture'];

export default function AdminTenders() {
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
		value: ''
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
				createdAt: new Date().toISOString()
			});

			if (success) {
				setStatus({ type: 'success', message: 'Tender created successfully!' });
				// Reset form
				setFormData({
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
					value: ''
				});
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
			<div className="flex items-center gap-3 mb-6">
				<FileText className="w-6 h-6 text-primary" />
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Tender</h1>
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
					{isSubmitting ? 'Saving...' : 'Save Tender'}
				</button>
			</form>
			</div>
		</ErrorBoundary>
	);
}
