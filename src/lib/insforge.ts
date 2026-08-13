import { createClient } from "@insforge/sdk";

const getEnvVar = (key: string): string => {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return "";
};

const baseUrl = getEnvVar("VITE_INSFORGE_URL") || "https://i5jqzbx6.us-east.insforge.app";
const anonKey = getEnvVar("VITE_INSFORGE_ANON_KEY") || "anon_222bdcf4c41d9b468d8e68a8d7492f49751b42070a2ff5e74dcba8b815dfa71b";

export const insforge = createClient({
  baseUrl,
  anonKey,
});
