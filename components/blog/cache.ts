import { Component, createComponent, h } from "../../internal/Component.tsx";

declare global {
  module globalThis {
    var BlogCache: {
      getPost(key: string): Promise<BlogPost | undefined>;
    }
  }
}

type BlogPost = {
  title: string;
  summary: string;
  date: string;
  content: string;
};


createComponent("blog-cache", class BlogCache extends Component {
  posts = new Map<string, BlogPost>();
  
  constructor() {
    super();
    globalThis.BlogCache = this;
    const posts = JSON.parse(this.textContent ?? "{}");
    for (const key in posts) {
      this.posts.set(key, posts[key]);
    }
  }

  async getPost(key: string): Promise<BlogPost | undefined> {
    if (this.posts.has(key)) return this.posts.get(key);
    const response = await fetch(`/p/${key}.json`);
    if (response.status === 200) {
      const post = await response.json();
      this.posts.set(key, post);
      return post;
    } else {
      return undefined;
    }
  }

  render() {
    return null;
  }
});
