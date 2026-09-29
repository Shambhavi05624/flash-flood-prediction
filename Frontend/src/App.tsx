import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { PredictionPage } from './pages/PredictionPage';
import { MapPage } from './pages/MapPage';
import { LocationDetailsPage } from './pages/LocationDetailsPage';
import { PredictionResultPage } from './pages/PredictionResultPage';
import { HistoricalPage } from './pages/HistoricalPage';
import { AlertsPage } from './pages/AlertsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ModelInfoPage } from './pages/ModelInfoPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="predict" element={<PredictionPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="location/:id" element={<LocationDetailsPage />} />
          <Route path="location" element={<Navigate to="/location/ranchi-subarnarekha" replace />} />
          <Route path="result" element={<PredictionResultPage />} />
          <Route path="historical" element={<HistoricalPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="model-info" element={<ModelInfoPage />} />
          <Route path="data-sources" element={<DataSourcesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
