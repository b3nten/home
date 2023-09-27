import { Component, Define, createComponent } from "../internal/Component.tsx";
import clx from "../modules/tools/clx.ts";
import { Link, Router } from "./router.ts";

const posts = [
	{
		slug: "hello-world",
		title: "Hello World",
		summary: "My first post!",
	},
	{
		slug: "another-post",
		title: "Another Post",
		summary: "My second post!",
	}
]


export class PostsRoute extends Component {
	constructor() {
		super();
		this.addSubscription(Router.store);
	}
	render() {
		if(Router.path !== "/p") return;
		return  <div id="blog" className={clx("relative", "mx-auto", "w-fit", "px-4")}>
		<div className="py-12" />
		{/* <BackButton to="/" exiting={exiting} /> */}
		<h1 className="[font-size:clamp(0px,17vw,155px)] font-display leading-none opacity-20">
			POSTS
		</h1>
		<div className="py-6" />
		{
			<ul className="relative z-10 space-y-6">
				{posts.map((post) => (
					<li
						key={post.slug}
						className="max-w-4xl"
						data-blog-post
						style={{ opacity: 1 }}
					>
						<Link href={`/b/${post.slug}`}>
							<a
								className={clx(
									"px-3 py-3 md:py-8 block",
									"transition-all duration-300",
								)}
							>
								<div className="space-y-2 md:space-y-4">
									<div className="text-2xl md:text-4xl text-neutral-700">
										{post.title}
									</div>
									<div className="md:text-xl italic font-serif text-neutral-700">
										{post.summary}
									</div>
									<div
										className={"flex items-center justify-between"}
									>
										<div className="text-sm md:text-base text-neutral-700 flex-shrink-0">
											{/* {dayjs(post.date).format("MMM D, YYYY")} */}
										</div>
										{/* <div className="hidden md:flex ml-2 text-sm md:text-base text-neutral-700 items-start justify-start flex-wrap gap-2">
											{post.tags?.map((category) => (
												<span
													key={category}
													className="inline-block bg-neutral-700/10 rounded-full px-3 py-1 text-sm font-semibold text-neutral-700 mr-2"
												>
													{category}
												</span>
											))}
										</div> */}
									</div>
								</div>
							</a>
						</Link>
					</li>
				))}
			</ul>
		}
		<div className="py-12" />
	</div>
	}
}
createComponent("posts-route", PostsRoute)
