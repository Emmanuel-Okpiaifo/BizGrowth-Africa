import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, User } from 'lucide-react';
import { validateCredentials, setAuthSession } from '../../utils/adminAuth';

/**
 * Admin Login Component
 * Uses sessionStorage so credentials are cleared when tab closes
 * Supports multiple users with username and password
 */
export default function AdminLogin({ onLogin }) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [focusedField, setFocusedField] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		
		// Basic validation
		if (!username.trim() || !password.trim()) {
			setError('Please enter both username and password.');
			return;
		}

		setLoading(true);

		// Simulate a small delay for better UX
		await new Promise(resolve => setTimeout(resolve, 400));

		// Validate credentials
		if (validateCredentials(username.trim(), password)) {
			// Store in sessionStorage (clears when tab closes)
			setAuthSession(username.trim());
			onLogin();
		} else {
			setError('Invalid username or password. Please try again.');
			setPassword('');
			setUsername('');
		}

		setLoading(false);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#0A0F1A] dark:via-[#0B1220] dark:to-[#0A0F1A] px-4 py-12">
			<div className="w-full max-w-md">
				{/* Logo & Header */}
				<div className="text-center mb-10">
					<div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-red-600 to-red-700 shadow-2xl mb-6 transform transition-transform hover:scale-105">
						<Lock className="w-10 h-10 text-white" />
					</div>
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
						Admin Panel
					</h1>
					<p className="text-gray-600 dark:text-gray-400 text-lg">
						Sign in to access the content management system
					</p>
				</div>

				{/* Login Form */}
				<div className="bg-white dark:bg-[#0B1220] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 backdrop-blur-sm">
					<form onSubmit={handleSubmit} className="space-y-5">
						{/* Username Input */}
						<div>
							<label 
								htmlFor="username" 
								className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
							>
								Username
							</label>
							<div className="relative">
								<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
									<User size={20} />
								</div>
								<input
									id="username"
									type="text"
									value={username}
									onChange={(e) => {
										setUsername(e.target.value);
										setError('');
									}}
									onFocus={() => setFocusedField('username')}
									onBlur={() => setFocusedField(null)}
									placeholder="Enter your username"
									className={`w-full rounded-xl border-2 ${
										focusedField === 'username'
											? 'border-primary shadow-lg shadow-primary/20'
											: 'border-gray-300 dark:border-gray-700'
									} bg-white dark:bg-[#0A0F1A] px-12 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-all duration-300`}
									autoFocus
									disabled={loading}
									autoComplete="username"
								/>
							</div>
						</div>

						{/* Password Input */}
						<div>
							<label 
								htmlFor="password" 
								className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
							>
								Password
							</label>
							<div className="relative">
								<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
									<Lock size={20} />
								</div>
								<input
									id="password"
									type={showPassword ? 'text' : 'password'}
									value={password}
									onChange={(e) => {
										setPassword(e.target.value);
										setError('');
									}}
									onFocus={() => setFocusedField('password')}
									onBlur={() => setFocusedField(null)}
									placeholder="Enter your password"
									className={`w-full rounded-xl border-2 ${
										focusedField === 'password'
											? 'border-primary shadow-lg shadow-primary/20'
											: 'border-gray-300 dark:border-gray-700'
									} bg-white dark:bg-[#0A0F1A] px-12 py-3.5 pr-12 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-all duration-300`}
									disabled={loading}
									autoComplete="current-password"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
									disabled={loading}
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? (
										<EyeOff size={20} />
									) : (
										<Eye size={20} />
									)}
								</button>
							</div>
						</div>

						{/* Error Message */}
						{error && (
							<div className="rounded-xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 p-4 text-sm text-red-800 dark:text-red-300 animate-in fade-in slide-in-from-top-2">
								<div className="flex items-center gap-2">
									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
									</svg>
									<span>{error}</span>
								</div>
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading || !username.trim() || !password.trim()}
							className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-red-600 px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:from-primary/90 hover:to-red-600/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transform"
						>
							{loading ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									<span>Signing in...</span>
								</>
							) : (
								<>
									<Lock size={18} />
									<span>Sign In</span>
								</>
							)}
						</button>
					</form>

					{/* Info Note */}
					<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
						<div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<p>Your session will expire when you close this tab</p>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-8 text-center">
					<a 
						href="https://bizgrowthafrica.com" 
						target="_blank" 
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors duration-300"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
						<span>Back to Website</span>
					</a>
				</div>
			</div>
		</div>
	);
}
