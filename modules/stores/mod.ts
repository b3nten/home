import { assert } from "https://deno.land/std@0.198.0/assert/assert.ts";

type Subscription = (value: any) => void;
type UnSubscription = () => void;

/** 
 *  @pure Returns true if value is a primitive
*/
function p_is_primitive(value: any): boolean {
  return value !== Object(value);
}

/**
 *  @pure Creates a deep proxy
 */
function p_create_deep_proxy(target: any, onChange: Function): any {
	let proxyCache = new WeakMap();
  return new Proxy(target, {
    get(target: any, property: any) {
      const item = target[property];
      if (item && typeof item === 'object') {
        if (proxyCache.has(item)) return proxyCache.get(item);
        const proxy = p_create_deep_proxy(item, onChange);
        proxyCache.set(item, proxy);
        return proxy;
      }
      return item;
    },
    set(target, property, newValue) {
			if (Array.isArray(target) && property === 'length') {
        // Check if the length actually changes
        if (target.length !== newValue) {
          target.length = newValue;
          onChange();
        }
      } else {
        if (target[property] !== newValue) {
          target[property] = newValue;
          onChange();
        }
      }
      return true;
    },
  });
}

/**
 * Creates a store
 */
export default class Store<T> {
	// Internal
  #value: any;
	// @ts-expect-error - Value is defined via Object.defineProperty
	value: T;
  #subscribers = new Set<Subscription>();
  constructor(value: T) {
		if(p_is_primitive(value)) {
			this.#value = value
		} else {
			this.#value = p_create_deep_proxy(value, () => {
				for (const subscriber of this.#subscribers) subscriber(this.#value);
			})
		}
    Object.defineProperty(this, "value", {
      get() {
        return this.#value;
      },
      set(value) {
				// If value is a primitive, a simple assignment will do
        if (p_is_primitive(value)) {
          this.#value = value;
        } // Value is not primitive, set up a deep proxy
        else {
					this.#value = p_create_deep_proxy(value, () => {
						for (const subscriber of this.#subscribers) subscriber(this.#value);
					})
        }
        for (const subscriber of this.#subscribers) subscriber(this.#value);
      },
    });
  }
  subscribe(subscription: Subscription): UnSubscription {
    this.#subscribers.add(subscription);
    return () => {
      this.#subscribers.delete(subscription);
    };
  }
}