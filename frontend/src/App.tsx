import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProjectProvider } from './context/ProjectContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Layout } from './components/layout/Layout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { RequirementAnalyzerPage } from './pages/RequirementAnalyzerPage';
import { TaskPlannerPage } from './pages/TaskPlannerPage';
import { ImplementationGuidePage } from './pages/ImplementationGuidePage';
import { TestCaseGeneratorPage } from './pages/TestCaseGeneratorPage';
import { CodeReviewPage } from './pages/CodeReviewPage';
import { ActivityHistoryPage } from './pages/ActivityHistoryPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <ProjectProvider>
              <Routes>
                {/* Public Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Application Workspace */}
                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/requirements" element={<RequirementAnalyzerPage />} />
                  <Route path="/tasks" element={<TaskPlannerPage />} />
                  <Route path="/guidance" element={<ImplementationGuidePage />} />
                  <Route path="/testing" element={<TestCaseGeneratorPage />} />
                  <Route path="/code-review" element={<CodeReviewPage />} />
                  <Route path="/activity" element={<ActivityHistoryPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ProjectProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
