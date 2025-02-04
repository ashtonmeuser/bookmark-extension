import { helper } from "./helper.js";

async function injectedFunction(arg1, arg2) {
  console.log("Injected script running with:", arg1, arg2);
  console.log(helper(arg1));
}

await Promise.resolve("asdf");

console.log(helper(css));

// export async function test() {
//   await Promise.resolve("asdf");
//   console.log(helper("test"));
// };
