import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import PlaceholderBlock from "../components/PlaceholderBlock";

export default function Contact() {
	return (
		<div className="space-y-8">
			<header className="rounded-2xl bg-gradient-to-br from-primary/10 via-white to-primary/5 p-6 dark:via-[#0B1220]">
				<h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
					<Send size={22} /> Contact
				</h1>
				<p className="mt-1 text-gray-600 dark:text-gray-300">
					Get in touch for partnerships, support, or media. We’d love to hear from you.
				</p>
			</header>
			<div className="grid gap-6 sm:grid-cols-2">
				<div className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
					<div className="flex items-center gap-2">
						<Mail size={16} className="text-primary" />
						<h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
					</div>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">hello@bizgrowth.africa</p>
				</div>
				<div className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800">
					<div className="flex items-center gap-2">
						<Phone size={16} className="text-primary" />
						<h3 className="font-semibold text-gray-900 dark:text-white">Phone</h3>
					</div>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">+234 (0) 800 000 0000</p>
				</div>
				<div className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:border-gray-800 dark:bg-[#0B1220] dark:ring-gray-800 sm:col-span-2">
					<div className="flex items-center gap-2">
						<MapPin size={16} className="text-primary" />
						<h3 className="font-semibold text-gray-900 dark:text-white">Address</h3>
					</div>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Lagos, Nigeria</p>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<div>
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Send us a message</h3>
					<PlaceholderBlock title="Contact Form Placeholder" height="h-64" />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Find us</h3>
					<PlaceholderBlock title="Map Embed Placeholder" height="h-64" />
					<div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
						<Clock size={16} className="text-primary" /> Mon–Fri, 9am–6pm (WAT)
					</div>
				</div>
			</div>
		</div>
	);
}


