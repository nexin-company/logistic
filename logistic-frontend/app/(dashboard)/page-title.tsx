'use client';

import { usePathname } from 'next/navigation';

export function PageTitle() {
  const pathname = usePathname();
  
  const pageTitles: Record<string, string> = {
    '/': 'Home',
    '/catalog': 'Catálogo',
    '/warehouses': 'Almacenes',
    '/stock': 'Stock',
    '/mappings': 'Mapeos',
    '/shipments': 'Embarques',
    '/users': 'Usuarios',
    '/settings': 'Configuración'
  };
  
  let title = pageTitles[pathname];
  
  if (!title) {
    const matchingPath = Object.keys(pageTitles).find(path => 
      pathname.startsWith(path) && path !== '/'
    );
    title = matchingPath ? pageTitles[matchingPath] : 'Home';
  }
  
  return (
    <h1 className="font-semibold text-lg md:text-xl hidden md:block">
      {title}
    </h1>
  );
}

