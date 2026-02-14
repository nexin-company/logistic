'use client';

import { useState } from 'react';
import { Mapping, mappingsApi, internalItemsApi, catalogApi, type InternalItem, type ExternalProduct } from '@/lib/api';
import { MappingsTable } from './mappings-table';
import { TableSkeleton } from '@/components/table-skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface MappingsPageClientProps {
  initialMappings: Mapping[];
}

export function MappingsPageClient({ initialMappings }: MappingsPageClientProps) {
  const [mappings, setMappings] = useState<Mapping[]>(initialMappings);
  const [isLoading, setIsLoading] = useState(false);
  const [internalItems, setInternalItems] = useState<InternalItem[]>([]);
  const [externalProducts, setExternalProducts] = useState<ExternalProduct[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [items, products] = await Promise.all([
          internalItemsApi.getAll(),
          catalogApi.getAll({ limit: 1000 }),
        ]);
        setInternalItems(items);
        setExternalProducts(products.externalProducts);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await mappingsApi.getAll();
      setMappings(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error al actualizar mapeos:', error);
      setMappings([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <TableSkeleton columns={5} rows={5} />;
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4">
      <div className="flex flex-col gap-3 lg:gap-0 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1" />
        <div className="flex items-center gap-2 sm:w-auto">
          <Button asChild size="sm" className="h-8 gap-1">
            <Link href="/mappings/new">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Agregar Mapeo
              </span>
            </Link>
          </Button>
        </div>
      </div>

      <MappingsTable
        mappings={mappings}
        internalItems={internalItems}
        externalProducts={externalProducts}
        onRefresh={handleRefresh}
      />
    </div>
  );
}

