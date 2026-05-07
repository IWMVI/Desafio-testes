import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement, ReactNode } from "react";

export function criarClienteConsultasTeste(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface EnvolveConsultasProps {
  children: ReactNode;
  cliente?: QueryClient;
}

export function EnvolveConsultas({ children, cliente }: EnvolveConsultasProps): ReactElement {
  const c = cliente ?? criarClienteConsultasTeste();
  return <QueryClientProvider client={c}>{children}</QueryClientProvider>;
}
