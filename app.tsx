import { Component, Define, Property, Bind, h, Attribute } from "./internal/Component.tsx";
import Store from "./modules/stores/mod.ts";

const doublecount = new Store(0);


interface IAppRoot {
  count: number;
  increment(): void;
}
@Define<IAppRoot>("app-root")
export class AppRoot extends Component {
  @Property count = 0;
  @Bind increment() {
    this.count++;
    doublecount.value = this.count * 2;
  }
  constructor(){
    super()
  }
  render() {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <span className="text-2xl">The count is <span className="text-blue-400">{this.count}</span></span>
        <button onClick={this.increment} className="bg-blue-400 px-2 py-1 rounded-sm text-white">Increment count</button>
        <test-comp></test-comp>
      </div>
    )
  }
}

interface ITestComp {
}

@Define<ITestComp>("test-comp")
export class TestComp extends Component {
  doublecount = this.addSubscribable(doublecount)
  render() {
    return <span className="text-2xl">doublecount = {this.doublecount.value}</span>
  }
}