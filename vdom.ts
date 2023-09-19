const vnode = Symbol("isVNode")

function is_primitive(value: any) {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

declare global {
  interface HTMLElement {
    _handlers?: {
			[handler: string]: () => void
		}
  }
}

class Component { }

type v_node = {
  [vnode]: true;
  _type: string | Component
  _props: Record<string, any>;
  _children: Array<v_node | string | number | boolean>;
  _element?: HTMLElement;
  _key?: any;
}

export function h(type: string | Component, props?: any, ...children: any[]): v_node {
  // handle props being an array of children
  if (Array.isArray(props)) {
    children = [...props, children]
    props = {}
  }
  // handle props being a single child
  if (props?.[vnode] === true) {
    children = [props, ...children]
    props = {}
  }
  // handle props being a primitive value
  if (is_primitive(props)) {
    children = [props]
    props = {}
  }
  const r: v_node = {
    [vnode]: true,
    _type: type,
    _props: props || {},
    _children: children.flat(Infinity),
  }
  console.log(r)
  return r
}

function setProps(element: HTMLElement, vnode: v_node) {
  for (const key in vnode._props) {
    if (key.startsWith('on')) {
			if(element._handlers?.[key]) {
				element._handlers[key]()
			}
      const event = key.slice(2).toLowerCase()
      const bound_handler = vnode._props[key].bind(vnode._element)
      element.addEventListener(event, bound_handler);
      element._handlers = element._handlers || {}
      element._handlers[key] = () => element.removeEventListener(event, bound_handler)
    } else {
      element.setAttribute(key, vnode._props[key]);
    }
  }
}

export function render(root: HTMLElement, vnode: v_node, old_vnode?: v_node) {
	if (old_vnode) {
		patch(old_vnode, vnode)
		return
	}
  if (vnode._type instanceof Component) {
    throw new Error("Components are not supported yet")
  }

  if (is_primitive(vnode)) {
    root.textContent += vnode.toString()
    return
  }

  const element = document.createElement(vnode._type)
  vnode._element = element

  // set props
  setProps(element, vnode)

  // mount children
  for (const child of vnode._children) {
    render(element, child)
  }

  root.appendChild(element)
  return element
}

export function patch(n1: v_node, n2: v_node): void {
  const element = (n2._element = n1._element)
  if (!element) {
    throw new Error("Cannot patch an element that is not mounted")
  }

  if (!n2) {
    unmount(n1)
    return
  }

  if (!n1) {
    render(element.parentElement!, n2)
    return
  }

  // If types differ, replace the old DOM element with a new one
  if (n1._type !== n2._type) {
    render(element.parentElement!, n2);
    unmount(n1);
    return;
  }

  // update element props

  for (const key in n1._props) {
    if (!(key in n2._props)) {
      element.removeAttribute(key);
    }
  }
	setProps(element, n2)
  // update children
  const common_length = Math.min(n1._children.length, n2._children.length)
  for (let i = 0; i < common_length; i++) {
    // n1 is a primitive
    if (is_primitive(n1._children[i])) {
      // n2 is a primitive
      if (is_primitive(n2._children[i])) {
        element.textContent = n2._children[i].toString()
      }
      // n2 is a vnode
      else {
        element.textContent = ""
        render(element, n2._children[i])
      }
    }
    // n1 is a vnode
    else {
      if (is_primitive(n2._children[i])) {
        unmount(n1._children[i])
        element.textContent += n2._children[i].toString()
      } else {
        patch(n1._children[i], n2._children[i])
      }
    }
  }
}

export function unmount(element: HTMLElement | v_node) {
  if (element instanceof HTMLElement) {
    element.remove();
    Object.values(element._handlers).forEach(handler => handler())
  } else if (element._element instanceof HTMLElement) {
    element._element.remove();
    Object.values(element._element._handlers).forEach(handler => handler())
  }
}


//// VDOM 1 ---------------------------------
// export const vdom1 = h(
//   'h1',
//   { class: 'text-orange-500 text-3xl font-bold' },
//   'Vue.js Amsterdam 🧡', " lol", h("div", "hehe")
// );

// // VDOM 2 ---------------------------------
// export const vdom2 = h(
//   'button',
//   {
//     class: 'bg-gray-200 p-2 rounded',
//     onClick: () => alert('🤘'),
//   },
//   'Click here 🎉'
// );

// // VDOM 3 ---------------------------------
// export const vdom3 = h(
//   'div',
//   { class: 'bg-gray-800 rounded-full p-6' },
//   h('h1', { class: 'text-6xl' }, '🍕')
// );

//// VDOM 4 ---------------------------------
// export const vdom4 = h('div', { class: 'bg-gray-800 rounded p-4' }, 
//   h('h1', { class: 'text-white text-2xl' }, 'Yummy foods'),
//   h('ol', { class: 'list-decimal text-white ml-4' },[
//     h('li', null, '🍕'),
//     h('li', null, '🍔'),
//     h('li', null, '🌮'),
//     h('li', null, '🍟'),
// ]),
// );

// // VDOM 5 ---------------------------------
// const ducks = h('span', { class: 'text-3xl' }, '🦆🦆🦆');
// const monkeys = h('span', { class: 'text-3xl' }, '🙈🙊🙉');
// const goats = h('span', { class: 'text-3xl' }, '🐐🐐🐐');
// export const vdom5 = h('div', { class: 'text-center rounded p-4' }, [
//   h(
//     'h1',
//     { class: 'text-2xl font-bold' },
//     "I don't have no time for no monkey business"
//   ),
//   h('div', null, [ducks, monkeys, goats]),
//   h(
//     'button',
//     {
//       class: 'text-3xl bg-gray-200 p-2 rounded mt-4',
//       onClick: () => unmount(monkeys),
//     },
//     '🚫🐒'
//   ),
// ]);

// // VDOM 7 ---------------------------------
// export const vdom6 = h('div', { class: 'flex flex-col items-center' },
//   h('h1', { class: 'font-bold' }, "It's not a bug..."),
//   h('p', { class: 'text-5xl my-4' }, '🐛'),
//   h(
//     'button',
//     {
//       class: 'bg-black text-white p-2 rounded hover:bg-orange-500',
//       onClick: () => patch(vdom6, vdom6_patch)
//     },
//     'Patch 🩹'
//   ),
// );
// export const vdom6_patch = h('div', { class: 'flex flex-col items-center' },
//   h('h1', { class: 'font-bold' }, "... it's a feature!"),
//   h('div', { class: 'text-5xl' }, '✨'),
//   h('div', { class: 'text-5xl' }, '✨'),
//   h('div', { class: 'text-5xl' }, '✨'),
//   h('div', { class: 'text-5xl' }, '✨'),
// );

// if (typeof document !== 'undefined') {
//   const root = document.createElement('div');
//   root.id = 'root';
//   document.body.appendChild(root);
//   mount(root, vdom6)
// }