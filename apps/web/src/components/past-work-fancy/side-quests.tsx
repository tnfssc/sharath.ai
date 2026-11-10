import { Reveal } from "#/components/reveal";
import { CHANNEL_URL, type Video } from "#/lib/youtube";

function VideoRow({ video }: { video: Video }) {
	return (
		<a
			className="group block py-5 pr-28 focus-visible:outline-2 focus-visible:outline-offset-4 sm:pr-48"
			href={video.href}
			rel="noreferrer"
			target="_blank"
		>
			<span className="font-display text-lg font-medium link-draw group-hover:text-primary">
				{video.title}
			</span>
			<p className="mt-1 text-xs text-base-content/60 transition-colors group-hover:text-base-content/90">
				{video.kind} · <time dateTime={video.published}>{video.date}</time>
			</p>
			<img
				alt=""
				className="quest-thumb pointer-events-none absolute top-1/2 right-0 aspect-video w-24 -translate-y-1/2 rounded-lg object-cover sm:w-40"
				height={180}
				loading="lazy"
				referrerPolicy="no-referrer"
				src={video.thumbnail}
				width={320}
			/>
		</a>
	);
}

/**
 * Latest YouTube uploads as bordered rows. With a mouse, one thumbnail shows
 * at a time (the hovered row's, or the newest when idle); on touch they are
 * all visible, since there is no hover to reveal them. See `.quest-thumb` in
 * styles.css. Renders nothing when the feed came back empty.
 */
export function SideQuests({ videos }: { videos: Video[] }) {
	if (videos.length === 0) return null;

	return (
		<section className="px-6 py-20 md:px-8">
			<div className="mx-auto max-w-2xl">
				<Reveal>
					<h2 className="mb-2 text-2xl font-medium tracking-tight md:text-3xl">
						Side quests
					</h2>
					<p className="mb-6 text-sm text-base-content/60">
						Songs and videos I make with AI, for fun.
					</p>
				</Reveal>

				<Reveal delay={0.1}>
					<ul className="quest-list divide-y divide-base-300">
						{videos.map((video) => (
							<li key={video.id} className="relative">
								<VideoRow video={video} />
							</li>
						))}
					</ul>
					<a
						className="group mt-4 inline-block text-sm font-medium transition-colors duration-200 hover:text-primary"
						href={CHANNEL_URL}
						rel="noreferrer"
						target="_blank"
					>
						All videos
						<span className="ml-0.5 inline-block transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
							↗
						</span>
					</a>
				</Reveal>
			</div>
		</section>
	);
}
