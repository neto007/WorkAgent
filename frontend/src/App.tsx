import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ClientProvider } from '@/contexts/ClientContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import { Loader2 } from 'lucide-react';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const AgentsPage = lazy(() => import('@/pages/AgentsPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const MCPServersPage = lazy(() => import('@/pages/MCPServersPage'));
const DocsPage = lazy(() => import('@/pages/DocsPage'));
const WorkflowEditorPage = lazy(() => import('@/pages/WorkflowEditorPage'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const ClientsPage = lazy(() => import('@/pages/ClientsPage'));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-[#0b0b11]">
    <Loader2 className="h-8 w-8 animate-spin text-[#bd93f9]" />
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ClientProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Workflow route - fullscreen without layout */}
              <Route
                path="/agents/workflow/:agentId"
                element={
                  <ProtectedRoute>
                    <WorkflowEditorPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected routes with layout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chat/:agentId" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/mcp-servers" element={<MCPServersPage />} />
                <Route path="/documentation" element={<DocsPage />} />
                <Route path="/clients" element={<ClientsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Toaster />
        </BrowserRouter>
      </ClientProvider>
    </AuthProvider>
  );
};

export default App;
