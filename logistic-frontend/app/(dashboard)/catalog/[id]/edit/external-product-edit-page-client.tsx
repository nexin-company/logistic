'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalProductForm } from '../../external-product-form';
import type { ExternalProduct } from '@/lib/api';

export function ExternalProductEditPageClient({ externalProduct }: { externalProduct: ExternalProduct }) {
  const router = useRouter();

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar producto externo</CardTitle>
          <CardDescription>Actualiza la información del producto externo.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExternalProductForm
            externalProduct={externalProduct}
            onCancel={() => router.push('/catalog')}
            onSuccess={() => router.push('/catalog')}
          />
        </CardContent>
      </Card>
    </div>
  );
}

