import { Send } from "lucide-react";
export default function NewsletterCTA() {
	return (
		<section className="relative overflow-hidden rounded-2xl border bg-white dark:border-gray-800 dark:bg-[#0B1220]">
			<div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
			<div className="relative px-6 py-10 sm:px-10 sm:py-12">
				<div className="max-w-xl">
					<h3 className="text-xl font-bold text-gray-900 dark:text-white">Get daily African business insights</h3>
					<p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
						Join our newsletter to receive curated market news, funding updates, and expert analysis.
					</p>
				</div>
				<form
					className="mt-6 flex max-w-lg gap-2"
					onSubmit={(e) => {
						e.preventDefault();
						alert("Thanks for subscribing!");
					}}
				>
					<input
						type="email"
						required
						placeholder="Enter your email"
						className="w-full flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition placeholder:text-gray-400 focus:border-primary dark:border-gray-700 dark:bg-transparent dark:text-white"
					/>
					<button
						type="submit"
						className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
					>
						<Send size={14} /> Subscribe
					</button>
				</form>
			</div>
		</section>
	);
}


