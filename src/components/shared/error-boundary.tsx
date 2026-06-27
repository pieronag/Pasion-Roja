'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <AlertTriangle className="h-16 w-16 text-[var(--accent)] mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text)] mb-2">Algo salió mal</h3>
          <p className="text-[var(--text-secondary)] max-w-md mb-6">Ocurrió un error inesperado. Intenta de nuevo.</p>
          <Button onClick={() => this.setState({ hasError: false })}>Reintentar</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
