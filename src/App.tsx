import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute, PublicRoute } from '@/routes/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { TodayPage } from '@/pages/TodayPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { EventsPage } from '@/pages/EventsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { HabitDetailPage } from '@/pages/HabitDetailPage'
import { JournalPage } from '@/pages/JournalPage'
import { SettingsPage } from '@/pages/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
            <Routes>
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Navigate to="/today" replace />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="/today" element={<ProtectedRoute><AppLayout><TodayPage /></AppLayout></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><AppLayout><CalendarPage /></AppLayout></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><AppLayout><EventsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
              <Route path="/journal" element={<ProtectedRoute><AppLayout><JournalPage /></AppLayout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/habits/:id" element={<ProtectedRoute><AppLayout><HabitDetailPage /></AppLayout></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/today" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
