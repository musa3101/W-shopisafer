import { createClient } from '@insforge/sdk';

const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_INSFORGE_URL) || 'https://i5jqzbx6.us-east.insforge.app';
const anonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_INSFORGE_ANON_KEY) || 'anon_222bdcf4c41d9b468d8e68a8d7492f49751b42070a2ff5e74dcba8b815dfa71b';

export const insforge = createClient({
  baseUrl,
  anonKey,
});
