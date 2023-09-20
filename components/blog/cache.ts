import { Component, Define, h } from "../../internal/Component.tsx";

declare global {
  module globalThis {
    var BlogCache: BlogCache;
  }
}

@Define("blog-cache")
export class BlogCache extends Component {
  posts = new Map<string, string>();

  constructor() {
    super();
    globalThis.BlogCache = this;
    const posts = JSON.parse(this.textContent ?? "{}");
    for (const key in posts) {
      this.posts.set(key, posts[key]);
    }
  }

  async getPost(key: string): Promise<string | undefined> {
    if (this.posts.has(key)) return this.posts.get(key);
    const response = await fetch(`/p/${key}.html`);
    if (response.status === 200) {
      const html = await response.text();
      this.posts.set(key, html);
      return html;
    } else {
      return "Not found";
    }
  }

  render() {
    return null;
  }
}
