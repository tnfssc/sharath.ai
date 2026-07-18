import { createFileRoute, Link } from "@tanstack/react-router";

import { getAllPosts, slugOf } from "#/lib/blog";
import { useBlogScrollRestoration } from "#/lib/blog-scroll";
import { canonicalLink, seo } from "#/lib/seo";

export const Route = createFileRoute("/blog/")({
	head: () => ({
		meta: [
			...seo({
				title: "Blog — sharath.ai",
				description: "Writing about AI agents, developer tools, and shipping.",
				url: "https://sharath.ai/blog",
			}),
		],
		links: [canonicalLink("https://sharath.ai/blog")],
	}),
	component: BlogIndex,
});

function BlogIndex() {
	useBlogScrollRestoration();
	const posts = getAllPosts();
	return (
		<section className="px-6 py-20 md:px-8">
			<div className="mx-auto max-w-2xl">
				<h1 className="mb-10 text-3xl font-medium tracking-tight md:text-4xl">
					<span style={{ viewTransitionName: "blog-heading" }}>Blog</span>
				</h1>

				{posts.length === 0 ? (
					<p className="text-base-content/70">No posts yet.</p>
				) : (
					<ul className="divide-y divide-base-300">
						{posts.map((post) => {
							const slug = slugOf(post);
							return (
								<li key={slug} className="py-6 first:pt-0 last:pb-0">
									<Link
										to="/blog/$slug"
										params={{ slug }}
										aria-label={post.title}
										className="group block"
									>
										<div className="flex gap-4">
											<div className="min-w-0 flex-1">
												<time
													dateTime={post.date.toISOString()}
													className="text-xs tabular-nums text-base-content/70 transition-colors group-hover:text-base-content/85"
												>
													{post.date.toISOString().slice(0, 10)}
												</time>
												<h2 className="mt-1 font-display text-lg font-medium leading-snug group-hover:text-primary text-balance">
													<span
														className="link-draw"
														style={{ viewTransitionName: `post-title-${slug}` }}
													>
														{post.title}
													</span>
												</h2>

												<div className="mt-2 flex items-center gap-2">
													{post.author.image && (
														<img
															src={post.author.image}
															alt=""
															className="size-5 rounded-full"
															referrerPolicy="no-referrer"
															style={{
																viewTransitionName: `post-avatar-${slug}`,
															}}
														/>
													)}
													<span className="text-xs text-base-content/70 transition-colors group-hover:text-base-content/85">
														{post.author.name}
													</span>
												</div>
												<p className="mt-1 text-sm text-base-content/70 transition-colors group-hover:text-base-content">
													{post.description}
												</p>
												{post.tags.length > 0 && (
													<p className="mt-1.5 text-xs text-base-content/70 transition-colors group-hover:text-base-content/90">
														{post.tags.join(" · ")}
													</p>
												)}
											</div>
											{post.heroImage && (
												<img
													src={post.heroImage}
													alt=""
													className="aspect-video h-32 shrink-0 rounded-lg object-cover hidden sm:block"
													referrerPolicy="no-referrer"
													style={{ viewTransitionName: `post-hero-${slug}` }}
												/>
											)}
										</div>
									</Link>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</section>
	);
}
