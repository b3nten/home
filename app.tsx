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
  constructor(){
    super()
  }
  render() {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <span className="text-2xl">The count is <span className="text-blue-400">{this.count}</span></span>
        <button onClick={this.increment} className="bg-blue-400 px-2 py-1 rounded-sm text-white">Increment count</button>
      </div>
    )
  }
}