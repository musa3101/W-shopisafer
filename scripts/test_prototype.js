import { createClient } from "@insforge/sdk";

const baseUrl = "https://i5jqzbx6.us-east.insforge.app";
const anonKey =
  "anon_222bdcf4c41d9b468d8e68a8d7492f49751b42070a2ff5e74dcba8b815dfa71b";

const insforge = createClient({
  baseUrl,
  anonKey,
});

console.log("--- Auth Prototype ---");
let obj = insforge.auth;
while (obj) {
  console.log(Object.getOwnPropertyNames(obj));
  obj = Object.getPrototypeOf(obj);
}
