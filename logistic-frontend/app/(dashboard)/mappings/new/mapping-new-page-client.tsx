'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MappingForm } from '../mapping-form';
import type { InternalItem, ExternalProduct } from '@/lib/api';

export function MappingNewPageClient({ 
  initialInternalItems, 
  initialExternalProducts 
}: { 
  initialInternalItems: InternalItem[];
  initialExternalProducts: ExternalProduct[];
}) {
  const router = useRouter();

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo mapeo</CardTitle>
          <CardDescription>Crea un mapeo entre un item interno (Factory) y un producto externo (Inventory).</CardDescription>
        </CardHeader>
        <CardContent>
          <MappingForm
            internalItems={initialInternalItems}
            externalProducts={initialExternalProducts}
            onCancel={() => router.push('/mappings')}
            onSuccess={() => router.push('/mappings')}
          />
        </CardContent>
      </Card>
    </div>
  );
}

