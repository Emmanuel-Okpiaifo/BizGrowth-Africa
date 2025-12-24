import { Mail, Users, Download, FileText, Megaphone, Send, Handshake, Phone } from "lucide-react";
export default function HomepageCTABar() {
	const items = [
		{ label: "Subscribe", href: "#newsletter", icon: Mail },
		{ label: "Join Community", href: "/community", icon: Users },
		{ label: "Download Templates", href: "/tools-templates", icon: Download },
		{ label: "Post a Tender", href: "/procurement-tenders", icon: FileText },
		{ label: "Advertise with Us", href: "/contact", icon: Megaphone },
		{ label: "Submit a Story", href: "/contact", icon: Send },
		{ label: "Partner with Us", href: "/contact", icon: Handshake },
		{ label: "Contact", href: "/contact", icon: Phone },
	];
	return (
		<section className="relative">
			<div className="no-scrollbar -mx-4 overflow-x-auto px-4">
				<div className="flex gap-3">
					{items.map((it) => {
						const Icon = it.icon;
						return (
						<a
							key={it.label}
							href={it.href}
							className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-[#0B1220] dark:text-gray-200"
						>
							<Icon size={14} /> {it.label}
						</a>
					)})}
				</div>
			</div>
			<style>{`
				.no-scrollbar::-webkit-scrollbar { display: none; }
				.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
			`}</style>
		</section>
	);
}


