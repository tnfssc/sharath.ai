import { SocialIcons } from "./social-icons";

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-10 text-center text-sm text-base-content/80">
			<SocialIcons />
			<p>&copy; {year} sharath.ai</p>
		</footer>
	);
}
