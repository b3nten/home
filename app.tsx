interface IAppRoot {
  count: number;
  increment(): void;
}
@Define<IAppRoot>("app-root")
export class AppRoot extends Component {
  @Property count = 0;
  @Property someText = "lol"
  @Bind increment() {
    this.count++;
    this.someText = "cool"
  }
  render() {
    return (
      h.div(
        h.span("The count is ", this.count),
        h.button({ onClick: this.increment }, "Increment count"),
      )
    )
  }
}