import { createClient } from '@insforge/sdk';

const baseUrl = 'https://i5jqzbx6.us-east.insforge.app';
const anonKey = 'anon_222bdcf4c41d9b468d8e68a8d7492f49751b42070a2ff5e74dcba8b815dfa71b';

const insforge = createClient({
  baseUrl,
  anonKey,
});

console.log('Probando firma de onAuthStateChange:');
const result = insforge.auth.onAuthStateChange((event, session) => {
  console.log('Cambio detectado:', event, session);
});
console.log('Retorno de onAuthStateChange:', result);
if (result && result.data && result.data.subscription) {
  result.data.subscription.unsubscribe();
  console.log('Unsubscribed exitosamente.');
}
