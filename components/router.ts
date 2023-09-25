import { Component, Define, Signal, h } from "../internal/Component.tsx";
import { JSX } from "https://esm.sh/preact";

type LinkProps = {
  href: string;
  replace?: boolean;
  children?: any;
} & JSX.HTMLAttributes<HTMLAnchorElement>;

export function Link(props: LinkProps) {
  const reducedProps = { ...props };
  delete reducedProps.children;
  delete reducedProps.replace;
  return (
    h.a({
      onClick: (e: Event) => {
        RouteStore.value.navigate(props.href, { replace: props.replace });
        e.preventDefault();
      },
      ...reducedProps,
    }, props.children)
  );
}

const eventPopstate = "popstate";
const eventPushState = "pushState";
const eventReplaceState = "replaceState";
const eventHashchange = "hashchange";
export const events = [
  eventPopstate,
  eventPushState,
  eventReplaceState,
  eventHashchange,
];

export const RouteStore = Signal({
  path: location.pathname,
  params: new URLSearchParams(location.search),
  hash: location.hash,
  navigate: (to: string, { replace = false } = {}) => {
    if(window.location.pathname === to) {
      replace = true;
    }
    history[replace ? eventReplaceState : eventPushState](null, "", to);
  },
});

if (typeof history !== "undefined") {
  for (const type of [eventPushState, eventReplaceState]) {
    const original = history[type];
    // TODO: we should be using unstable_batchedUpdates to avoid multiple re-renders,
    // however that will require an additional peer dependency on react-dom.
    // See: https://github.com/reactwg/react-18/discussions/86#discussioncomment-1567149
    history[type] = function () {
      const result = original.apply(this, arguments);
      const event = new Event(type);
      event.arguments = arguments;

      dispatchEvent(event);
      return result;
    };
  }
}

@Define("route-handler")
export class RouteHandler extends Component {
  constructor() {
    function setRouteStore() {
      RouteStore.value.hash = location.hash;
      RouteStore.value.path = location.pathname;
      RouteStore.value.params = new URLSearchParams(location.search);
    }
    super();
    for (const event of events) {
      addEventListener(event, () => {
        setRouteStore();
      });
    }
  }

  render() {
    return null;
  }
}
