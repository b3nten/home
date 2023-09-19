import { h as _h, render, JSX } from 'https://esm.sh/preact'

type ElementProps<T extends keyof JSX.IntrinsicElements> = JSX.IntrinsicElements[T] & {
  [key: string]: any;
};

type IntrinsicElementCreator = {
  [K in keyof JSX.IntrinsicElements]: (
    attrs: ElementProps<K> | string | number | boolean | undefined | JSX.Element | null,
    ...children: any[]
  ) => any;
};


export function createBetterH(h: any) {
  return new Proxy(h, {
    get: function (_, prop: string) {
      return function (attrs: any, ...children: any[]) {
        if (attrs && attrs["type"] || typeof attrs !== 'object' || Array.isArray(attrs)) {
          attrs = { children: [attrs, ...children] }
        } else if (children) {
          attrs.children = attrs.children || []
          attrs.children = [...attrs.children, ...children]
        }
        return h(prop, attrs)
      }
    }
  }) as IntrinsicElementCreator
}

export function Property(target: any, key: any) {
  target.constructor.observedProperties.push(key)
}

export function Attribute(target: any, key: any) {
  target.constructor.observedAttributes.push(key)
}

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

// define a web component (and set property types)
type Constructor<T> = new (...args: any[]) => T;
export function Define<T extends Record<any, any>>(tagName: string) {
  return function (constructor: Constructor<T>) {
    // Define the custom element
    customElements.define(tagName, constructor as any);
  };
}


abstract class Component extends HTMLElement {
  static observedAttributes: string[] = []
  static observedProperties: string[] = []
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  private _props: any = {}
  private handleObservables() {
    for (const prop in this.constructor.observedProperties) {
      const key = this.constructor.observedProperties[prop]
      this._props[key] = this[key]
      Object.defineProperty(this, key, {
        set(value){
          this._props[key] = value;
          this.update();
        },
        get(){
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
          this.update();
        },
        get: () => {
          return this.getAttribute(attr);
        },
      })
    }
  }
  abstract render(): any;
  connectedCallback() {
    if (!this.shadowRoot) throw new Error("Shadow root not found")
    this.handleObservables()
    this.render();
    render(this.render(), this.shadowRoot);
  }
  update() {
    if (!this.shadowRoot) throw new Error("Shadow root not found")
    render(this.render(), this.shadowRoot);
  }
}

const h = createBetterH(_h)
globalThis.h = h
globalThis.Component = Component
globalThis.Property = Property
globalThis.Attribute = Attribute
globalThis.Bind = Bind
globalThis.Define = Define

const __h = h
const __component = Component
const __property = Property
const __attribute = Attribute
const __bind = Bind
const __define = Define

declare global {
  var h: typeof __h;
  var Component: typeof __component;
  var Property: typeof __property;
  var Attribute: typeof __attribute;
  var Bind: typeof __bind;
  var Define: typeof __define;
}
