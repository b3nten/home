import { Attribute, Component, Define, h } from "../../internal/Component.tsx";

@Define("blog-title")
export class BlogH1 extends Component {
  @Attribute
  content = "";
  async render() {
    return h("h1", {
      class: "text-7xl text-neutral-700 font-bold pb-8",
    }, this.content);
  }
}

@Define("blog-subtitle")
export class BlogH2 extends Component {
  @Attribute
  content = "";
  async render() {
    return h("h2", {
      class: "text-5xl text-neutral-700 pb-6 font-bold",
    }, this.content);
  }
}

@Define("blog-heading")
export class BlogH3 extends Component {
  @Attribute
  content = "";
  async render() {
    return h("h3", {
      class: "text-3xl text-neutral-700 pb-6 font-bold",
    }, this.content);
  }
}

@Define("blog-subheading")
export class BlogH4 extends Component {
  @Attribute
  content = "";
  async render() {
    return h("h4", {
      class: "text-2xl text-neutral-700 pb-4 font-bold",
    }, this.content);
  }
}


