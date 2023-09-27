import { h as _h, render, JSX, Fragment } from 'https://esm.sh/preact'

type ElementProps<T extends keyof JSX.IntrinsicElements> = JSX.IntrinsicElements[T] & {
  [key: string]: any;
};

type IntrinsicElementCreator = {
  [K in keyof JSX.IntrinsicElements]: (
    attrs: ElementProps<K> | string | number | boolean | undefined | JSX.Element | null,
    ...children: any[]
  ) => any;
} & typeof _h;

/**
 * Creates a better h function that allows you to use JSX-like syntax
 * with any element, not just HTML elements.
 * @param h The h function to wrap
 * @returns A better h function
 * @example
 * // Usage
 * const h = createBetterH(_h)
 * const MyComponent = () => {
 *  return (
 *   h.div({ className: "text-lg" }, 
 *    h(MyComponent, { someProp: true }, h.span("Hello"), h.span("World")))
 *  ))
 * }
 */
export function createBetterH(h: any): IntrinsicElementCreator {
  return new Proxy(h, {
    get: function (_, prop: string) {
      return function (attrs: any, ...children: any[]) {
        if (attrs && attrs["type"] || typeof attrs !== 'object' || Array.isArray(attrs)) {
          attrs = { children: [attrs, ...children] }
        } else if (children) {
          attrs.children = attrs.children || []
          attrs.children = [...attrs.children, ...children]
        }
        return _h(prop, attrs)
      }
    },
    apply: function (_, __, args) {
      // console.log(args)
      // if(args[0] && typeof args[0] === "object" && "tag" in args[0].prototype) return _h(args[0].prototype.tag, args[1])
      return h(...args)
    }
  }) as IntrinsicElementCreator
}

export const h = createBetterH(_h)

export function createComponent<T>(tagName: string, constructor: Constructor<T>) {
  constructor.prototype.tag = tagName;
  customElements.define(tagName, constructor as any);
  return function (props: T, ref: any) {
    // Define the custom element
    return _h(tagName, { ...props, ref })
  };
}

/**
 * Base class for components.
 * Only properties and attributes are reactive by default.
 * Call this.update() to update the component synchronously.
 * Observe attributes by using the @Attribute decorator, or by adding them to the observedAttributes array.
 * Observe properties by using the @Property decorator, or by adding them to the observedProperties array.
 */
export abstract class Component extends HTMLElement {
  props: Record<string | number | symbol, any> = {}
  attrs: Record<string | number | symbol, any> = {}

  #props: any = {}
  #disposables: Array<(...args: any) => any> = []
  #dirty = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const styles = document.head.querySelector("#_global_styles")?.textContent || "";
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    if (this.shadowRoot) this.shadowRoot.adoptedStyleSheets = [sheet];
  }

  #handleObservables() {
    // @ts-ignore
    for (const key of Object.keys(this.props)) {
      this.#props[key] = this.props[key]
      Object.defineProperty(this.props, key, {
        set(value) {
          this.#props[key] = value;
          this.requestUpdate();
        },
        get() {
          return this.#props[key]
        }
      })
    }
    for (const key of Object.keys(this.attrs)) {
      Object.defineProperty(this.attrs, key, {
        set: value => {
          this.setAttribute(key, String(value));
          this.requestUpdate();
        },
        get: () => {
          return this.getAttribute(key);
        },
      })
    }
  }

  abstract render(): any;

  requestUpdate() {
    if (this.#dirty) return;
    this.#dirty = true;
    queueMicrotask(() => {
      this.#dirty = false;
      this.beforeUpdate?.();
      this.callbacks.beforeUpdate.forEach(cb => cb())
      render(this.render(), this.shadowRoot!)
      this.update?.();
      this.callbacks.update.forEach(cb => cb())
    })
  }

  connectedCallback() {
    this.#handleObservables()
    this.create?.();
    this.callbacks.create.forEach(cb => cb())
    this.requestUpdate();
    this.mount?.();
    this.callbacks.mount.forEach(cb => cb())
  }

  disconnectedCallback() {
    this.destroy?.();
    this.callbacks.destroy.forEach(cb => cb())
    this.#disposables.forEach(disposable => disposable())
  }

  create?(): void;
  mount?(): void;
  beforeUpdate?(): void;
  update?(): void;
  destroy?(): void;

  callbacks: {
    create: Array<() => void>,
    mount: Array<() => void>,
    beforeUpdate: Array<() => void>,
    update: Array<() => void>,
    destroy: Array<() => void>
  } = {
      create: [],
      mount: [],
      beforeUpdate: [],
      update: [],
      destroy: []
    }

  protected addLifecycleCallback(name: keyof typeof this.callbacks, cb: () => void): void {
    this.callbacks[name].push(cb)
  }

  protected addDisposable(disposable: (...args: any) => any): void {
    this.#disposables.push(disposable)
  }

  protected addSubscription(subscription: { subscribe: (callback: () => void) => () => void, value: any }): void {
    this.addDisposable(subscription.subscribe(() => this.requestUpdate()))
    return subscription.value
  }
}


globalThis.h = h;
globalThis.Fragment = Fragment;
