import { catalogApi, type ExternalProduct } from '@/lib/api-server';
import { ExternalProductEditPageClient } from './external-product-edit-page-client';

export const dynamic = 'force-dynamic';

export default async function EditExternalProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);

  const externalProduct: ExternalProduct = await catalogApi.getById(id);

  return <ExternalProductEditPageClient externalProduct={externalProduct} />;
}

