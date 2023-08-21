import ImHTML from "https://raw.githubusercontent.com/imhtml/imhtml/main/mod.ts"

class Component extends ImHTML {
	count = 0
	render() {
		return this.t`
		<style>
		@import url('/styles.css');
		@import url('/reset.css');
		</style>
		<div class="bg-red-500">
			<h1>Hello World</h1>
			<p>Count: ${this.count}</p>
			<button onclick=${() => {this.count++}}>Click Me</button>
			<div> dimensions: x=${window.innerWidth} y=${window.innerHeight}</div>
		</div>
		`;
	}
}

customElements.define("app-root", Component)