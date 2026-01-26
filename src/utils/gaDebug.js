/**
 * Debug utility to check GA4 implementation
 * Use this in browser console to verify GA4 is working
 */

export function checkGA4Status() {
	if (typeof window === 'undefined') {
		console.log('❌ Window object not available');
		return;
	}

	console.log('=== GA4 Debug Check ===');
	
	// Check dataLayer
	if (window.dataLayer) {
		console.log('✅ dataLayer exists:', window.dataLayer);
	} else {
		console.log('❌ dataLayer not found');
	}

	// Check gtag function
	if (typeof window.gtag === 'function') {
		console.log('✅ gtag function exists');
	} else {
		console.log('❌ gtag function not found');
	}

	// Check if GA script is loaded
	const gaScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
	if (gaScript) {
		console.log('✅ GA4 script tag found');
	} else {
		console.log('❌ GA4 script tag not found');
	}

	// Check measurement ID
	const configScript = document.querySelector('script');
	if (configScript && configScript.textContent.includes('G-JEYX2LNTQY')) {
		console.log('✅ Measurement ID found in script');
	} else {
		console.log('❌ Measurement ID not found');
	}

	console.log('=== End Debug Check ===');
}

// Auto-run in development
if (import.meta.env.DEV) {
	setTimeout(() => {
		if (typeof window !== 'undefined') {
			checkGA4Status();
		}
	}, 2000);
}
