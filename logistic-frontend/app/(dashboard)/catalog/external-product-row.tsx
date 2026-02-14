'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { ExternalProduct as ExternalProductType, catalogApi } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useState } from 'react';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import Link from 'next/link';

interface ExternalProductProps {
  externalProduct: ExternalProductType;
  onRefresh: () => void;
}

export function ExternalProduct({ externalProduct, onRefresh }: ExternalProductProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await catalogApi.delete(externalProduct.id);
      toast.success('Producto externo eliminado correctamente');
      onRefresh();
    } catch (error) {
      console.error('Error al eliminar producto externo:', error);
      toast.error('Error al eliminar el producto externo');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 capitalize">Activo</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 capitalize">Inactivo</Badge>;
      case 'archived':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 capitalize">Archivado</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{externalProduct.sku}</TableCell>
        <TableCell>{externalProduct.name}</TableCell>
        <TableCell>
          {getStatusBadge(externalProduct.status)}
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {`${externalProduct.currency} ${externalProduct.basePrice.toFixed(2)}`}
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {externalProduct.currency}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Menú de acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/catalog/${externalProduct.id}/edit`}>Editar</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Eliminar producto externo"
        description={`¿Estás seguro de que deseas eliminar el producto externo "${externalProduct.name}"? Esta acción no se puede deshacer.`}
        isLoading={isDeleting}
      />
    </>
  );
}

