import { h } from "../internal/Component.tsx";
import { JSX } from "https://esm.sh/preact";
import Store from "../modules/stores/mod.ts";

type LinkProps = {
  href: string;
  replace?: boolean;
  children?: any;
  element?: any;
} & JSX.HTMLAttributes<HTMLAnchorElement>;

export function Link(props: LinkProps) {
  const reducedProps = { ...props };
  delete reducedProps.children;
  delete reducedProps.replace;
  console.log("LINK PROPS", props)
  return (
    h.a({
      onClick: (e: Event) => {
        Router.navigate(props.href, { replace: props.replace });
        e.preventDefault();
      },
      ...reducedProps,
      ref: props.element,
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

export const Router = {
  store: new Store({
    path: location.pathname,
    params: new URLSearchParams(location.search),
    hash: location.hash,
  }),
  navigate(to: string, { replace = false } = {}) {
    if (window.location.pathname === to) {
      replace = true;
    }
    history[replace ? eventReplaceState : eventPushState](null, "", to);
    this.store.value = {
      path: to,
      params: new URLSearchParams(location.search),
      hash: location.hash,
    };
  },
  get path() {
    return this.store.value.path;
  },
  get params() {
    return this.store.value.params;
  },
  get hash() {
    return this.store.value.hash;
  },
};

if (typeof history !== "undefined") {
  for (const type of [eventPushState, eventReplaceState]) {
    // @ts-expect-error
    const original = history[type];
    /// @ts-expect-error
    history[type] = function () {
      const result = original.apply(this, arguments);
      const event = new Event(type);
      // @ts-expect-error
      event.arguments = arguments;
      dispatchEvent(event);
      return result;
    };
  }
}

function setRouteStore() {
  Router.store.value = {
    path: location.pathname,
    params: new URLSearchParams(location.search),
    hash: location.hash,
  };
}
for (const event of events) {
  addEventListener(event, () => {
    setRouteStore();
  });
}
