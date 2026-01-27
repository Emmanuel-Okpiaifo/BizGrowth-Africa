import { Component } from 'react';

export class ErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	componentDidCatch(error, errorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B1220] p-4">
					<div className="max-w-md w-full rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-6">
						<h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">
							Something went wrong
						</h2>
						<p className="text-sm text-red-600 dark:text-red-400 mb-4">
							{this.state.error?.message || 'An error occurred while loading this page.'}
						</p>
						<button
							onClick={() => {
								this.setState({ hasError: false, error: null });
								window.location.reload();
							}}
							className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
						>
							Reload Page
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
