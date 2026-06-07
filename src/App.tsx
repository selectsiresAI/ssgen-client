import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { AuthPage } from '@/pages/AuthPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/AppLayout'

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const AdminPage = lazy(() => import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })))
const PainelGenomicoPage = lazy(() => import('@/pages/PainelGenomicoPage').then((m) => ({ default: m.PainelGenomicoPage })))
const ProvasPage = lazy(() => import('@/pages/ProvasPage').then((m) => ({ default: m.ProvasPage })))
const AuditoriaPage = lazy(() => import('@/pages/AuditoriaPage').then((m) => ({ default: m.AuditoriaPage })))
const BotijaoPage = lazy(() => import('@/pages/BotijaoPage').then((m) => ({ default: m.BotijaoPage })))
const HerdListPage = lazy(() => import('@/pages/HerdListPage').then((m) => ({ default: m.HerdListPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
            <Route path="/painel" element={<Suspense fallback={<PageLoader />}><PainelGenomicoPage /></Suspense>} />
            <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
            <Route path="/lista-rebanho" element={<Suspense fallback={<PageLoader />}><HerdListPage /></Suspense>} />
            <Route path="/herd" element={<Navigate to="/lista-rebanho" replace />} />
            <Route path="/rebanho" element={<Navigate to="/lista-rebanho" replace />} />
            <Route path="/provas" element={<Suspense fallback={<PageLoader />}><ProvasPage /></Suspense>} />
            <Route path="/semen" element={<Suspense fallback={<PageLoader />}><BotijaoPage /></Suspense>} />
            <Route path="/botijao" element={<Navigate to="/semen" replace />} />
            <Route path="/auditoria" element={<Suspense fallback={<PageLoader />}><AuditoriaPage /></Suspense>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  )
}
