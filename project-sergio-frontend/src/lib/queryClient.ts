// src/lib/queryClient.ts
// Configuración central de React Query.
// Importa este archivo en main.tsx y envuelve la app con QueryClientProvider.

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Considera los datos frescos por 5 minutos
      staleTime:          1000 * 60 * 5,
      // Reintenta 1 vez si falla (no 3 como por defecto)
      retry:              1,
      // No refetch al volver a enfocar la ventana (opcional, cámbialo si quieres)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})