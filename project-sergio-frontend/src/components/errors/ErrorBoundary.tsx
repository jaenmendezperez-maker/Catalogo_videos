// src/components/ErrorBoundary.tsx
// Atrapa errores inesperados en cualquier parte de la app
// y muestra una UI amigable en vez de una pantalla en blanco.
//
// Uso en main.tsx:
//   <ErrorBoundary>
//     <App />
//   </ErrorBoundary>

import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children:  ReactNode
  fallback?: ReactNode   // UI personalizada opcional
}

interface State {
  hasError: boolean
  error?:   Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Aquí puedes enviar el error a un servicio como Sentry
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen bg-[#070F1C] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Algo salió mal</h1>
            <p className="text-slate-400 text-sm mb-2">
              Ocurrió un error inesperado en la aplicación.
            </p>
            {this.state.error && (
              <p className="text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="bg-cyan-500 hover:bg-cyan-400 text-[#070F1C] font-semibold px-6 py-3 rounded-xl text-sm transition-all"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary