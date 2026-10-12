'use client';
import { useState } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import { Toaster } from 'sonner';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/query-client';

function BrandToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{ style: { fontFamily: 'inherit', borderRadius: '10px' } }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
        <BrandToaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
