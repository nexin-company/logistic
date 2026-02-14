import { catalogApi, type ExternalProduct } from '@/lib/api-server';
import { ExternalProductsPageClient } from './catalog-page-client';

export const dynamic = 'force-dynamic';

export default async function ExternalProductsPage(props: {
  searchParams?: Promise<{ q?: string; offset?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams?.q ?? '';
  const offset = searchParams?.offset ? Number(searchParams.offset) : 0;
  const status = searchParams?.status as 'active' | 'inactive' | 'archived' | undefined;

  let result = { externalProducts: [] as ExternalProduct[], total: 0, offset: null as number | null };
  
  try {
    result = await catalogApi.getAll({
      search,
      offset,
      status,
      limit: 5,
    });
  } catch (error) {
    console.error('Error fetching external products:', error);
  }

  return (
    <ExternalProductsPageClient
      initialExternalProducts={result.externalProducts}
      initialTotal={result.total}
      initialOffset={result.offset}
      initialSearch={search}
      initialStatus={status}
    />
  );
}

