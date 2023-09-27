import { Component, createComponent } from "../internal/Component.tsx";
import { Link } from "./router.ts";
import clx from "../modules/tools/clx.ts";
import { animate, stagger } from "https://esm.sh/motion"

type AnimationControllerProps = {
	inAnim?: () => void | (() => void),
	outAnim?: () => void | (() => void),
	value?: boolean,
	delay?: number
}
function AnimationController(root: Component, props: AnimationControllerProps = {}) {
	let dispose: any;
	let timeout: any;
	let delayed = props.value
	let current = delayed
	function nextFrame(cb: () => void) {
		setTimeout(() => requestAnimationFrame(() => {
			cb()
		}))
	}
	return {
		in() {
			dispose?.()
			delayed = true
			current = true
			root.requestUpdate()
			nextFrame(() => {
				dispose = props.inAnim?.()
			})
		},
		out() {
			dispose?.()
			current = false
			nextFrame(() => {
				const stop = props.outAnim?.()
				dispose = () => {
					clearTimeout(timeout)
					stop?.()
				}
				root.requestUpdate()
			})
			timeout = setTimeout(() => {
				delayed = false
				root.requestUpdate()
			}, props.delay)
		},
		get delayed() {
			return delayed
		},
		get current() {
			return current
		}
	}
}

export class NavComponent extends Component {
	navRef: any;
	hamburgerRefs: any[] = [];
	linkRefs: any[] = [];

	navState = AnimationController(this, {
		value: false,
		delay: 1000,
		inAnim: () => {
			console.log(this.linkRefs)
			animate(this.navRef, { opacity: 1 }, { duration: 1 })
			animate(this.hamburgerRefs, { rotate: "45deg" }, { duration: 1, delay: stagger(.1) })
			animate(this.linkRefs, { opacity: 1 }, { duration: .5, delay: stagger(.1) })
		},
		outAnim: () => {
			animate(this.navRef, { opacity: 0 }, { duration: .5, delay: .5 })
			animate(this.hamburgerRefs, { rotate: "-0deg" }, { duration: 1, delay: stagger(.1) })
			animate(this.linkRefs, { opacity: 0 }, { duration: .5, delay: stagger(.1, { from: "last" }) })
		}
	})

	toggleNav = () => {
		if (this.navState.current) this.navState.out()
		else this.navState.in()
	}

	render() {
		return (
			<>
				<button
					onClick={this.toggleNav}
					className="z-[999] fixed right-2 top-2 sm:right-4 sm:top-4 md:right-12 md:top-12 space-y-2 p-4"
				>
					<div ref={r => this.hamburgerRefs[0] = r} className="w-13 h-3px bg-neutral-700" />
					<div ref={r => this.hamburgerRefs[1] = r} className="w-13 h-3px bg-neutral-700" />
					<div ref={r => this.hamburgerRefs[2] = r} className="w-13 h-3px bg-neutral-700" />
				</button>
				{
					this.navState.delayed &&
					<nav style={{
						opacity: 0,
					}} id="nav" ref={r => this.navRef = r} onClick={this.navState.out} className="absolute z-[100] inset-0 bg-black/20 backdrop-blur-xl">
						<div className="fixed inset-0">
							<div
								className="absolute inset-0 bg-black/20 backdrop-blur-lg"
								style={{ opacity: 0 }}
							/>
							<div
								className={clx(
									"absolute",
									"left-50% top-50% [transform:translate(-50%,-50%)]",
									"flex flex-col",
									"space-y-4",
									"z-10",
								)}
							>
								<Link
									element={r => this.linkRefs[0] = r}
									style={{
										opacity: 0,
									}}
									href="/"
									className={clx(
										"text-5xl",
										"font-bold",
										"text-neutral-300",
										"hover:text-neutral-100",
									)}
								>
									HOME
								</Link>
								<Link
									element={r => this.linkRefs[1] = r}
									href="/p"
									style={{
										opacity: 0,
									}}
									className={clx(
										"text-5xl",
										"font-bold",
										"text-neutral-300",
										"hover:text-neutral-100",
									)}
								>
									BLOG
								</Link>
								<a
									ref={r => this.linkRefs[2] = r}
									href="https://github.com/B3nten"
									className={clx(
										"text-5xl",
										"font-bold",
										"text-neutral-300",
										"hover:text-neutral-100",
									)}
									style={{
										opacity: 0,
									}}
									target="_blank"
								>
									GITHUB
								</a>
								<a
									ref={r => this.linkRefs[3] = r}
									href="https://github.com/B3nten"
									className={clx(
										"text-5xl",
										"font-bold",
										"text-neutral-300",
										"hover:text-neutral-100",
									)}
									style={{
										opacity: 0,
									}}
									target="_blank"
								>
									ARTSTATION
								</a>
							</div>
						</div>
					</nav>}
			</>

		);
	}
}

createComponent("nav-component", NavComponent)