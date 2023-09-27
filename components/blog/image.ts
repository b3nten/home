import { Component, createComponent, h } from "../../internal/Component.tsx";

export class BlogImage extends Component {
	attrs = {
		src: "",
		alt: "",
		caption: "",
	}
	async render() {
		return h("figure", {
			class: "my-8",
		}, [
			h("img", {
				class: "w-full",
				src: this.attrs.src,
				alt: this.attrs.alt,
			}),
			h("figcaption", {
				class: "text-sm text-neutral-500",
			}, this.attrs.caption),
		]);
	}
}
createComponent("blog-image", BlogImage);