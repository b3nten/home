const GLOBAL_CACHE = new Map<string, any>();

type QueryOptions = {
	refreshInterval?: number;
	refreshOnMount?: boolean;
	refreshOnWindowFocus?: boolean;
	refreshOnReconnect?: boolean;
};

// todo: add subscribe/unsubscribe functionality
// todo: hash function for key
// todo: GLOBAL_CACHE should be a class
// todo: Cache class should have a method to clear cache
// todo: Allow multiple caches

export default class Query<T> {
	#component?: { requestUpdate: () => void };
  #key?: string;
  #fn?: Function;
  #promise?: Promise<any>;
  #pending: boolean = false;
  #success: boolean = false;
  #error: any = false;
  #data?: T = undefined;
  #idle: boolean = true;

  get key() {
    return this.#key;
  }
  get promise() {
    return this.#promise;
  }
  get pending() {
    return this.#pending;
  }
  get success() {
    return this.#success;
  }
  get error() {
    return this.#error;
  }
  get data() {
    return this.#data;
  }
  get idle() {
    return this.#idle;
  }

  constructor(
    component: { requestUpdate: () => void },
    key: string,
    fn: () => Promise<T>,
    options: QueryOptions = {},
  ) {
    if (GLOBAL_CACHE.has(key)) {
      const cache = GLOBAL_CACHE.get(key);
      if (cache instanceof Query) {
        return cache;
      }
    } else {
      GLOBAL_CACHE.set(key, this);
    }
    this.#key = key;
    this.#fn = fn;
		this.#component = component;
  }

  fetch() {
    this.#pending = true;
    this.#idle = false;
		this.#component?.requestUpdate();
    this.#promise = this.#fn?.().then((data: T) => {
      this.#data = data;
      this.#pending = false;
      this.#success = true;
      this.#idle = true;
    }).catch((err: any) => {
      this.#error = err;
    }).finally(() => {
			this.#idle = true;
			this.#promise = undefined;
			this.#component?.requestUpdate();
		});
  }
}

function fakeFetch() {
  return new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      resolve("hello");
    }, 10000);
  });
}
