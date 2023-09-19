interface IAppRoot {
  count: number;
  increment(): void;
}
@Define<IAppRoot>("app-root")
export class AppRoot extends Component {
  @Property count = 0;
  @Bind increment() {
    this.count++;
  }
  render() {
    return (
      h.div({ className: "flex flex-col items-center justify-center h-screen space-y-4" },
        h.span({ className: "text-2xl" }, "The count is ", h.span({ className: "text-blue-400" }, this.count)),
        h.button({ onClick: this.increment, className: "bg-blue-400 px-2 py-1 rounded-sm text-white" }, "Increment count"),
      )
    )
  }
}