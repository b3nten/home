import { assert } from "https://deno.land/std@0.198.0/assert/assert.ts";
import Store from "./mod.ts";

let checker: any = null;
const store = new Store(0);
store.subscribe((value) => {
  checker = value;
});
store.value = 1;
assert(checker === 1);
store.value = 2;
assert(checker === 2);
const obj_store = new Store({ a: 1, b: 2 });
obj_store.subscribe((value) => {
  checker = value;
});
obj_store.value.a = 2;
assert(checker.a === 2);
assert(checker.b === 2);
obj_store.value.b = 3;
assert(checker.b === 3);
assert(checker.a === 2);
// @ts-ignore
obj_store.value = "lol";
assert(checker === "lol");
obj_store.value = { a: 1, b: 2 };
assert(checker.a === 1);
assert(checker.b === 2);
obj_store.value.a = 2;
assert(checker.a === 2);
assert(checker.b === 2);
obj_store.value.b = 3;
assert(checker.b === 3);
assert(checker.a === 2);
const array_store = new Store([1, 2, 3]);
array_store.subscribe((value) => {
  checker = value;
});
array_store.value.push(4);
assert(checker[0] === 1);
assert(checker[1] === 2);
assert(checker[2] === 3);
assert(checker[3] === 4);
array_store.value.length = 0;
assert(checker.length === 0);
array_store.value = [1, 2, 3];
assert(checker[0] === 1);
assert(checker[1] === 2);
assert(checker[2] === 3);
array_store.value.push(4);
assert(checker[0] === 1);
assert(checker[1] === 2);
assert(checker[2] === 3);
assert(checker[3] === 4);
