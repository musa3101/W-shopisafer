import { createClient } from '@insforge/sdk';

const baseUrl = 'https://i5jqzbx6.us-east.insforge.app';
const anonKey = 'anon_222bdcf4c41d9b468d8e68a8d7492f49751b42070a2ff5e74dcba8b815dfa71b';

const insforge = createClient({
  baseUrl,
  anonKey,
});

async function run() {
  const { data: products, error } = await insforge.database
    .from('products')
    .select('*');

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${products.length} products:`);
  products.forEach((p, i) => {
    console.log(`${i+1}. Name: "${p.name}", Price: ${p.price}, Images: ${JSON.stringify(p.images)}`);
  });
}

run();
