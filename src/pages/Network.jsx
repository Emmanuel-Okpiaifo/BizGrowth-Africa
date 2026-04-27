import { Children, useEffect, useMemo, useRef, useState } from "react";
import {
	ArrowRight,
	BadgeCheck,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Sparkles,
	Users,
	Zap,
} from "lucide-react";
import SEO from "../components/SEO";
import { appendSheetRow } from "../utils/googleSheets";
import { trackEvent as trackGaEvent } from "../utils/analytics";
import { trackEvent as trackMetaEvent } from "../utils/metaPixel";

const sectorOptions = [
	"Agriculture and Agribusiness",
	"Construction and Real Estate",
	"Creative Economy (Media, Film, Music, Design)",
	"Education and Training",
	"Energy and Utilities",
	"Fashion and Textiles",
	"Financial Services and Fintech",
	"Food and Beverage",
	"Healthcare and Wellness",
	"Hospitality and Tourism",
	"Legal and Professional Services",
	"Logistics and Supply Chain",
	"Manufacturing and Production",
	"Oil, Gas and Mining",
	"Retail and E-commerce",
	"Technology and Software",
	"Telecommunications",
	"Others - please specify below",
];

const locationOptions = [
	"Lagos",
	"Abuja (FCT)",
	"Port Harcourt",
	"Kano",
	"Ibadan",
	"Enugu",
	"Benin City",
	"Kaduna",
	"Onitsha",
	"Aba",
	"Warri",
	"Jos",
	"Ilorin",
	"Abeokuta",
	"Calabar",
	"Other Nigeria - specify below",
	"Outside Nigeria",
];

const howHeardOptions = [
	"Instagram",
	"LinkedIn",
	"Facebook",
	"X (Twitter)",
	"WhatsApp",
	"Referred by a friend or colleague",
	"BGA Website",
	"BGA Newsletter",
	"YouTube",
	"An event or conference",
	"Other",
];

const yesFitItems = [
	"You run a business or are actively building one at any stage",
	"You are serious about growth, not just surviving",
	"You want to 10x your business and you are willing to do the work",
	"You are ready to learn, share, and show up for other entrepreneurs",
	"You believe the right community can change the trajectory of your business",
	"You are based in Nigeria or actively building a Nigerian business",
];

const noFitItems = [
	"You want to broadcast your products without contributing anything back",
	"You plan to join passively and never actually engage",
	"You are not actively building or running a business right now",
];

const challengeOptions = [
	"Finding grants and funding opportunities",
	"Accessing loans and business credit",
	"Winning contracts, bids, and tenders",
	"Growing and retaining my customer base",
	"Hiring the right people for my business",
	"Staff performance and accountability",
	"People management and HR challenges",
	"Building a strong team culture",
	"Managing cash flow and business finances",
	"Adopting the right technology for my business",
	"Digital marketing and online visibility",
	"Sales strategy and closing more deals",
	"Pricing my products or services correctly",
	"Building business partnerships and networks",
	"Scaling and expanding my operations",
	"Navigating regulations and compliance",
	"Something else which I will describe below",
];

const helpNeedOptions = [
	"Help me find and apply for grants and funding",
	"Connect me to government and corporate tender opportunities",
	"Introduce me to investors and capital partners",
	"Help me access affordable business loans",
	"Connect me to potential customers and clients",
	"Connect me with the right business partners",
	"Provide training on business growth and strategy",
	"Help me with hiring and building my team",
	"Give me practical tools and frameworks for running my business better",
	"Feature my business and help build my brand visibility",
	"Give me access to mentors and experienced entrepreneurs",
	"Help me adopt the right technology for my business",
	"Connect me with other entrepreneurs in my industry",
	"Organise events, networking sessions, and masterclasses",
];

const initialFormData = {
	firstName: "",
	lastName: "",
	email: "",
	whatsAppNumber: "",
	gender: "",
	dateOfBirth: "",
	age: "",
	businessDescription: "",
	sector: "",
	companyName: "",
	companyWebsite: "",
	linkedInProfile: "",
	businessLocation: "",
	otherLocation: "",
	businessStage: "",
	annualRevenue: "",
	teamSize: "",
	growthGoal: "",
	heardAbout: "",
	subscriptionReadiness: "",
	challenges: [],
	helpNeeds: [],
	additionalSupport: "",
	joinReason: "",
	activeMemberReadiness: "",
	founderSpotlight: "",
};

function getUserAgentString() {
	try {
		let ua = navigator.userAgent || "";
		if (!ua && navigator.userAgentData) {
			const brands = (navigator.userAgentData.brands || [])
				.map((b) => `${b.brand}/${b.version}`)
				.join("; ");
			ua = `${brands}; mobile=${navigator.userAgentData.mobile}`;
		}
		const lang = navigator.language || "";
		let tz = "";
		try {
			tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
		} catch { }
		return [ua, lang, tz].filter(Boolean).join(" | ");
	} catch {
		return "unknown";
	}
}

function Field({ label, required = false, hint, children }) {
	return (
		<div className="space-y-2">
			<label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
				{label}
				{required ? <span className="ml-1 text-primary">*</span> : null}
			</label>
			{hint ? <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p> : null}
			{children}
		</div>
	);
}

function AnimatedReveal({
	as: Tag = "div",
	children,
	className = "",
	variant = "fade-up",
	delay = 0,
	...rest
}) {
	const ref = useRef(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsVisible(true);
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return (
		<Tag
			ref={ref}
			className={`network-reveal network-reveal-${variant} ${isVisible ? "is-visible" : ""} ${className}`}
			style={{ transitionDelay: `${delay}ms` }}
			{...rest}
		>
			{children}
		</Tag>
	);
}

function AnimatedStagger({
	as: Tag = "div",
	children,
	className = "",
	variant = "fade-up",
	initialDelay = 40,
	staggerMs = 90,
}) {
	const ref = useRef(null);
	const [isVisible, setIsVisible] = useState(false);
	const items = Children.toArray(children);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsVisible(true);
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return (
		<Tag ref={ref} className={className}>
			{items.map((child, idx) => (
				<div
					key={`stagger-${idx}`}
					className={`network-reveal network-reveal-${variant} ${isVisible ? "is-visible" : ""}`}
					style={{ transitionDelay: `${initialDelay + idx * staggerMs}ms` }}
				>
					{child}
				</div>
			))}
		</Tag>
	);
}

function inputClassName() {
	return "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-[#0B1220] dark:text-white";
}

function optionClassName() {
	return "flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 transition hover:border-primary/40 dark:border-gray-700 dark:bg-[#0B1220] dark:text-gray-200";
}

export default function Network() {
	const [formData, setFormData] = useState(initialFormData);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [status, setStatus] = useState({ type: null, message: "" });
	const [currentStep, setCurrentStep] = useState(0);

	const highlightCards = useMemo(
		() => [
			{
				icon: "💰",
				title: "Funding and Opportunity Alerts",
				description:
					"Curated grants and opportunities shared consistently. Verified, relevant, and actionable.",
				tag: "Funding",
			},
			{
				icon: "📋",
				title: "Tender and Procurement Listings",
				description:
					"Government and corporate contracts shared so you can move early and stay informed.",
				tag: "Contracts",
			},
			{
				icon: "🤝",
				title: "Live Entrepreneur Community",
				description:
					"Real conversations, shared wins, and peer accountability in a focused, no-noise environment.",
				tag: "Always On",
			},
			{
				icon: "🎯",
				title: "Growth Frameworks and Tools",
				description:
					"Practical frameworks and templates for sales, operations, funding, and scale.",
				tag: "Tools",
			},
			{
				icon: "🎙",
				title: "Founder Spotlights",
				description:
					"Member features across BizGrowth channels to increase visibility and credibility.",
				tag: "Visibility",
			},
			{
				icon: "🌐",
				title: "Serious Partnerships",
				description:
					"Meet business partners, collaborators, and founders building resilient Nigerian businesses.",
				tag: "Ongoing",
			},
			{
				icon: "🎉",
				title: "Meet-ups, Hangouts and Fun Activities",
				description:
					"Join relaxed networking events, social hangouts, and community activities designed to build stronger founder relationships.",
				tag: "Community",
			},
		],
		[],
	);

	const steps = useMemo(
		() => [
			{
				id: "personal",
				title: "Personal details",
				description: "Tell us who you are and how to reach you.",
			},
			{
				id: "business",
				title: "Your business",
				description: "Help us understand what you are building.",
			},
			{
				id: "scale",
				title: "Business scale",
				description: "Share your current stage and growth focus.",
			},
			{
				id: "challenges",
				title: "Challenges and support",
				description: "Show us where support will create impact.",
			},
			{
				id: "intent",
				title: "Why BGA network",
				description: "Final questions before submission.",
			},
		],
		[],
	);

	const progressPct = Math.round(((currentStep + 1) / steps.length) * 100);

	const trackNetworkEvent = (action, details = {}) => {
		const eventPayload = {
			page: "network",
			action,
			...details,
		};

		trackGaEvent("network_interaction", eventPayload);
		trackMetaEvent("network_interaction", eventPayload);
	};

	const calculateAge = (dateOfBirth) => {
		if (!dateOfBirth) return "";
		const birthDate = new Date(dateOfBirth);
		if (Number.isNaN(birthDate.getTime())) return "";
		const today = new Date();
		let years = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		const dayDiff = today.getDate() - birthDate.getDate();
		if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) years -= 1;
		return years >= 0 ? String(years) : "";
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			if (name === "dateOfBirth") {
				return {
					...prev,
					dateOfBirth: value,
					age: calculateAge(value),
				};
			}
			return { ...prev, [name]: value };
		});
		if (status.type) setStatus({ type: null, message: "" });
	};

	const handleCheckboxGroupChange = (group, value, checked) => {
		setFormData((prev) => ({
			...prev,
			[group]: checked
				? [...prev[group], value]
				: prev[group].filter((item) => item !== value),
		}));
		if (status.type) setStatus({ type: null, message: "" });
	};

	const validateStep = (stepIndex) => {
		if (stepIndex === 0) {
			if (
				!formData.firstName ||
				!formData.lastName ||
				!formData.email ||
				!formData.whatsAppNumber ||
				!formData.gender ||
				!formData.dateOfBirth ||
				!formData.age
			) {
				setStatus({ type: "error", message: "Please complete all required personal details before continuing." });
				return false;
			}
		}
		if (stepIndex === 1) {
			if (!formData.businessDescription || !formData.sector || !formData.companyName || !formData.businessLocation) {
				setStatus({ type: "error", message: "Please complete required business information before continuing." });
				return false;
			}
		}
		if (stepIndex === 2) {
			if (!formData.businessStage || !formData.annualRevenue || !formData.teamSize || !formData.growthGoal || !formData.heardAbout || !formData.subscriptionReadiness) {
				setStatus({ type: "error", message: "Please answer all required business scale questions before continuing." });
				return false;
			}
		}
		if (stepIndex === 3) {
			if (formData.challenges.length === 0) {
				setStatus({
					type: "error",
					message: "Please select at least one business challenge before continuing.",
				});
				return false;
			}
			if (formData.helpNeeds.length === 0) {
				setStatus({
					type: "error",
					message: "Please choose at least one way BGA can support your growth before continuing.",
				});
				return false;
			}
		}
		if (stepIndex === 4) {
			if (!formData.joinReason || !formData.activeMemberReadiness) {
				setStatus({ type: "error", message: "Please complete the final required questions before submitting." });
				return false;
			}
		}
		setStatus({ type: null, message: "" });
		return true;
	};

	const goNextStep = () => {
		if (!validateStep(currentStep)) return;
		trackNetworkEvent("next_step_clicked", { step: currentStep + 1 });
		setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
	};

	const goPrevStep = () => {
		setStatus({ type: null, message: "" });
		trackNetworkEvent("previous_step_clicked", { step: currentStep + 1 });
		setCurrentStep((prev) => Math.max(prev - 1, 0));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateStep(currentStep)) return;
		setStatus({ type: null, message: "" });
		setIsSubmitting(true);
		const payload = {
			form: "network",
			formType: "network_application",
			ts: new Date().toISOString(),
			submittedAt: new Date().toISOString(),
			...formData,
			challenges: formData.challenges.join(" | "),
			helpNeeds: formData.helpNeeds.join(" | "),
			userAgent: getUserAgentString(),
			page: window.location.href,
		};

		const ok = await appendSheetRow("Network", payload);
		if (ok) {
			trackNetworkEvent("application_submitted", {
				stage: formData.businessStage || "not_provided",
				team_size: formData.teamSize || "not_provided",
			});
			trackMetaEvent("Lead", {
				content_name: "BGA Network Application",
				content_category: "network_membership",
				status: "submitted",
			});

			setStatus({
				type: "success",
				message: "Application submitted successfully. Check your inbox for the next steps.",
			});
			setFormData(initialFormData);
		} else {
			setStatus({
				type: "error",
				message: "We could not submit your application right now. Please try again.",
			});
		}
		setIsSubmitting(false);
	};

	const renderStepContent = () => {
		if (currentStep === 0) {
			return (
				<section className="space-y-4">
					<h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{steps[0].title}</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="First Name" required>
							<input
								name="firstName"
								required
								value={formData.firstName}
								onChange={handleInputChange}
								placeholder="e.g. Chisom"
								className={inputClassName()}
							/>
						</Field>
						<Field label="Last Name" required>
							<input
								name="lastName"
								required
								value={formData.lastName}
								onChange={handleInputChange}
								placeholder="e.g. Okonkwo"
								className={inputClassName()}
							/>
						</Field>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Email Address" required>
							<input
								name="email"
								type="email"
								required
								value={formData.email}
								onChange={handleInputChange}
								placeholder="your@email.com"
								className={inputClassName()}
							/>
						</Field>
						<Field
							label="WhatsApp Number"
							required
							hint="Include your country code, for example +234 800 000 0000"
						>
							<input
								name="whatsAppNumber"
								required
								value={formData.whatsAppNumber}
								onChange={handleInputChange}
								placeholder="+234 800 000 0000"
								className={inputClassName()}
							/>
						</Field>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Date of Birth" required>
							<input
								name="dateOfBirth"
								type="date"
								required
								value={formData.dateOfBirth}
								onChange={handleInputChange}
								max={new Date().toISOString().split("T")[0]}
								className={inputClassName()}
							/>
						</Field>
						<Field label="Age" required hint="Auto-calculated from date of birth, but you can edit it if needed.">
							<input
								name="age"
								type="number"
								required
								value={formData.age}
								onChange={handleInputChange}
								min="0"
								max="120"
								placeholder="Select your date of birth first"
								className={inputClassName()}
							/>
						</Field>
					</div>
					<Field label="Gender" required>
						<div className="grid gap-2 sm:grid-cols-3">
							{["Male", "Female", "Prefer not to say"].map((option) => (
								<label key={option} className={optionClassName()}>
									<input
										type="radio"
										name="gender"
										required
										value={option}
										checked={formData.gender === option}
										onChange={handleInputChange}
										className="accent-primary"
									/>
									{option}
								</label>
							))}
						</div>
					</Field>
				</section>
			);
		}

		if (currentStep === 1) {
			return (
				<section className="space-y-4">
					<h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{steps[1].title}</h3>
					<Field
						label="What is your business and what does it do?"
						required
						hint="Two sentences is enough. Tell us what you do and who you serve."
					>
						<textarea
							name="businessDescription"
							required
							rows={4}
							value={formData.businessDescription}
							onChange={handleInputChange}
							placeholder="Describe your business and the people you serve..."
							className={inputClassName()}
						/>
					</Field>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Sector or Industry" required>
							<select
								name="sector"
								required
								value={formData.sector}
								onChange={handleInputChange}
								className={inputClassName()}
							>
								<option value="">Select your business sector</option>
								{sectorOptions.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</Field>
						<Field label="Company Name" required>
							<input
								name="companyName"
								required
								value={formData.companyName}
								onChange={handleInputChange}
								placeholder="e.g. Okonkwo Ventures Ltd"
								className={inputClassName()}
							/>
						</Field>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Company Website">
							<input
								name="companyWebsite"
								value={formData.companyWebsite}
								onChange={handleInputChange}
								placeholder="e.g. www.mycompany.com"
								className={inputClassName()}
							/>
						</Field>
						<Field label="LinkedIn Profile" hint="Your personal LinkedIn or company page">
							<input
								name="linkedInProfile"
								value={formData.linkedInProfile}
								onChange={handleInputChange}
								placeholder="e.g. linkedin.com/in/yourname"
								className={inputClassName()}
							/>
						</Field>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Where is your business primarily based?" required>
							<select
								name="businessLocation"
								required
								value={formData.businessLocation}
								onChange={handleInputChange}
								className={inputClassName()}
							>
								<option value="">Select your city or state</option>
								{locationOptions.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</Field>
						<Field label="If other location, tell us where">
							<input
								name="otherLocation"
								value={formData.otherLocation}
								onChange={handleInputChange}
								placeholder="e.g. Owerri, Imo State"
								className={inputClassName()}
							/>
						</Field>
					</div>
				</section>
			);
		}

		if (currentStep === 2) {
			return (
				<section className="space-y-4">
					<h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{steps[2].title}</h3>
					<Field label="How long have you been running your business?" required>
						<div className="grid gap-2">
							{[
								"Just starting out (0 to 1 year)",
								"Early traction (1 to 3 years)",
								"Growing and scaling (3 to 7 years)",
								"Established and expanding (7 years and above)",
							].map((option) => (
								<label key={option} className={optionClassName()}>
									<input
										type="radio"
										name="businessStage"
										required
										value={option}
										checked={formData.businessStage === option}
										onChange={handleInputChange}
										className="accent-primary"
									/>
									{option}
								</label>
							))}
						</div>
					</Field>
					<Field label="What is your approximate annual revenue?" required>
						<div className="grid gap-2">
							{[
								"Pre-revenue, not yet generating income",
								"Below 20 million naira per year",
								"20 million to 50 million naira per year",
								"50 million to 75 million naira per year",
								"75 million to 100 million naira per year",
								"100 million to 200 million naira per year",
								"200 million to 300 million naira per year",
								"300 million to 500 million naira per year",
								"Above 500 million naira per year",
								"Prefer not to say",
							].map((option) => (
								<label key={option} className={optionClassName()}>
									<input
										type="radio"
										name="annualRevenue"
										required
										value={option}
										checked={formData.annualRevenue === option}
										onChange={handleInputChange}
										className="accent-primary"
									/>
									{option}
								</label>
							))}
						</div>
					</Field>
					<Field label="How many people are on your team right now?" required>
						<div className="grid gap-2 sm:grid-cols-2">
							{[
								"Solo, just me",
								"2 to 5 people",
								"6 to 15 people",
								"16 to 50 people",
								"51 to 75 people",
								"75 to 100 people",
								"More than 100 people",
							].map((option) => (
								<label key={option} className={optionClassName()}>
									<input
										type="radio"
										name="teamSize"
										required
										value={option}
										checked={formData.teamSize === option}
										onChange={handleInputChange}
										className="accent-primary"
									/>
									{option}
								</label>
							))}
						</div>
					</Field>
					<Field
						label="What is your number one growth goal for the next 12 months?"
						required
						hint="Pick just one."
					>
						<div className="grid gap-2">
							{[
								"Secure major funding or a grant",
								"Win a government or corporate contract",
								"Double or triple my revenue",
								"Build and stabilise my team",
								"Launch a new product or service",
								"Expand into a new market or location",
								"Integrate the right technology into my business",
								"Improve operations and internal systems",
								"Build stronger brand visibility and partnerships",
							].map((option) => (
								<label key={option} className={optionClassName()}>
									<input
										type="radio"
										name="growthGoal"
										required
										value={option}
										checked={formData.growthGoal === option}
										onChange={handleInputChange}
										className="accent-primary"
									/>
									{option}
								</label>
							))}
						</div>
					</Field>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="How did you hear about the BGA Network?" required>
							<select
								name="heardAbout"
								required
								value={formData.heardAbout}
								onChange={handleInputChange}
								className={inputClassName()}
							>
								<option value="">Select how you found us</option>
								{howHeardOptions.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</Field>
						<Field
							label="BGA is free for the first two months. Are you able to to pay a subscription fee of USD 300/year if you get value in the first 2 months?"
							required
						>
							<div className="grid gap-2">
								{[
									"Yes. If the value is there, I am happy to pay.",
									"Possibly, depending on what is included.",
									"I would need to see more before committing.",
								].map((option) => (
									<label key={option} className={optionClassName()}>
										<input
											type="radio"
											name="subscriptionReadiness"
											required
											value={option}
											checked={formData.subscriptionReadiness === option}
											onChange={handleInputChange}
											className="accent-primary"
										/>
										{option}
									</label>
								))}
							</div>
							<p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
								The BGA network offers two months free trial to members after which members are expected to pay an annual subscription fee of USD 300.
							</p>
						</Field>
					</div>
				</section>
			);
		}

		if (currentStep === 3) {
			return (
				<section className="space-y-4">
					<h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{steps[3].title}</h3>
					<Field
						label="What are your biggest business challenges right now?"
						required
						hint="Select everything that applies to you."
					>
						<div className="grid gap-2 sm:grid-cols-2">
							{challengeOptions.map((option) => (
								<label key={option} className={optionClassName()}>
									<input
										type="checkbox"
										checked={formData.challenges.includes(option)}
										onChange={(e) =>
											handleCheckboxGroupChange("challenges", option, e.target.checked)
										}
										className="accent-primary"
									/>
									{option}
								</label>
							))}
						</div>
					</Field>
					<Field
						label="What do you most want the BGA Network to help you with?"
						required
						hint="Select everything that resonates with you."
					>
						<div className="grid gap-2 sm:grid-cols-2">
							{helpNeedOptions.map((option) => (
								<label key={option} className={optionClassName()}>
									<input
										type="checkbox"
										checked={formData.helpNeeds.includes(option)}
										onChange={(e) =>
											handleCheckboxGroupChange("helpNeeds", option, e.target.checked)
										}
										className="accent-primary"
									/>
									{option}
								</label>
							))}
						</div>
					</Field>
					<Field label="Anything else you would like BGA to know or help with?">
						<textarea
							name="additionalSupport"
							rows={4}
							value={formData.additionalSupport}
							onChange={handleInputChange}
							placeholder="Tell us anything else that is important to you or your business..."
							className={inputClassName()}
						/>
					</Field>
				</section>
			);
		}

		return (
			<section className="space-y-4">
				<h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{steps[4].title}</h3>
				<Field
					label="Why do you want to join the BGA Network?"
					required
					hint="Short and honest is better than long and rehearsed."
				>
					<textarea
						name="joinReason"
						required
						rows={4}
						value={formData.joinReason}
						onChange={handleInputChange}
						placeholder="Tell us what this community means to you..."
						className={inputClassName()}
					/>
				</Field>
				<Field label="Are you ready to be an active member and not just a reader?" required>
					<div className="grid gap-2">
						{[
							"Yes. I am ready and I understand what that means.",
							"I am still figuring it out but I am committed to showing up.",
						].map((option) => (
							<label key={option} className={optionClassName()}>
								<input
									type="radio"
									name="activeMemberReadiness"
									required
									value={option}
									checked={formData.activeMemberReadiness === option}
									onChange={handleInputChange}
									className="accent-primary"
								/>
								{option}
							</label>
						))}
					</div>
				</Field>
				<Field label="Would you be open to being featured as a BGA Founder Spotlight?">
					<div className="grid gap-2 sm:grid-cols-3">
						{["Yes. I am open to it.", "Maybe. Tell me more when the time comes.", "Not right now."].map(
							(option) => (
								<label key={option} className={optionClassName()}>
									<input
										type="radio"
										name="founderSpotlight"
										value={option}
										checked={formData.founderSpotlight === option}
										onChange={handleInputChange}
										className="accent-primary"
									/>
									{option}
								</label>
							),
						)}
					</div>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						The BGA Founder Spotlight is a feature celebrating real Nigerian entrepreneurs
						across BGA channels, at no cost.
					</p>
				</Field>
			</section>
		);
	};

	return (
		<div className="min-h-screen bg-white dark:bg-[#0B1220]">
			<style>{`
				.network-reveal {
					opacity: 0;
					filter: blur(6px);
					will-change: transform, opacity, filter;
					transition:
						opacity 720ms cubic-bezier(0.22, 1, 0.36, 1),
						transform 780ms cubic-bezier(0.22, 1, 0.36, 1),
						filter 760ms cubic-bezier(0.22, 1, 0.36, 1);
				}
				.network-reveal.is-visible {
					opacity: 1;
					transform: none;
					filter: blur(0);
				}
				.network-reveal-fade-up { transform: translateY(34px); }
				.network-reveal-slide-left { transform: translateX(-48px); }
				.network-reveal-slide-right { transform: translateX(48px); }
				.network-reveal-zoom-in { transform: scale(0.94); }
				.network-reveal-float-in { transform: translateY(22px) scale(0.98) rotate(-0.4deg); }

				@media (prefers-reduced-motion: reduce) {
					.network-reveal,
					.network-reveal.is-visible {
						opacity: 1;
						transform: none;
						filter: none;
						transition: none;
					}
				}
			`}</style>
			<SEO
				title="BGA Network — BizGrowth Africa"
				description="Join the BGA Network, a free entrepreneur community for growth-minded Nigerian founders building resilient businesses."
				canonicalPath="/network"
			/>

			<AnimatedReveal
				as="section"
				variant="zoom-in"
				className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-6 py-12 shadow-sm dark:border-gray-800 dark:from-[#0E1730] dark:via-[#0B1220] dark:to-[#101936] sm:px-10 sm:py-16"
			>
				<div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
				<div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
				<div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
					<div className="space-y-6">
						<div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary dark:bg-primary/10">
							<Sparkles size={14} />
							Applications now open
						</div>
						<h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl">
							Join BizGrowth Africa Network today.
						</h1>
						<p className="max-w-3xl text-sm font-semibold uppercase tracking-[0.11em] text-primary/90 dark:text-primary">
							Join Nigeria&apos;s fastest growing community of entrepreneurs - sign up to join the BGA
							Entrepreneurs Network.
						</p>
						<p className="max-w-3xl text-base leading-relaxed text-gray-700 dark:text-gray-300 sm:text-lg">
							Entrepreneurs who win don't build alone. They leverage on the power of community and networks to grow and scale fast. BGA will open you up to a huge network of other entrepreneurs, builders and supporters that can take your business to the next level.
						</p>
						<div className="grid gap-3 sm:grid-cols-3">
							<div className="rounded-xl border border-white/70 bg-white/85 p-3 dark:border-gray-700 dark:bg-[#0B1220]/70">
								<p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Value</p>
								<p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Smart opportunities</p>
							</div>
							<div className="rounded-xl border border-white/70 bg-white/85 p-3 dark:border-gray-700 dark:bg-[#0B1220]/70">
								<p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Community</p>
								<p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Founder accountability</p>
							</div>
							<div className="rounded-xl border border-white/70 bg-white/85 p-3 dark:border-gray-700 dark:bg-[#0B1220]/70">
								<p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Cost</p>
								<p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Free to join</p>
							</div>
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<a
								href="#apply"
								onClick={() => trackNetworkEvent("hero_join_click")}
								className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
							>
								Join the BGA Network
								<ArrowRight size={16} />
							</a>
							<a
								href="#benefits"
								onClick={() => trackNetworkEvent("hero_benefits_click")}
								className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white/80 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-[#0B1220]/70 dark:text-gray-200"
							>
								See what&apos;s inside
							</a>
						</div>
					</div>

					<div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-gray-800 dark:bg-[#0B1220]/90">
						<div className="mb-5 flex items-center justify-between">
							<h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
								Inside the network
							</h2>
							<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
								Live
							</span>
						</div>
						<AnimatedStagger className="space-y-3" variant="slide-right" initialDelay={80} staggerMs={90}>
							{highlightCards.slice(0, 4).map((item) => (
								<div key={item.title} className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-[#111a30]">
									<div className="flex items-start gap-3">
										<span className="text-lg">{item.icon}</span>
										<div>
											<p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
											<p className="mt-0.5 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{item.description}</p>
										</div>
									</div>
								</div>
							))}
						</AnimatedStagger>
					</div>
				</div>
			</AnimatedReveal>

			<AnimatedReveal as="section" id="benefits" variant="fade-up" className="mx-auto mt-16 max-w-6xl" delay={40}>
				<div className="mb-8 flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">What you get</p>
						<h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
							This is what being inside looks like.
						</h2>
					</div>
					<p className="max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
						Not another passive group. This is a live, active, resource-rich entrepreneur community
						built for founders who are serious about growth.
					</p>
				</div>
				<AnimatedStagger
					className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
					variant="fade-up"
					initialDelay={60}
					staggerMs={85}
				>
					{highlightCards.map((item, idx) => (
						<article
							key={item.title}
							className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-[#0E1629]"
						>
							<div className="mb-3 flex items-center justify-between">
								<span className="text-xl">{item.icon}</span>
								<span className="text-xs font-bold text-gray-400">0{idx + 1}</span>
							</div>
							<h3 className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</h3>
							<p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{item.description}</p>
							<span className="mt-3 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
								{item.tag}
							</span>
						</article>
					))}
				</AnimatedStagger>
			</AnimatedReveal>

			<AnimatedReveal
				as="section"
				variant="slide-right"
				className="mx-auto mt-16 max-w-6xl rounded-3xl bg-[#0F172A] px-6 py-12 text-center text-white dark:bg-[#0A1020] sm:px-10"
			>
				<p className="mx-auto max-w-3xl text-2xl font-semibold italic leading-relaxed sm:text-3xl">
					"The goal is not to be in a group. The goal is to be around the right people while
					building something that lasts."
				</p>
				<p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
					The BGA Network
				</p>
			</AnimatedReveal>

			<AnimatedReveal as="section" id="who" variant="slide-left" className="mx-auto mt-16 grid max-w-6xl gap-6 lg:grid-cols-2" delay={20}>
				<div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0E1629]">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Who this is for</p>
					<h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
						Built for entrepreneurs who are done playing small.
					</h2>
					<p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
						This is not a group for everyone. It is a room for resilient, creative, focused
						founders who understand that the right community changes everything.
					</p>
					<div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
						<p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700 dark:text-red-300">
							This is not for you if
						</p>
						<ul className="mt-3 space-y-2">
							{noFitItems.map((item) => (
								<li
									key={item}
									className="flex items-start gap-2 text-sm leading-relaxed text-red-800 dark:text-red-200"
								>
									<span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
									{item}
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0E1629]">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Great fit</p>
					<h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
						You should apply if this sounds like you.
					</h3>
					<AnimatedStagger className="mt-5 space-y-3" variant="fade-up" initialDelay={70} staggerMs={75}>
						{yesFitItems.map((item) => (
							<div
								key={item}
								className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-white/5"
							>
								<CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
								<p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">{item}</p>
							</div>
						))}
					</AnimatedStagger>
				</div>
			</AnimatedReveal>

			<AnimatedReveal
				as="section"
				variant="float-in"
				className="mx-auto mt-16 max-w-6xl rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 dark:border-gray-800 dark:from-[#0E1629] dark:to-[#0B1220] sm:p-8"
				delay={30}
			>
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">How to join</p>
				<h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
					Three steps. Completely free.
				</h2>
				<AnimatedStagger
					className="mt-6 grid gap-4 md:grid-cols-3"
					variant="float-in"
					initialDelay={80}
					staggerMs={110}
				>
					{[
						{
							title: "Fill the application form",
							description:
								"No long essays. We want to know who you are and what you are building.",
							icon: <Users size={18} />,
						},
						{
							title: "Watch your inbox",
							description:
								"The BGA team reviews every application and sends selected members a welcome email.",
							icon: <BadgeCheck size={18} />,
						},
						{
							title: "Join and engage",
							description:
								"Introduce yourself, participate, and start building with other growth-minded founders.",
							icon: <Zap size={18} />,
						},
					].map((item, idx) => (
						<div
							key={item.title}
							className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#0B1220]"
						>
							<div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
								{item.icon}
								0{idx + 1}
							</div>
							<h3 className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</h3>
							<p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
								{item.description}
							</p>
						</div>
					))}
				</AnimatedStagger>
			</AnimatedReveal>

			<AnimatedReveal as="section" id="apply" variant="fade-up" className="mx-auto mt-16 max-w-5xl pb-10" delay={40}>
				<div className="mb-8 text-center">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Apply now</p>
					<h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
						Join the BGA Network today.
					</h2>
					<p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
						Membership is free. Apply now and join one of Nigeria&apos;s most growth-minded
						entrepreneur communities.
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="space-y-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#0E1629] sm:p-8"
				>
					<div className="space-y-3">
						<div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
							<span>Step {currentStep + 1} of {steps.length}</span>
							<span>{progressPct}% complete</span>
						</div>
						<div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
							<div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPct}%` }} />
						</div>
						<div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#0B1220]">
							<p className="text-sm font-semibold text-gray-900 dark:text-white">{steps[currentStep].title}</p>
							<p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{steps[currentStep].description}</p>
						</div>
					</div>

					{renderStepContent()}

					<div className="space-y-3 border-t border-gray-200 pt-6 dark:border-gray-800">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<button
								type="button"
								onClick={goPrevStep}
								disabled={currentStep === 0}
								className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
							>
								<ChevronLeft size={16} />
								Previous
							</button>

							{currentStep < steps.length - 1 ? (
								<button
									type="button"
									onClick={goNextStep}
									className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
								>
									Next section
									<ChevronRight size={16} />
								</button>
							) : (
								<button
									type="submit"
									disabled={isSubmitting}
									className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{isSubmitting ? "Submitting..." : "Submit My Application"}
									<ArrowRight size={16} />
								</button>
							)}
						</div>
						{status.type ? (
							<p
								className={`rounded-lg border px-4 py-3 text-sm ${status.type === "success"
										? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
										: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
									}`}
							>
								{status.message}
							</p>
						) : null}
						<p className="text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400">
							By submitting this form you agree to receive communications from BGA. Applications are
							reviewed by the BGA team, and membership is free and subject to community standards.
						</p>
					</div>
				</form>
			</AnimatedReveal>
		</div>
	);
}
