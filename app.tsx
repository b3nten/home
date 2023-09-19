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
      h.div(
        h.span("The count is ", this.count),
        h.button({ onClick: this.increment }, "Increment count"),
      )
    )
  }
}