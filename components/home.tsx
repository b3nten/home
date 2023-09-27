import { Component, h, createComponent } from '../internal/Component.tsx';
import clx from "../modules/tools/clx.ts";
import { Router, Link } from './router.ts';


export class HomeRoute extends Component {
	y = window.innerHeight;
	constructor() {
		super();
		this.addSubscription(Router.store)
		this.addEventListener("resize", () => {
			this.y = window.innerHeight;
			this.requestUpdate();
		})
	}
	render() {
		if (Router.path !== '/') return;
		return (
			<div id="home" className="relative z-10 overflow-hidden" style={{ height: this.y + "px" }}>
				<p
					id="ben"
					key="ben"
					className={clx(
						"absolute",
						"top-3vw",
						"left-3vw",
						"leading-[.8]",
						"font-extrabold",
						"font-sans",
						"cursor-default",
						"text-neutral-700/20",
						"pointer-events-none",
					)}
					style={{
						fontSize: "max(17vw, 150px)",
					}}
				>
					BEN
				</p>
				<p
					key="ten"
					id="ten"
					className={clx(
						"absolute",
						"bottom-3vw",
						"right-3vw",
						"text-15vw",
						"leading-[.8]",
						"font-extrabold",
						"font-sans",
						"cursor-default",
						"text-neutral-700/20",
						"pointer-events-none",
					)}
					style={{
						fontSize: "max(17vw, 150px)",
					}}
				>
					TEN
				</p>
				<SplitP />
			</div>
		)
	}
}
createComponent("home-route", HomeRoute)

function SplitP() {
	return (
		<p className="absolute bottom-60 md:bottom-48 left-12 md:left-48 text-2xl text-neutral-700">
			<WordsToSpans>
				Software developer and 3d artist.
			</WordsToSpans>
			<br />
			<WordsToSpans>
				Building experences for the modern web.
			</WordsToSpans>
			<br />
			<span className="block py-4"></span>
			<Link
				href="/b"
				className="text-xl underline"
				id="blink"
				style={{ opacity: 0 }}
			>
				BLOG
			</Link>
		</p>
	)
}

function WordsToSpans({
	children,
}: {
	children: string;
}) {
	return (
		<>
			{children.split(" ").map((word, i) => (
				<span
					key={i}
					style={{ opacity: 1 }}
				>
					{word}
					{" "}
				</span>
			))}
		</>
	);
}