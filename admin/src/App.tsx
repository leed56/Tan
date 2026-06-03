import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { initAuthListener } from './services/authService';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './screens/auth/ProtectedRoute';
import { LoginPage } from './screens/LoginPage';
import { DashboardPage } from './screens/DashboardPage';
import { CurriculumPage } from './screens/CurriculumPage';
import { QuestionsPage } from './screens/QuestionsPage';
import { StudentsPage } from './screens/StudentsPage';
import { SubscriptionsPage } from './screens/SubscriptionsPage';
import { AnalyticsPage } from './screens/AnalyticsPage';
import { ContentPage } from './screens/ContentPage';
import { NotificationsPage } from './screens/NotificationsPage';
import { SettingsPage } from './screens/SettingsPage';

export default function App() {
  useEffect(() => {
    const unsubscribe = initAuthListener();
    return unsubscribe;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route
              path="curriculum"
              element={
                <ProtectedRoute roles={['super_admin', 'content_editor']}>
                  <CurriculumPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="questions"
              element={
                <ProtectedRoute roles={['super_admin', 'content_editor']}>
                  <QuestionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="students"
              element={
                <ProtectedRoute roles={['super_admin', 'viewer']}>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="subscriptions"
              element={
                <ProtectedRoute roles={['super_admin']}>
                  <SubscriptionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <ProtectedRoute roles={['super_admin', 'viewer']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="content"
              element={
                <ProtectedRoute roles={['super_admin', 'content_editor']}>
                  <ContentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="notifications"
              element={
                <ProtectedRoute roles={['super_admin']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute roles={['super_admin']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
