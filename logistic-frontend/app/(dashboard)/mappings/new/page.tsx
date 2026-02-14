import { internalItemsApi, catalogApi, type InternalItem, type ExternalProduct } from '@/lib/api-server';
import { MappingNewPageClient } from './mapping-new-page-client';

export const dynamic = 'force-dynamic';

export default async function NewMappingPage() {
  let internalItems: InternalItem[] = [];
  let externalProducts: ExternalProduct[] = [];

  try {
    const [items, products] = await Promise.all([
      internalItemsApi.getAll().catch(() => []),
      catalogApi.getAll({ limit: 1000 }).catch(() => ({ externalProducts: [], total: 0, offset: null })),
    ]);
    internalItems = items;
    externalProducts = products.externalProducts;
  } catch (error) {
    console.error('Error loading data:', error);
  }

  return <MappingNewPageClient initialInternalItems={internalItems} initialExternalProducts={externalProducts} />;
}

