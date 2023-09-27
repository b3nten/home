import {  Component, createComponent } from '../../internal/Component.tsx';
import { Router } from "../router.ts";

class BlogPost extends Component {
	post?: any
	create(): void {
		this.addSubscription(Router.store)
		this.getCurrentPost()
	}

	update(): void {
		// this.getCurrentPost()
	}

	async getCurrentPost(){
		const slug = "on-architecting-a-blog"
		this.post = await BlogCache.getPost(slug)
		this.requestUpdate()
	}

	render(){
		if(!Router.path.startsWith("/p/")) return;
		return <div>
			<h1>Blog Post</h1>
			<div dangerouslySetInnerHTML={{
				__html: this.post?.content
			}}/>
		</div>
	}
}

createComponent("blog-route", BlogPost)