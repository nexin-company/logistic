'use client';

import { useState } from 'react';
import { ExternalProduct, catalogApi } from '@/lib/api';
import { ExternalProductsTable } from './catalog-table';
import { TableSkeleton } from '@/components/table-skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { File, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { TableSearch } from '@/components/table-search';

interface ExternalProductsPageClientProps {
  initialExternalProducts: ExternalProduct[];
  initialTotal: number;
  initialOffset: number | null;
  initialSearch: string;
  initialStatus?: 'active' | 'inactive' | 'archived';
}

export function ExternalProductsPageClient({
  initialExternalProducts,
  initialTotal,
  initialOffset,
  initialSearch,
  initialStatus,
}: ExternalProductsPageClientProps) {
  const [externalProducts, setExternalProducts] = useState<ExternalProduct[]>(initialExternalProducts);
  const [total, setTotal] = useState(initialTotal);
  const productsPerPage = 5;
  const [currentOffset, setCurrentOffset] = useState(initialOffset ?? productsPerPage);
  const [nextOffset, setNextOffset] = useState<number | null>(initialOffset);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'all' | 'active' | 'inactive' | 'archived'>(
    initialStatus || 'all'
  );
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');

  const handleRefresh = async (
    statusFilter?: 'active' | 'inactive' | 'archived',
    searchValue?: string,
    offsetOverride?: number
  ) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const resolvedOffset = offsetOverride !== undefined ? offsetOverride : currentOffset;
      const currentSearch = searchValue !== undefined ? searchValue : searchTerm;
      const filterStatus = statusFilter || (currentStatus !== 'all' ? currentStatus : undefined);
      
      const result = await catalogApi.getAll({
        search: currentSearch,
        offset: resolvedOffset === 0 ? undefined : resolvedOffset,
        status: filterStatus,
        limit: 5,
      });
      
      setExternalProducts(Array.isArray(result.externalProducts) ? result.externalProducts : []);
      setTotal(result.total || 0);
      setCurrentOffset(resolvedOffset || productsPerPage);
      setNextOffset(result.offset ?? null);
    } catch (error) {
      console.error('Error al actualizar productos externos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value as 'all' | 'active' | 'inactive' | 'archived';
    setCurrentStatus(newStatus);
    setCurrentOffset(productsPerPage);
    handleRefresh(newStatus !== 'all' ? newStatus : undefined, undefined, 0);
  };

  const handleSearch = (value: string) => {
    if (value === searchTerm) return;
    setSearchTerm(value);
    handleRefresh(currentStatus !== 'all' ? currentStatus : undefined, value, 0);
  };

  const handlePrevPage = () => {
    const newOffset = Math.max(productsPerPage, currentOffset - productsPerPage);
    handleRefresh(
      currentStatus !== 'all' ? currentStatus : undefined,
      searchTerm,
      newOffset - productsPerPage
    );
    setCurrentOffset(newOffset);
  };

  const handleNextPage = () => {
    if (nextOffset === null) return;
    handleRefresh(currentStatus !== 'all' ? currentStatus : undefined, searchTerm, nextOffset);
    setCurrentOffset(nextOffset);
  };

  if (isLoading) {
    return <TableSkeleton columns={6} rows={5} />;
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4">
      <div className="flex flex-col gap-3 lg:gap-0 lg:flex-row lg:items-center lg:justify-between">
        <Tabs defaultValue={currentStatus} value={currentStatus} onValueChange={handleStatusChange}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Activos</TabsTrigger>
            <TabsTrigger value="inactive">Inactivos</TabsTrigger>
            <TabsTrigger value="archived" className="hidden sm:flex">
              Archivados
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="max-w-xl w-full sm:w-64 md:w-80">
            <TableSearch
              placeholder="Buscar productos externos..."
              initialValue={searchTerm}
              onSearch={handleSearch}
            />
          </div>
          <div className="flex items-center gap-2 sm:w-auto">
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Exportar
              </span>
            </Button>
            <Button asChild size="sm" className="h-8 gap-1">
              <Link href="/catalog/new">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Agregar Producto
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <ExternalProductsTable
        externalProducts={externalProducts}
        total={total}
        currentOffset={currentOffset}
        nextOffset={nextOffset}
        onRefresh={() => handleRefresh(currentStatus !== 'all' ? (currentStatus as any) : undefined)}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
}

