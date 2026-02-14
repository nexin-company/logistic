'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalProductForm } from '../external-product-form';

export function ExternalProductNewPageClient() {
  const router = useRouter();

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo producto externo</CardTitle>
          <CardDescription>Crea un producto externo para el catálogo de ventas.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExternalProductForm
            externalProduct={null}
            onCancel={() => router.push('/catalog')}
            onSuccess={() => router.push('/catalog')}
          />
        </CardContent>
      </Card>
    </div>
  );
}

