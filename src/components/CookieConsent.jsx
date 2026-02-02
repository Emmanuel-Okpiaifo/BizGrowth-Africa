import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Settings, Check, Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'bizgrowth_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'bizgrowth_cookie_preferences';

/**
 * Cookie Consent Component
 * Shows cookie consent popup on homepage only
 * Stores user preferences and doesn't show again if user has already made a choice
 */
export default function CookieConsent() {
	const location = useLocation();
	const [showConsent, setShowConsent] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [preferences, setPreferences] = useState({
		analytics: true, // Default to true for analytics
		necessary: true // Always true (can't be disabled)
	});

	// Check if user is on homepage
	const isHomepage = location.pathname === '/';

	// Apply cookie preferences (enable/disable GA4)
	const applyCookiePreferences = (prefs) => {
		if (window.gtag) {
			if (prefs.analytics) {
				// Enable Google Analytics
				window.gtag('consent', 'update', {
					'analytics_storage': 'granted',
					'ad_storage': 'denied' // We don't use ad storage
				});
				// Track initial page view if analytics was just enabled
				if (window.location.pathname) {
					window.gtag('config', 'G-JEYX2LNTQY', {
						page_path: window.location.pathname + window.location.search
					});
				}
			} else {
				// Disable Google Analytics
				window.gtag('consent', 'update', {
					'analytics_storage': 'denied',
					'ad_storage': 'denied'
				});
			}
		}
	};

	// Load saved preferences
	useEffect(() => {
		if (!isHomepage) {
			setShowConsent(false);
			return;
		}

		const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
		const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

		if (savedConsent === 'accepted' || savedConsent === 'rejected') {
			// User has already made a choice, don't show popup
			setShowConsent(false);
			
			// Load saved preferences and apply them
			if (savedPreferences) {
				try {
					const prefs = JSON.parse(savedPreferences);
					setPreferences(prefs);
					applyCookiePreferences(prefs);
				} catch (error) {
					console.error('Error loading cookie preferences:', error);
				}
			}
		} else {
			// User hasn't made a choice yet, show popup
			setShowConsent(true);
		}
	}, [isHomepage]);

	// Handle accept all
	const handleAcceptAll = () => {
		const prefs = {
			analytics: true,
			necessary: true
		};
		setPreferences(prefs);
		localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
		localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
		applyCookiePreferences(prefs);
		setShowConsent(false);
	};

	// Handle reject all
	const handleRejectAll = () => {
		const prefs = {
			analytics: false,
			necessary: true
		};
		setPreferences(prefs);
		localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
		localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
		applyCookiePreferences(prefs);
		setShowConsent(false);
	};

	// Handle save preferences
	const handleSavePreferences = () => {
		localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
		localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
		applyCookiePreferences(preferences);
		setShowConsent(false);
		setShowSettings(false);
	};

	// Toggle preference
	const togglePreference = (key) => {
		if (key === 'necessary') return; // Can't disable necessary cookies
		setPreferences(prev => ({
			...prev,
			[key]: !prev[key]
		}));
	};

	// Don't render if not on homepage or if user has already made a choice
	if (!isHomepage || !showConsent) {
		return null;
	}

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6" style={{ animation: 'slideUp 0.3s ease-out' }}>
			<div className="mx-auto max-w-4xl">
				<div className="bg-white dark:bg-[#0B1220] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
					{!showSettings ? (
						// Main consent view
						<div className="space-y-6">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0">
									<div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
										<Cookie className="w-6 h-6 text-primary" />
									</div>
								</div>
								<div className="flex-1">
									<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
										We Value Your Privacy
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
										We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
										By clicking "Accept All", you consent to our use of cookies. You can also customize your preferences 
										or reject non-essential cookies.{" "}
										<a 
											href="/privacy-policy" 
											className="text-primary hover:underline font-medium"
										>
											Learn more in our Privacy Policy
										</a>.
									</p>
								</div>
								<button
									onClick={handleRejectAll}
									className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
									aria-label="Close"
									title="Close (rejects non-essential cookies)"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="flex flex-col sm:flex-row gap-3">
								<button
									onClick={handleRejectAll}
									className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
								>
									Reject All
								</button>
								<button
									onClick={() => setShowSettings(true)}
									className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
								>
									<Settings className="w-4 h-4" />
									Customize
								</button>
								<button
									onClick={handleAcceptAll}
									className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors flex-1 sm:flex-initial"
								>
									Accept All
								</button>
							</div>
						</div>
					) : (
						// Settings view
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h3 className="text-xl font-bold text-gray-900 dark:text-white">
									Cookie Preferences
								</h3>
								<button
									onClick={() => setShowSettings(false)}
									className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
									aria-label="Close settings"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="space-y-4">
								{/* Necessary Cookies */}
								<div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<h4 className="font-semibold text-gray-900 dark:text-white">
													Necessary Cookies
												</h4>
												<span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
													Always Active
												</span>
											</div>
											<p className="text-sm text-gray-600 dark:text-gray-300">
												These cookies are essential for the website to function properly. They enable basic features 
												like page navigation, dark mode preferences, and form submissions. They cannot be disabled.
											</p>
											<div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
												<strong>Cookies used:</strong> Theme preferences, form data, user ID
											</div>
										</div>
										<div className="ml-4">
											<div className="w-12 h-6 rounded-full bg-primary flex items-center justify-end px-1">
												<Check className="w-4 h-4 text-white" />
											</div>
										</div>
									</div>
								</div>

								{/* Analytics Cookies */}
								<div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<h4 className="font-semibold text-gray-900 dark:text-white mb-1">
												Analytics Cookies
											</h4>
											<p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
												These cookies help us understand how visitors interact with our website by collecting and 
												reporting information anonymously. This helps us improve our website and user experience.
											</p>
											<div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
												<div><strong>Cookies used:</strong> _ga, _ga_*</div>
												<div><strong>Duration:</strong> 1 year 1 month 4 days</div>
												<div><strong>Provider:</strong> Google Analytics</div>
											</div>
										</div>
										<button
											onClick={() => togglePreference('analytics')}
											className={`ml-4 w-12 h-6 rounded-full transition-colors relative ${
												preferences.analytics
													? 'bg-primary'
													: 'bg-gray-300 dark:bg-gray-600'
											}`}
											aria-label="Toggle analytics cookies"
										>
											<span
												className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
													preferences.analytics ? 'translate-x-6' : 'translate-x-0'
												}`}
											/>
										</button>
									</div>
								</div>
							</div>

							<div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
								<p className="text-xs text-gray-500 dark:text-gray-400 text-center">
									For more information about how we handle your data, please read our{" "}
									<a 
										href="/privacy-policy" 
										className="text-primary hover:underline font-medium"
									>
										Privacy Policy
									</a>.
								</p>
								<div className="flex flex-col sm:flex-row gap-3">
									<button
										onClick={() => setShowSettings(false)}
										className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
									>
										Cancel
									</button>
									<button
										onClick={handleSavePreferences}
										className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors flex-1"
									>
										Save Preferences
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
