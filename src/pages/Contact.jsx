import { useState } from "react";
import { Mail, Clock, Send, MessageSquare, User, Building, CheckCircle, AlertCircle, HelpCircle, Zap } from "lucide-react";
import SEO from "../components/SEO";

export default function Contact() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		company: "",
		subject: "",
		message: ""
	});
	const [formStatus, setFormStatus] = useState({ type: null, message: "" });
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
		// Clear status when user starts typing
		if (formStatus.type) {
			setFormStatus({ type: null, message: "" });
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setFormStatus({ type: null, message: "" });

		// Basic validation
		if (!formData.name || !formData.email || !formData.message) {
			setFormStatus({
				type: "error",
				message: "Please fill in all required fields."
			});
			setIsSubmitting(false);
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			setFormStatus({
				type: "error",
				message: "Please enter a valid email address."
			});
			setIsSubmitting(false);
			return;
		}

		// Send form data to API
		try {
			const response = await fetch('/api/contact.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to send message');
			}

			setFormStatus({
				type: "success",
				message: result.message || "Thank you for your message! We'll get back to you soon."
			});

			// Reset form
			setFormData({
				name: "",
				email: "",
				company: "",
				subject: "",
				message: ""
			});
		} catch (error) {
			setFormStatus({
				type: "error",
				message: error.message || "Something went wrong. Please try again later."
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-white dark:bg-[#0B1220]">
			<SEO
				title="Contact Us — BizGrowth Africa"
				description="Get in touch with BizGrowth Africa for partnerships, support, media inquiries, or general questions. We'd love to hear from you."
				canonicalPath="/contact"
			/>

			{/* Hero Section */}
			<section className="relative overflow-hidden px-4 pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
				{/* Decorative Background */}
				<div className="absolute inset-0 -z-10 overflow-hidden">
					<div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl"></div>
					<div className="absolute bottom-20 left-10 w-72 h-72 bg-gradient-to-tr from-primary/8 to-transparent rounded-full blur-3xl"></div>
				</div>

				<div className="mx-auto max-w-4xl text-center">
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
						<Send className="w-4 h-4 text-primary" />
						<span className="text-sm font-semibold text-primary">Get in Touch</span>
					</div>

					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
						Let's Start a{" "}
						<span className="text-primary">Conversation</span>
					</h1>

					<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
						Have questions about partnerships, support, or media inquiries? We're here to help. Reach out and we'll get back to you as soon as possible.
					</p>
				</div>
			</section>

			{/* Dividing Line */}
			<div className="w-full border-t border-black dark:border-white"></div>

			{/* Contact Information Cards */}
			<section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="grid gap-6 sm:grid-cols-2 mb-16">
					<div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-primary/20 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="flex items-center gap-3 mb-3">
							<div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
								<Mail size={20} className="text-primary" />
							</div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email</h3>
						</div>
						<p className="text-sm text-gray-600 dark:text-gray-300 mb-1">General inquiries</p>
						<a 
							href="mailto:info@bizgrowthafrica.com" 
							className="text-primary hover:underline font-medium"
						>
							info@bizgrowthafrica.com
						</a>
					</div>

					<div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-primary/20 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="flex items-center gap-3 mb-3">
							<div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
								<Zap size={20} className="text-primary" />
							</div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Response Time</h3>
						</div>
						<p className="text-sm text-gray-600 dark:text-gray-300 mb-1">We typically respond</p>
						<p className="text-gray-900 dark:text-white font-medium">Within 24 hours</p>
					</div>
				</div>

				{/* Contact Form and Info Section */}
				<div className="grid gap-8 lg:grid-cols-2">
					{/* Contact Form */}
					<div id="contact-form" className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
						<div className="mb-6">
							<div className="flex items-center gap-2 mb-2">
								<MessageSquare size={20} className="text-primary" />
								<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Send us a message</h2>
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-300">
								Fill out the form below and we'll respond within 24 hours.
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-5">
							{/* Name */}
							<div>
								<label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									<div className="flex items-center gap-1">
										<User size={14} className="text-primary" />
										Full Name <span className="text-primary">*</span>
									</div>
								</label>
								<input
									type="text"
									id="name"
									name="name"
									value={formData.name}
									onChange={handleChange}
									required
									className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
									placeholder="John Doe"
								/>
							</div>

							{/* Email */}
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									<div className="flex items-center gap-1">
										<Mail size={14} className="text-primary" />
										Email Address <span className="text-primary">*</span>
									</div>
								</label>
								<input
									type="email"
									id="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									required
									className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
									placeholder="john@example.com"
								/>
							</div>

							{/* Company */}
							<div>
								<label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									<div className="flex items-center gap-1">
										<Building size={14} className="text-primary" />
										Company (Optional)
									</div>
								</label>
								<input
									type="text"
									id="company"
									name="company"
									value={formData.company}
									onChange={handleChange}
									className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
									placeholder="Your Company"
								/>
							</div>

							{/* Subject */}
							<div>
								<label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Subject (Optional)
								</label>
								<input
									type="text"
									id="subject"
									name="subject"
									value={formData.subject}
									onChange={handleChange}
									className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
									placeholder="What is this regarding?"
								/>
							</div>

							{/* Message */}
							<div>
								<label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Message <span className="text-primary">*</span>
								</label>
								<textarea
									id="message"
									name="message"
									value={formData.message}
									onChange={handleChange}
									required
									rows={6}
									className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
									placeholder="Tell us how we can help you..."
								/>
							</div>

							{/* Status Message */}
							{formStatus.type && (
								<div className={`flex items-center gap-2 rounded-lg p-4 ${
									formStatus.type === "success" 
										? "bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800" 
										: "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
								}`}>
									{formStatus.type === "success" ? (
										<CheckCircle size={20} className="flex-shrink-0" />
									) : (
										<AlertCircle size={20} className="flex-shrink-0" />
									)}
									<p className="text-sm font-medium">{formStatus.message}</p>
								</div>
							)}

							{/* Submit Button */}
							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{isSubmitting ? (
									<>
										<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Sending...
									</>
								) : (
									<>
										<Send size={18} />
										Send Message
									</>
								)}
							</button>
						</form>
					</div>

					{/* Info Section */}
					<div className="space-y-6">
						{/* FAQ Section */}
						<div className="rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
							<div className="p-6 border-b border-gray-200 dark:border-gray-800">
								<div className="flex items-center gap-2 mb-2">
									<HelpCircle size={20} className="text-primary" />
									<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-300">
									Quick answers to common questions
								</p>
							</div>
							<div className="p-6 space-y-4">
								<div>
									<h3 className="font-semibold text-gray-900 dark:text-white mb-1">How quickly will I receive a response?</h3>
									<p className="text-sm text-gray-600 dark:text-gray-300">
										We aim to respond to all inquiries within 24 hours during business days (Monday-Friday).
									</p>
								</div>
								<div className="pt-4 border-t border-gray-200 dark:border-gray-800">
									<h3 className="font-semibold text-gray-900 dark:text-white mb-1">What types of inquiries do you handle?</h3>
									<p className="text-sm text-gray-600 dark:text-gray-300">
										We handle partnerships, media inquiries, support questions, and general business inquiries related to BizGrowth Africa.
									</p>
								</div>
								<div className="pt-4 border-t border-gray-200 dark:border-gray-800">
									<h3 className="font-semibold text-gray-900 dark:text-white mb-1">Can I schedule a meeting?</h3>
									<p className="text-sm text-gray-600 dark:text-gray-300">
										Yes! Mention your preferred meeting time in your message, and we'll coordinate accordingly.
									</p>
								</div>
							</div>
						</div>

						{/* Business Hours */}
						<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
							<div className="flex items-center gap-2 mb-4">
								<Clock size={20} className="text-primary" />
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Hours</h3>
							</div>
							<div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
								<div className="flex justify-between">
									<span className="font-medium">Monday - Friday</span>
									<span>9:00 AM - 6:00 PM</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium">Saturday</span>
									<span>10:00 AM - 2:00 PM</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium">Sunday</span>
									<span>Closed</span>
								</div>
								<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
									<p className="text-xs text-gray-500 dark:text-gray-400">
										Time zone: West Africa Time (WAT)
									</p>
								</div>
							</div>
						</div>

						{/* Additional Info */}
						<div className="rounded-xl border border-gray-200 bg-gradient-to-br from-primary/5 to-primary/10 p-6 dark:border-gray-800 dark:from-primary/10 dark:to-primary/5">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
								Need immediate assistance?
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
								Send us an email and we'll get back to you as soon as possible. We typically respond to all inquiries within 24 hours during business days.
							</p>
							<div className="flex flex-wrap gap-3">
								<a
									href="mailto:info@bizgrowthafrica.com"
									className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90"
								>
									<Mail size={16} />
									Email Us
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
