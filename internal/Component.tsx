import { h as _h, render, JSX } from 'https://esm.sh/preact'

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
      return h(...args)
    }
  }) as IntrinsicElementCreator
}

export const h = createBetterH(_h)
/**
 * Decorator for properties that should be observed for changes.
 * This decorator is required for properties to be observed.
 * Shortcut for declaring Component.observedProperties.
 */
export function Property(target: any, key: any): void {
  target.constructor.observedProperties.push(key)
}

/**
 * Decorator for attributes that should be observed for changes.
 * This decorator is required for attributes to be observed.
 * Shortcut for declaring Component.observedAttributes.
 * This will always reflect attributes back to the tag and read from it as well.
 */
export function Attribute(target: any, key: any): void {
  target.constructor.observedAttributes.push(key)
}

/**
 * Decorator for methods that should be bound to the component.
 * Shortcut for this.method = this.method.bind(this)
 */
export function Bind(_: any, key: any, { value: fn }: any) {
  // In IE11 calling Object.defineProperty has a side-effect of evaluating the
  // getter for the property which is being replaced. This causes infinite
  // recursion and an "Out of stack space" error.
  let definingProperty = false;
  return {
    configurable: true,
    get() {
      if (definingProperty) {
        return fn;
      }
      let value = fn.bind(this);
      definingProperty = true;
      Object.defineProperty(this, key, {
        value,
        configurable: true,
        writable: true
      });
      definingProperty = false;
      return value;
    }
  };
}

/**
 * Utility function to create a component from a web component.
 * Usually nicer than trying to use a web component directly in an h function.
 * @param tag The tag of the web component
 * @returns A hyperscript component that renders the web component
 */
export function wrapComponent<T>(tag: string) {
  return function Component(props: T) {
    // @ts-ignore tag can be any string!
    return _h(tag, props)
  }
}

/**
 * Decorator for classes that should be defined as a web component.
 * @param tagName The tag name of the web component
 * Generic type is the interface for the component.
 */
type Constructor<T> = new (...args: any[]) => T;
export function Define<T extends Record<any, any>>(tagName: string) {
  return function (constructor: Constructor<T>) {
    // Define the custom element
    customElements.define(tagName, constructor as any);
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
  static observedAttributes: string[] = []
  static observedProperties: string[] = []
  private _props: any = {}

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const styles = document.head.querySelector("#_global_styles")?.textContent || "";
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    if (this.shadowRoot) this.shadowRoot.adoptedStyleSheets = [sheet];
  }

  private handleObservables() {
    for (const prop in this.constructor.observedProperties) {
      const key = this.constructor.observedProperties[prop]
      this._props[key] = this[key]
      Object.defineProperty(this, key, {
        set(value) {
          this._props[key] = value;
          this.requestUpdate();
        },
        get() {
          return this._props[key]
        },
        configurable: true,
        enumerable: true
      })
    }
    for (const attr of this.constructor.observedAttributes) {
      Object.defineProperty(this, attr, {
        set: value => {
          this.setAttribute(attr, value);
          this.requestUpdate();
        },
        get: () => {
          return this.getAttribute(attr);
        },
      })
    }
  }

  abstract render(): any;

  requestUpdate() {
    if (!this.shadowRoot) throw new Error("Shadow root not found")
    render(this.render(), this.shadowRoot);
    this.update?.();
    this.cbmap.update.forEach(cb => cb())
  }

  connectedCallback() {
    if (!this.shadowRoot) throw new Error("Shadow root not found")
    this.handleObservables()
    this.create?.();
    this.cbmap.create.forEach(cb => cb())
    this.render();
    render(this.render(), this.shadowRoot);
    this.mount?.();
    this.cbmap.mount.forEach(cb => cb())
  }

  disconnectedCallback() {
    this.destroy?.();
    this.cbmap.destroy.forEach(cb => cb())
  }

  create?(): void;
  mount?(): void;
  update?(): void;
  destroy?(): void;

  private cbmap: {
    create: Array<() => void>,
    mount: Array<() => void>,
    update: Array<() => void>,
    destroy: Array<() => void>
  } = {
    create: [],
    mount: [],
    update: [],
    destroy: []
  }

  protected addLifecycleCallback(name: keyof typeof this.cbmap, cb: () => void): void {
    this.cbmap[name].push(cb)
  }

  /*
    Effect hook. Basically like useEffect.
    Create an effect in the constructor or anywhere. It will be called on mount, the return value will be called on destroy or next effect.
    If you want to call the effect on update, pass an array of dependencies as the second argument.
  */

  /*
    Memo hook. Basically like useMemo.
    Create a memo in the constructor or anywhere. It will be called on mount, and synchronously before update if the dependencies change.
  */

}
