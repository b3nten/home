import { Component, createComponent, h } from "../../internal/Component.tsx";


export class BlogH1 extends Component {
  async render() {
    return h("h1", {
      class: "text-7xl text-neutral-700 font-bold pb-8",
    }, h("slot", null));
  }
}
createComponent("blog-title", BlogH1);

export class BlogH2 extends Component {
  async render() {
    return h("h2", {
      class: "text-5xl text-neutral-700 pb-6 font-bold",
    },  h("slot", null));
  }
}
createComponent("blog-subtitle", BlogH2);

export class BlogH3 extends Component {
  async render() {
    return h("h3", {
      class: "text-3xl text-neutral-700 pb-6 font-bold",
    },  h("slot", null));
  }
}
createComponent("blog-heading", BlogH3);


export class BlogH4 extends Component {
  async render() {
    return h("h4", {
      class: "text-2xl text-neutral-700 pb-4 font-bold",
    },  h("slot", null));
  }
}
createComponent("blog-subheading", BlogH4);


