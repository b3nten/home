import { Component, Define, Property, h } from "../internal/Component.tsx";
import { RouteStore } from "./router.ts";

@Define("posts-route")
export class PostsRoute extends Component {
	@Property something = "lol"
	// router = this.addSubscribable(RouteStore);
	render() {
		// console.log(this.router.value.path)
		// if(this.router.value.path !== "/posts") return null;
		return <div>Posts</div>;
	}
}
