import { Component, Define, Attribute, h } from "../../internal/Component.tsx";

@Define("blog-image")
export class BlogImage extends Component {
	@Attribute src = "";
	@Attribute alt = "";
	@Attribute caption = "";

	async render() {
		return h("figure", {
			class: "my-8",
		}, [
			h("img", {
				class: "w-full",
				src: this.src,
				alt: this.alt,
			}),
			h("figcaption", {
				class: "text-sm text-neutral-500",
			}, this.caption),
		]);
	}
}